import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  input,
  output,
  type Provider,
} from "@angular/core";
import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { BpdmButton } from "../button/button";
import { BpdmOverlayPanel } from "../overlay/overlay-panel";

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as destructive (red). */
  destructive?: boolean;
}

// --- i18n ---
export interface ConfirmMessages {
  /** Fallback title when a call omits `title`. */
  title: string;
  /** Confirm button text when a call omits `confirmText`. */
  confirm: string;
  /** Cancel button text when a call omits `cancelText`. */
  cancel: string;
  /** aria-label for the dialog's close button. */
  close: string;
}

export const DEFAULT_CONFIRM_MESSAGES: ConfirmMessages = {
  title: "Are you sure?",
  confirm: "Confirm",
  cancel: "Cancel",
  close: "Close",
};

/** App-wide localizable defaults for `BpdmConfirm`; per-call options still win. */
export const BPDM_CONFIRM_MESSAGES = new InjectionToken<Partial<ConfirmMessages>>(
  "BPDM_CONFIRM_MESSAGES",
);

/** Provide app-wide confirm-dialog message defaults. */
export function provideBpdmConfirmMessages(messages: Partial<ConfirmMessages>): Provider {
  return { provide: BPDM_CONFIRM_MESSAGES, useValue: messages };
}

let cid = 0;

const PANEL_CLASS =
  "relative z-50 flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-sm flex-col rounded-xl bg-popover text-popover-foreground shadow-xl outline-none";
const ENTER = "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]";
const EXIT = "animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in_forwards]";

/** Internal panel for the confirm service. Reuses the shared overlay surface. */
@Component({
  selector: "bpdm-confirm-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmOverlayPanel, BpdmButton],
  host: { class: "contents" },
  template: `
    <bpdm-overlay-panel
      [title]="title()"
      [description]="description()"
      [footer]="footerTpl"
      [showClose]="true"
      [labelId]="labelId()"
      [descId]="descId()"
      [closing]="closing()"
      [panelClass]="panelClass"
      [enterAnim]="enterAnim"
      [exitAnim]="exitAnim"
      [closeLabel]="closeLabel()"
      [fallbackTitle]="fallbackTitle()"
      (dismiss)="cancel.emit()"
    />
    <ng-template #footerTpl>
      <button bpdmButton variant="secondary" appearance="ghost" (click)="cancel.emit()">{{ cancelText() }}</button>
      <button
        bpdmButton
        [variant]="destructive() ? 'destructive' : 'primary'"
        (click)="confirm.emit()"
      >
        {{ confirmText() }}
      </button>
    </ng-template>
  `,
})
class BpdmConfirmPanel {
  readonly title = input("");
  readonly description = input("");
  readonly confirmText = input("Confirm");
  readonly cancelText = input("Cancel");
  readonly destructive = input(false);
  readonly closeLabel = input("Close");
  readonly fallbackTitle = input("Are you sure?");
  readonly labelId = input("");
  readonly descId = input("");
  readonly closing = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly panelClass = PANEL_CLASS;
  protected readonly enterAnim = ENTER;
  protected readonly exitAnim = EXIT;
}

/**
 * Imperative confirmation dialog. Inject `BpdmConfirm` and `await confirm(...)`
 * anywhere — no per-action dialog or open-state boilerplate. Resolves `true` on
 * confirm, `false` on cancel / Escape / outside-click. Mirrors the React
 * `useConfirm()` and is built on the same modal surface as `<bpdm-dialog>`.
 *
 * ```ts
 * const confirm = inject(BpdmConfirm);
 * const ok = await confirm.confirm({
 *   title: "Delete project?",
 *   description: "This can't be undone.",
 *   destructive: true,
 *   confirmText: "Delete",
 * });
 * if (ok) remove();
 * ```
 */
@Injectable({ providedIn: "root" })
export class BpdmConfirm {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly t: ConfirmMessages = {
    ...DEFAULT_CONFIRM_MESSAGES,
    ...(inject(BPDM_CONFIRM_MESSAGES, { optional: true }) ?? {}),
  };

  confirm(options: ConfirmOptions = {}): Promise<boolean> {
    const t = this.t;
    return new Promise<boolean>((resolve) => {
      const overlayRef = this.overlay.create({
        positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
        scrollStrategy: this.overlay.scrollStrategies.block(),
        hasBackdrop: true,
        backdropClass: ["cdk-overlay-backdrop", "bpdm-dialog-backdrop"],
      });

      const previouslyFocused = document.activeElement as HTMLElement | null;
      const id = ++cid;
      const panelRef = overlayRef.attach(
        new ComponentPortal(BpdmConfirmPanel, null, this.injector),
      );
      panelRef.setInput("title", options.title ?? t.title);
      panelRef.setInput("description", options.description ?? "");
      panelRef.setInput("confirmText", options.confirmText ?? t.confirm);
      panelRef.setInput("cancelText", options.cancelText ?? t.cancel);
      panelRef.setInput("destructive", !!options.destructive);
      panelRef.setInput("closeLabel", t.close);
      panelRef.setInput("fallbackTitle", t.title);
      panelRef.setInput("labelId", `bpdm-confirm-title-${id}`);
      panelRef.setInput("descId", `bpdm-confirm-desc-${id}`);

      let settled = false;
      const settle = (result: boolean) => {
        if (settled) return;
        settled = true;
        panelRef.setInput("closing", true);
        if (overlayRef.backdropElement) overlayRef.backdropElement.style.opacity = "0";
        setTimeout(() => {
          overlayRef.dispose();
          previouslyFocused?.focus();
        }, 200);
        resolve(result);
      };

      panelRef.instance.confirm.subscribe(() => settle(true));
      panelRef.instance.cancel.subscribe(() => settle(false));
      overlayRef.backdropClick().subscribe(() => settle(false));
    });
  }
}
