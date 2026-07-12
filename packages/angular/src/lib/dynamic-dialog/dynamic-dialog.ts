import {
  inject,
  Injectable,
  InjectionToken,
  Injector,
  type Provider,
  TemplateRef,
} from "@angular/core";
import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import { BpdmOverlayPanel } from "../overlay/overlay-panel";
import { DEFAULT_DIALOG_MESSAGES, type DialogMessages } from "../dialog/dialog";

export type DynamicDialogSize = "sm" | "md" | "lg" | "xl";

/** App-wide localizable strings (close button label, fallback title) for opened dialogs. */
export const BPDM_DYNAMIC_DIALOG_MESSAGES = new InjectionToken<Partial<DialogMessages>>(
  "BPDM_DYNAMIC_DIALOG_MESSAGES",
);

/** Provide app-wide dynamic-dialog message defaults. */
export function provideBpdmDynamicDialogMessages(messages: Partial<DialogMessages>): Provider {
  return { provide: BPDM_DYNAMIC_DIALOG_MESSAGES, useValue: messages };
}

export interface DynamicDialogOptions {
  title?: string;
  description?: string;
  size?: DynamicDialogSize;
  /** Footer template (e.g. action buttons); receives the same `{ close }` context. */
  footer?: TemplateRef<unknown>;
}

let ddid = 0;

const SIZE: Record<DynamicDialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const ENTER = "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]";
const EXIT = "animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in_forwards]";

/** Handle to an open dynamic dialog. */
export class BpdmDialogRef {
  /** @internal set by the service */
  _onClose: () => void = () => {};
  private closed = false;
  close(): void {
    if (this.closed) return;
    this.closed = true;
    this._onClose();
  }
}

/**
 * Imperatively open dialogs with arbitrary content from anywhere — no per-dialog
 * open state or prop drilling. Inject `BpdmDialogService` and call `open(tpl, opts)`;
 * it returns a `BpdmDialogRef` you can `close()`. The content template receives a
 * `{ close }` context (`<ng-template let-d>` → `d.close()`). Stacks. Mirrors the
 * React `useDialog()`; built on the same modal surface as `<bpdm-dialog>`.
 *
 * ```ts
 * const dialog = inject(BpdmDialogService);
 * dialog.open(formTpl, { title: "Edit project" });
 * // <ng-template #formTpl let-d>… <button (click)="d.close()">Save</button></ng-template>
 * ```
 */
@Injectable({ providedIn: "root" })
export class BpdmDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly t: DialogMessages = {
    ...DEFAULT_DIALOG_MESSAGES,
    ...(inject(BPDM_DYNAMIC_DIALOG_MESSAGES, { optional: true }) ?? {}),
  };

  open(content: TemplateRef<unknown>, options: DynamicDialogOptions = {}): BpdmDialogRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: ["cdk-overlay-backdrop", "bpdm-dialog-backdrop"],
    });

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const id = ++ddid;
    const ref = new BpdmDialogRef();
    const panelRef = overlayRef.attach(new ComponentPortal(BpdmOverlayPanel, null, this.injector));

    panelRef.setInput("title", options.title ?? "");
    panelRef.setInput("description", options.description ?? "");
    panelRef.setInput("showClose", true);
    panelRef.setInput("body", content);
    panelRef.setInput("footer", options.footer ?? null);
    panelRef.setInput("ctx", { $implicit: ref, close: () => ref.close() });
    panelRef.setInput("labelId", `bpdm-dynamic-title-${id}`);
    panelRef.setInput("descId", `bpdm-dynamic-desc-${id}`);
    panelRef.setInput("closeLabel", this.t.close);
    panelRef.setInput("fallbackTitle", this.t.dialogLabel);
    panelRef.setInput("panelClass", cn(
      "relative z-50 flex max-h-[85dvh] w-[calc(100vw-2rem)] flex-col rounded-xl bg-popover text-popover-foreground shadow-xl outline-none",
      SIZE[options.size ?? "md"],
    ));
    panelRef.setInput("enterAnim", ENTER);
    panelRef.setInput("exitAnim", EXIT);

    ref._onClose = () => {
      panelRef.setInput("closing", true);
      if (overlayRef.backdropElement) overlayRef.backdropElement.style.opacity = "0";
      setTimeout(() => {
        overlayRef.dispose();
        previouslyFocused?.focus();
      }, 200);
    };

    panelRef.instance.dismiss.subscribe(() => ref.close());
    overlayRef.backdropClick().subscribe(() => ref.close());

    return ref;
  }
}
