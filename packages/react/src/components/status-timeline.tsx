import * as React from "react";
import { cn } from "@/lib/utils";

export type TimelineStatus = "complete" | "current" | "pending" | "failed";
export type TimelineAlign = "left" | "right" | "alternate";

export type TimelineItem = {
  title: string;
  status?: TimelineStatus;
  /** Short timestamp / meta shown inline on the right, e.g. "12:04". */
  timestamp?: string;
  description?: React.ReactNode;
  /** Content shown on the opposite side of the line (e.g. a date). */
  opposite?: React.ReactNode;
};

export interface StatusTimelineProps {
  items: TimelineItem[];
  /**
   * Which side the content sits on relative to the line: "left" (default),
   * "right", or "alternate" (zig-zag). Providing `opposite` on any item centers
   * the line so both sides are visible.
   */
  align?: TimelineAlign;
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

/**
 * Vertical status timeline for lifecycles (deployment, approval, onboarding, …). Each step
 * has a status — complete (✓), current (pulsing), pending (hollow), failed (✗) —
 * with an optional timestamp, description, and `opposite` content. `align` places the
 * content left (default), right, or alternating; `opposite` content sits across the line.
 */
export function StatusTimeline({ items, align = "left", className }: StatusTimelineProps) {
  const alternate = align === "alternate";
  const hasOpposite = items.some((it) => it.opposite != null);
  const centered = alternate || hasOpposite; // center the line so both sides are usable

  return (
    <ol className={cn("relative", className)}>
      {items.map((item, i) => {
        const status = item.status ?? "pending";
        const last = i === items.length - 1;
        const muted = status === "pending";
        // which side the main content sits, relative to the line
        const contentRight = alternate ? i % 2 === 0 : align !== "right";

        return (
          <li
            key={i}
            className={cn(
              "relative pb-6 last:pb-0",
              centered ? "grid grid-cols-[1fr_auto_1fr] items-start gap-3" : "flex items-start gap-3",
              !centered && align === "right" && "flex-row-reverse",
            )}
          >
            {!last && (
              <span
                className={cn(
                  "absolute top-6 bottom-0 w-px",
                  centered
                    ? "left-1/2 -translate-x-1/2"
                    : align === "right"
                      ? "right-3 translate-x-1/2"
                      : "left-3 -translate-x-1/2",
                  status === "complete" ? "bg-success/40" : "bg-border",
                )}
                aria-hidden
              />
            )}

            <span
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
                dotByStatus[status],
                centered && "col-start-2 row-start-1",
              )}
            >
              {status === "current" && (
                <span
                  className="absolute inset-0 rounded-full bg-primary animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite] motion-reduce:animate-none"
                  aria-hidden
                />
              )}
              {status === "complete" && <Check />}
              {status === "failed" && <Cross />}
            </span>

            <div
              className={cn(
                "-mt-0.5 min-w-0",
                // hug the line so title + meta stay together beside the dot
                centered
                  ? contentRight
                    ? "col-start-3 row-start-1 justify-self-start"
                    : "col-start-1 row-start-1 justify-self-end"
                  : "flex-1",
                !contentRight && "text-right",
              )}
            >
              <div className={cn("flex items-center justify-between gap-2", !contentRight && "flex-row-reverse")}>
                <p className={cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
                  {item.title}
                </p>
                {item.timestamp && (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.timestamp}</span>
                )}
              </div>
              {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
            </div>

            {hasOpposite && (
              <div
                className={cn(
                  "-mt-0.5 min-w-0 text-sm text-muted-foreground",
                  contentRight
                    ? "col-start-1 row-start-1 justify-self-end text-right"
                    : "col-start-3 row-start-1 justify-self-start text-left",
                )}
              >
                {item.opposite}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
