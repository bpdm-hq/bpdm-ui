import * as React from "react";
import { cn } from "@/lib/utils";

export type TimelineStatus = "complete" | "current" | "pending" | "failed";
export type TimelineLayout = "vertical" | "horizontal";
/** Vertical: left | right | alternate. Horizontal: top | bottom | alternate. */
export type TimelineAlign = "left" | "right" | "top" | "bottom" | "alternate";

export type TimelineItem = {
  /** Stable id — used as the React key / for change tracking. Falls back to index. */
  id?: string | number;
  title?: React.ReactNode;
  status?: TimelineStatus;
  /** Short timestamp / meta shown inline on the right, e.g. "12:04". */
  timestamp?: string;
  description?: React.ReactNode;
  /** Content shown on the opposite side of the line (vertical layouts). */
  opposite?: React.ReactNode;
  /** Custom marker content, overriding the default status glyph (✓/✗/dot). */
  icon?: React.ReactNode;
  /** Custom marker colour (any CSS colour / token), overriding the status colour. */
  color?: string;
};

/**
 * Every screen-reader status label the timeline renders — pass a partial to
 * translate. Defaults are English; merged once with
 * {@link DEFAULT_STATUS_TIMELINE_MESSAGES}. Each step renders its label
 * visually hidden so the status (conveyed visually by colour/glyph) is also
 * announced to assistive tech.
 */
export interface StatusTimelineMessages {
  /** Announced for a `complete` step. */
  complete: string;
  /** Announced for the `current` step (which also carries `aria-current`). */
  current: string;
  /** Announced for a `pending` step. */
  pending: string;
  /** Announced for a `failed` step. */
  failed: string;
}

export const DEFAULT_STATUS_TIMELINE_MESSAGES: StatusTimelineMessages = {
  complete: "Completed",
  current: "In progress",
  pending: "Not started",
  failed: "Failed",
};

