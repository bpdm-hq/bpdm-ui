import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { lockBodyScroll } from "./scroll-lock";

/**
 * The "create event" popup shell. It owns only the chrome — backdrop, focus, Escape/backdrop-to-cancel,
 * background scroll-lock — and projects whatever form the consumer supplies via `<ng-template #createForm>`,
 * so the fields stay fully custom and the package keeps zero UI dependencies.
 */
@Component({
  selector: "bpdm-scheduler-create-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "bpdm-sch-ov",
    role: "dialog",
    "[attr.aria-modal]": "'true'",
    "[attr.aria-label]": "title()",
    "(click)": "onBackdrop($event)",
    "(document:keydown.escape)": "cancel.emit()",
  },
  template: `
    <div class="bpdm-sch-dlg" style="--c: var(--primary)" #panel>
      <div class="bpdm-sch-dlg-head">
        <div class="bpdm-sch-dlg-titlewrap">
          <span class="bpdm-sch-dlg-bar" aria-hidden="true"></span>
          <div class="bpdm-sch-dlg-title" role="heading" aria-level="3">{{ title() }}</div>
        </div>
      </div>
      <div class="bpdm-sch-dlg-body"><ng-content /></div>
    </div>
  `,
})
export class BpdmSchedulerCreateDialog implements AfterViewInit {
  /** Heading for the create popup (from `messages.createTitle`). */
  readonly title = input.required<string>();
  readonly cancel = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>("panel");

  constructor() {
    inject(DestroyRef).onDestroy(lockBodyScroll());
  }

  ngAfterViewInit(): void {
    // focus the first focusable control in the consumer's form
    this.panel()
      .nativeElement.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
  }

  protected onBackdrop(e: MouseEvent): void {
    if (e.target === this.host.nativeElement) this.cancel.emit();
  }
}
