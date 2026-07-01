import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { cn } from "@bpdm/variants";

export type TimelineStatus = "complete" | "current" | "pending" | "failed";

export interface TimelineItem {
  title: string;
  status?: TimelineStatus;
  /** Short timestamp / meta shown on the right, e.g. "12:04". */
  timestamp?: string;
  description?: string;
}

interface TimelineRow {
  title: string;
  status: TimelineStatus;
  timestamp?: string;
  description?: string;
  last: boolean;
  muted: boolean;
  dotClass: string;
  lineClass: string;
  titleClass: string;
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
 * timestamp and description.
 *
 * ```html
 * <bpdm-status-timeline [items]="[
 *   { title: 'Build queued', status: 'complete', timestamp: '09:41' },
 *   { title: 'Running tests', status: 'current', timestamp: '09:42' },
 *   { title: 'Deploy', status: 'pending' },
 * ]" />
 * ```
 */
@Component({
  selector: "bpdm-status-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <ol [class]="rootClass()">
      @for (row of rows(); track $index) {
        <li class="relative flex gap-3 pb-6 last:pb-0">
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

          <div class="-mt-0.5 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p [class]="row.titleClass">{{ row.title }}</p>
              @if (row.timestamp) {
                <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ row.timestamp }}</span>
              }
            </div>
            @if (row.description) {
              <p class="mt-0.5 text-sm text-muted-foreground">{{ row.description }}</p>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class BpdmStatusTimeline {
  readonly items = input<TimelineItem[]>([]);
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly rootClass = computed(() => cn("relative", this.classInput()));

  protected readonly rows = computed<TimelineRow[]>(() => {
    const items = this.items();
    return items.map((item, i) => {
      const status = item.status ?? "pending";
      const last = i === items.length - 1;
      const muted = status === "pending";
      return {
        title: item.title,
        status,
        timestamp: item.timestamp,
        description: item.description,
        last,
        muted,
        dotClass: cn(
          "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
          DOT_BY_STATUS[status],
        ),
        lineClass: cn(
          "absolute left-3 top-6 bottom-0 w-px -translate-x-1/2",
          status === "complete" ? "bg-success/40" : "bg-border",
        ),
        titleClass: cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground"),
      };
    });
  });
}