export interface StatusTimelineProps {
  items: TimelineItem[];
  /** Orientation — "vertical" (default) or "horizontal". */
  layout?: TimelineLayout;
  /**
   * Which side the content sits on. Vertical: "left" (default) / "right" /
   * "alternate". Horizontal: "top" (default) / "bottom" / "alternate".
   */
  align?: TimelineAlign;
  /** Accessible name for the timeline (sets `aria-label` on the list). */
  label?: string;
  /** Override the visually-hidden status labels announced to screen readers (i18n). */
  messages?: Partial<StatusTimelineMessages>;
  /** Make each step interactive — fires with the item and its index. */
  onItemClick?: (item: TimelineItem, index: number) => void;
  /** Render the whole marker yourself (any size/shape); overrides icon/colour/glyph. */
  renderMarker?: (item: TimelineItem, status: TimelineStatus) => React.ReactNode;
  /** Render the whole content cell yourself (a rich card, etc.). */
  renderContent?: (item: TimelineItem, index: number) => React.ReactNode;
  /** Render the whole opposite cell yourself (vertical layouts). */
  renderOpposite?: (item: TimelineItem, index: number) => React.ReactNode;
  className?: string;
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const dotByStatus: Record<TimelineStatus, string> = {
  complete: "bg-success text-success-foreground",
  current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  pending: "border-2 border-border bg-background text-transparent",
  failed: "bg-destructive text-destructive-foreground",
};

/** The default status marker: custom colour/icon, else the status glyph; pulses when current. */
function Marker({ item, status, className }: { item: TimelineItem; status: TimelineStatus; className?: string }) {
  return (
    <span
      style={item.color ? { backgroundColor: item.color } : undefined}
      data-bpdm-slot="status-timeline-marker"
      className={cn(
        "relative z-10 grid size-6 shrink-0 place-items-center rounded-full [&_svg]:size-3.5",
        item.color ? "text-white" : dotByStatus[status],
        className,
      )}
    >
      {status === "current" && (
        <span
          className="absolute inset-0 rounded-full bg-primary animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite] motion-reduce:animate-none"
          aria-hidden
        />
      )}
      {item.icon ?? (
        <>
          {status === "complete" && <Check />}
          {status === "failed" && <Cross />}
        </>
      )}
    </span>
  );
}

const interactiveClasses =
  "cursor-pointer rounded-lg outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Status timeline for lifecycles (deployment, approval, onboarding, …). Each step
 * has a status — complete (✓), current (pulsing), pending (hollow), failed (✗) —
 * with an optional timestamp, description, custom marker, and colour. `layout` sets
 * the orientation (vertical / horizontal) and `align` which side the content sits
 * on. It doubles as a fully templatable shell: `renderMarker` / `renderContent` /
 * `renderOpposite` take over any slot while the line, layout, and interactivity are
 * handled for you. `onItemClick` makes steps keyboard-accessible and interactive.
 */
export function StatusTimeline({
  items,
  layout = "vertical",
  align: alignProp,
  label,
  messages,
  onItemClick,
  renderMarker,
  renderContent,
  renderOpposite,
  className,
}: StatusTimelineProps) {
  const horizontal = layout === "horizontal";
  const align = alignProp ?? (horizontal ? "top" : "left");
  const alternate = align === "alternate";
  const interactive = !!onItemClick;
  const t = React.useMemo(
    () => (messages ? { ...DEFAULT_STATUS_TIMELINE_MESSAGES, ...messages } : DEFAULT_STATUS_TIMELINE_MESSAGES),
    [messages],
  );
  // Visually-hidden status label so the state (otherwise conveyed only by the
  // aria-hidden marker/colour) is announced to assistive tech, in reading order.
  const statusLabel = (status: TimelineStatus) => (
    <span className="sr-only">{t[status]}</span>
  );

  const clickProps = (item: TimelineItem, i: number) =>
    interactive
      ? {
          role: "button" as const,
          tabIndex: 0,
          onClick: () => onItemClick!(item, i),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onItemClick!(item, i);
            }
          },
        }
      : {};

  const marker = (item: TimelineItem, status: TimelineStatus, placement: string) =>
    renderMarker ? (
      <span data-bpdm-slot="status-timeline-marker" className={cn("relative z-10 flex shrink-0 items-center justify-center", placement)}>
        {renderMarker(item, status)}
      </span>
    ) : (
      <Marker item={item} status={status} className={placement} />
    );

  // Horizontal
  if (horizontal) {
    return (
      <ol aria-label={label} data-bpdm="" data-bpdm-slot="status-timeline" className={cn("m-0 flex list-none overflow-x-auto p-0", className)}>
        {items.map((item, i) => {
          const status = item.status ?? "pending";
          const last = i === items.length - 1;
          const muted = status === "pending";
          const contentTop = alternate ? i % 2 === 0 : align !== "bottom";

          return (
            <li
              key={item.id ?? i}
              aria-current={status === "current" ? "step" : undefined}
              {...clickProps(item, i)}
              data-bpdm-slot="status-timeline-item"
              className={cn(
                "relative grid min-w-24 flex-1 grid-rows-[1fr_auto_1fr] justify-items-center gap-y-2 px-2",
                interactive && interactiveClasses,
              )}
            >
              {statusLabel(status)}
              {!last && (
                <span
                  className={cn(
                    // logical `start-1/2` so the connector runs toward the next
                    // marker in both LTR and RTL
                    "absolute start-1/2 top-1/2 h-px w-full -translate-y-1/2",
                    status === "complete" ? "bg-success/40" : "bg-border",
                  )}
                  aria-hidden
                />
              )}

              {marker(item, status, "row-start-2")}

              <div data-bpdm-slot="status-timeline-content" className={cn("min-w-0", contentTop ? "row-start-1 self-end" : "row-start-3 self-start", !renderContent && "text-center")}>
                {renderContent ? (
                  renderContent(item, i)
                ) : (
                  <>
                    <div className="flex min-h-6 items-center justify-center">
                      <p className={cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
                        {item.title}
                      </p>
                    </div>
                    {item.timestamp && <p className="m-0 text-xs tabular-nums text-muted-foreground">{item.timestamp}</p>}
                    {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  // Vertical
  const showOpposite = !!renderOpposite || items.some((it) => it.opposite != null);
  const centered = alternate || showOpposite; // center the line so both sides are usable

  return (
    <ol aria-label={label} data-bpdm="" data-bpdm-slot="status-timeline" className={cn("relative m-0 list-none p-0", className)}>
      {items.map((item, i) => {
        const status = item.status ?? "pending";
        const last = i === items.length - 1;
        const muted = status === "pending";
        // which side the main content sits, relative to the line
        const contentRight = alternate ? i % 2 === 0 : align !== "right";

        return (
          <li
            key={item.id ?? i}
            aria-current={status === "current" ? "step" : undefined}
            {...clickProps(item, i)}
            data-bpdm-slot="status-timeline-item"
            className={cn(
              // gap is a margin (not padding) so the interactive hover/ring hugs the
              // step content instead of bleeding into the connector gap
              "relative mb-8 last:mb-0",
              centered ? "grid grid-cols-[1fr_auto_1fr] items-start gap-3" : "flex items-start gap-3",
              !centered && align === "right" && "flex-row-reverse",
              interactive && interactiveClasses,
            )}
          >
            {statusLabel(status)}
            {!last && (
              <span
                className={cn(
                  // extend past the box into the margin gap to reach the next dot;
                  // logical `start`/`end` insets so it mirrors correctly in RTL
                  "absolute top-6 -bottom-8 w-px",
                  centered
                    ? "left-1/2 -translate-x-1/2"
                    : align === "right"
                      ? "end-3 translate-x-1/2"
                      : "start-3 -translate-x-1/2",
                  status === "complete" ? "bg-success/40" : "bg-border",
                )}
                aria-hidden
              />
            )}

            {marker(item, status, cn(centered && "col-start-2 row-start-1"))}

            <div
              data-bpdm-slot="status-timeline-content"
              className={cn(
                "min-w-0",
                centered
                  ? contentRight
                    ? "col-start-3 row-start-1 justify-self-start"
                    : "col-start-1 row-start-1 justify-self-end"
                  : "flex-1",
                // default-structure spacing/alignment (skipped for custom content)
                !renderContent && "min-h-10",
                !renderContent && !contentRight && "text-end",
              )}
            >
              {renderContent ? (
                renderContent(item, i)
              ) : (
                <>
                  <div
                    className={cn(
                      "flex min-h-6 items-center justify-between gap-2",
                      !contentRight && "flex-row-reverse",
                    )}
                  >
                    <p className={cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
                      {item.title}
                    </p>
                    {item.timestamp && (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.timestamp}</span>
                    )}
                  </div>
                  {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
                </>
              )}
            </div>

            {showOpposite && (
              <div
                data-bpdm-slot="status-timeline-opposite"
                className={cn(
                  "min-w-0",
                  contentRight
                    ? "col-start-1 row-start-1 justify-self-end"
                    : "col-start-3 row-start-1 justify-self-start",
                  !renderOpposite && "flex min-h-6 items-center text-sm text-muted-foreground",
                  !renderOpposite && (contentRight ? "text-end" : "text-start"),
                )}
              >
                {renderOpposite ? renderOpposite(item, i) : item.opposite}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
