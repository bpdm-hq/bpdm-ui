import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { cn } from "@bpdm/variants";

export type TimelineStatus = "complete" | "current" | "pending" | "failed";
export type TimelineAlign = "left" | "right" | "alternate";

export interface TimelineItem {
  title: string;
  status?: TimelineStatus;
  /** Short timestamp / meta shown inline on the right, e.g. "12:04". */
  timestamp?: string;
  description?: string;
  /** Content shown on the opposite side of the line (e.g. a date). */
  opposite?: string;
}

interface TimelineRow {
  title: string;
  status: TimelineStatus;
  timestamp?: string;
  description?: string;
  opposite?: string;
  last: boolean;
  liClass: string;
  lineClass: string;
  dotClass: string;
  contentClass: string;
  titleRowClass: string;
  titleClass: string;
  oppositeClass: string;
}

const DOT_BY_STATUS: Record<TimelineStatus, string> = {
  complete: "bg-success text-success-foreground",
  current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  pending: "border-2 border-border bg-background text-transparent",
  failed: "bg-destructive text-destructive-foreground",
};

/**
 * `<bpdm-status-timeline>` — vertical status timeline for lifecycles (deployment,
 * approval, onboarding, builds). Each step has a status — `complete` (✓),
 * `current` (pulsing), `pending` (hollow), `failed` (✗) — with an optional
 * timestamp, description, and `opposite` content. `align` places content left
 * (default), right, or alternating; `opposite` content sits across the line.
 */
@Component({
  selector: "bpdm-status-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <ol [class]="rootClass()">
      @for (row of rows(); track $index) {
        <li [class]="row.liClass">
          @if (!row.last) {
            <span [class]="row.lineClass" aria-hidden="true"></span>
          }
          <span [class]="row.dotClass">
            @if (row.status === "current") {
              <span class="absolute inset-0 rounded-full bg-primary animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite] motion-reduce:animate-none" aria-hidden="true"></span>
            }
            @if (row.status === "complete") {
              <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            }
            @if (row.status === "failed") {
              <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            }
          </span>

          <div [class]="row.contentClass">
            <div [class]="row.titleRowClass">
              <p [class]="row.titleClass">{{ row.title }}</p>
              @if (row.timestamp) {
                <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ row.timestamp }}</span>
              }
            </div>
            @if (row.description) {
              <p class="mt-0.5 text-sm text-muted-foreground">{{ row.description }}</p>
            }
          </div>

          @if (hasOpposite()) {
            <div [class]="row.oppositeClass">{{ row.opposite }}</div>
          }
        </li>
      }
    </ol>
  `,
})
export class BpdmStatusTimeline {
  readonly items = input<TimelineItem[]>([]);
  readonly align = input<TimelineAlign>("left");
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly rootClass = computed(() => cn("relative", this.classInput()));
  protected readonly hasOpposite = computed(() => this.items().some((it) => it.opposite != null));

  protected readonly rows = computed<TimelineRow[]>(() => {
    const items = this.items();
    const align = this.align();
    const alternate = align === "alternate";
    const centered = alternate || this.hasOpposite();

    return items.map((item, i) => {
      const status = item.status ?? "pending";
      const last = i === items.length - 1;
      const muted = status === "pending";
      const contentRight = alternate ? i % 2 === 0 : align !== "right";

      return {
        title: item.title,
        status,
        timestamp: item.timestamp,
        description: item.description,
        opposite: item.opposite,
        last,
        liClass: cn(
          "relative pb-6 last:pb-0",
          centered ? "grid grid-cols-[1fr_auto_1fr] items-start gap-3" : "flex items-start gap-3",
          !centered && align === "right" && "flex-row-reverse",
        ),
        lineClass: cn(
          "absolute top-6 bottom-0 w-px",
          centered
            ? "left-1/2 -translate-x-1/2"
            : align === "right"
              ? "right-3 translate-x-1/2"
              : "left-3 -translate-x-1/2",
          status === "complete" ? "bg-success/40" : "bg-border",
        ),
        dotClass: cn(
          "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
          DOT_BY_STATUS[status],
          centered && "col-start-2",
        ),
        contentClass: cn(
          "-mt-0.5 min-w-0",
          centered ? (contentRight ? "col-start-3" : "col-start-1") : "flex-1",
          !contentRight && "text-right",
        ),
        titleRowClass: cn("flex items-center justify-between gap-2", !contentRight && "flex-row-reverse"),
        titleClass: cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground"),
        oppositeClass: cn(
          "-mt-0.5 min-w-0 text-sm text-muted-foreground",
          contentRight ? "col-start-1 text-right" : "col-start-3 text-left",
        ),
      };
    });
  });
}
