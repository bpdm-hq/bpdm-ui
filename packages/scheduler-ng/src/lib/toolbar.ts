import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { ViewType } from "@bpdm/scheduler-core";
import type { SchedulerMessages } from "./messages";

const VIEW_LABEL_KEY: Record<ViewType, keyof SchedulerMessages> = {
  day: "day",
  week: "week",
  workWeek: "week",
  month: "month",
  timeline: "week",
  agenda: "agenda",
  year: "week",
};

/**
 * Internal toolbar: Today / ‹ › navigation, the current date label, and the view switcher (a
 * `tablist`). Emits intent — the parent wires it to the store (so the compact week can step by day).
 */
@Component({
  selector: "bpdm-scheduler-toolbar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bpdm-sch-toolbar">
      <div class="bpdm-sch-nav">
        <button type="button" class="bpdm-sch-btn" (click)="today.emit()">{{ messages().today }}</button>
        <button
          type="button"
          class="bpdm-sch-btn bpdm-sch-btn--icon"
          [attr.aria-label]="messages().previous"
          (click)="prev.emit()"
        >
          ‹
        </button>
        <button
          type="button"
          class="bpdm-sch-btn bpdm-sch-btn--icon"
          [attr.aria-label]="messages().next"
          (click)="next.emit()"
        >
          ›
        </button>
      </div>

      <span class="bpdm-sch-date">{{ label() }}</span>
      <span class="bpdm-sch-spacer"></span>

      <div class="bpdm-sch-seg" role="tablist" [attr.aria-label]="messages().viewLabel">
        @for (v of views(); track v) {
          <button type="button" role="tab" [attr.aria-selected]="v === view()" (click)="viewChange.emit(v)">
            {{ messages()[viewLabelKey(v)] }}
          </button>
        }
      </div>
    </div>
  `,
})
export class BpdmSchedulerToolbar {
  readonly view = input.required<ViewType>();
  /** The date/range label, formatted by the parent per view. */
  readonly label = input.required<string>();
  readonly views = input.required<ViewType[]>();
  readonly messages = input.required<SchedulerMessages>();

  readonly today = output<void>();
  readonly prev = output<void>();
  readonly next = output<void>();
  readonly viewChange = output<ViewType>();

  protected viewLabelKey(v: ViewType): keyof SchedulerMessages {
    return VIEW_LABEL_KEY[v];
  }
}
