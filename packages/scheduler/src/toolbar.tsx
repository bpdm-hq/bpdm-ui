import type { SchedulerStore, ViewType } from "@bpdm/scheduler-core";
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

export interface ToolbarProps {
  store: SchedulerStore;
  view: ViewType;
  /** The date/range label, formatted by the parent per view. */
  label: string;
  views: ViewType[];
  messages: SchedulerMessages;
  /** Override the ‹ › step (e.g. the compact week steps by a day, not a week). */
  onPrev?: () => void;
  onNext?: () => void;
}

export function Toolbar({ store, view, label, views, messages, onPrev, onNext }: ToolbarProps) {
  return (
    <div className="bpdm-sch-toolbar">
      <div className="bpdm-sch-nav">
        <button type="button" className="bpdm-sch-btn" onClick={() => store.today()}>
          {messages.today}
        </button>
        <button
          type="button"
          className="bpdm-sch-btn bpdm-sch-btn--icon"
          aria-label={messages.previous}
          onClick={onPrev ?? (() => store.previous())}
        >
          ‹
        </button>
        <button
          type="button"
          className="bpdm-sch-btn bpdm-sch-btn--icon"
          aria-label={messages.next}
          onClick={onNext ?? (() => store.next())}
        >
          ›
        </button>
      </div>

      <span className="bpdm-sch-date">{label}</span>
      <span className="bpdm-sch-spacer" />

      <div className="bpdm-sch-seg" role="tablist" aria-label={messages.viewLabel}>
        {views.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={v === view}
            onClick={() => store.setView(v)}
          >
            {messages[VIEW_LABEL_KEY[v]]}
          </button>
        ))}
      </div>
    </div>
  );
}
