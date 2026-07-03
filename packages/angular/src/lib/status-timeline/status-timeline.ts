import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type TimelineStatus = "complete" | "current" | "pending" | "failed";
export type TimelineLayout = "vertical" | "horizontal";
/** Vertical: left | right | alternate. Horizontal: top | bottom | alternate. */
export type TimelineAlign = "left" | "right" | "top" | "bottom" | "alternate";

export interface TimelineItem {
  /** Stable id — used for change tracking. Falls back to index. */
  id?: string | number;
  title: string;
  status?: TimelineStatus;
  /** Short timestamp / meta shown inline on the right, e.g. "12:04". */
  timestamp?: string;
  description?: string;
  /** Content shown on the opposite side of the line (vertical layouts). */
  opposite?: string;
  /** Custom marker colour (any CSS colour / token), overriding the status colour. */
  color?: string;
}

/** Context handed to a custom `markerTemplate`. */
export interface TimelineMarkerContext {
  $implicit: TimelineItem;
  status: TimelineStatus;
}

interface TimelineRow {
  item: TimelineItem;
  index: number;
  key: string | number;
  title: string;
  status: TimelineStatus;
  timestamp?: string;
  description?: string;
  opposite?: string;
  color?: string;
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

const DOT_BASE = "relative z-10 grid size-6 shrink-0 place-items-center rounded-full [&_svg]:size-3.5";
const INTERACTIVE =
  "cursor-pointer rounded-md outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";

/**
 * `<bpdm-status-timeline>` — status timeline for lifecycles (deployment, approval,
 * onboarding, builds). Each step has a status — `complete` (✓), `current` (pulsing),
 * `pending` (hollow), `failed` (✗) — with optional timestamp, description, colour,
 * and a custom `markerTemplate`. `layout` sets the orientation (vertical /
 * horizontal) and `align` which side the content sits on. Set `interactive` +
 * `(itemClick)` for clickable steps.
 */
@Component({
  selector: "bpdm-status-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [NgTemplateOutlet],
  template: `
    <ol [class]="rootClass()">
      @for (row of rows(); track row.key) {
        <li
          [class]="row.liClass"
          [attr.role]="interactive() ? 'button' : null"
          [attr.tabindex]="interactive() ? 0 : null"
          (click)="interactive() && itemClick.emit({ item: row.item, index: row.index })"
          (keydown)="onKey($event, row)"
        >
          @if (!row.last) {
            <span [class]="row.lineClass" aria-hidden="true"></span>
          }

          <span [style.background-color]="row.color || null" [class]="row.dotClass">
            @if (row.status === "current") {
              <span class="absolute inset-0 rounded-full bg-primary animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite] motion-reduce:animate-none" aria-hidden="true"></span>
            }
            @if (markerTemplate()) {
              <ng-container [ngTemplateOutlet]="markerTemplate()!" [ngTemplateOutletContext]="{ $implicit: row.item, status: row.status }" />
            } @else {
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
            }
          </span>

          @if (horizontal()) {
            <div [class]="row.contentClass">
              <div class="flex min-h-6 items-center justify-center">
                <p [class]="row.titleClass">{{ row.title }}</p>
              </div>
              @if (row.timestamp) {
                <p class="text-xs tabular-nums text-muted-foreground">{{ row.timestamp }}</p>
              }
              @if (row.description) {
                <p class="mt-0.5 text-sm text-muted-foreground">{{ row.description }}</p>
              }
            </div>
          } @else {
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
          }
        </li>
      }
    </ol>
  `,
})
export class BpdmStatusTimeline {
  readonly items = input<TimelineItem[]>([]);
  readonly layout = input<TimelineLayout>("vertical");
  readonly align = input<TimelineAlign | undefined>(undefined);
  /** Custom marker template (context: `$implicit` item + `status`), overriding the glyph. */
  readonly markerTemplate = input<TemplateRef<TimelineMarkerContext> | undefined>(undefined);
  /** Make each step interactive (role/tabindex + `(itemClick)`). */
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });

  readonly itemClick = output<{ item: TimelineItem; index: number }>();

  protected readonly horizontal = computed(() => this.layout() === "horizontal");
  private readonly resolvedAlign = computed<TimelineAlign>(
    () => this.align() ?? (this.horizontal() ? "top" : "left"),
  );
  protected readonly hasOpposite = computed(() => this.items().some((it) => it.opposite != null));
  protected readonly rootClass = computed(() =>
    cn(this.horizontal() ? "flex overflow-x-auto" : "relative", this.classInput()),
  );

  protected onKey(e: KeyboardEvent, row: TimelineRow): void {
    if (!this.interactive()) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.itemClick.emit({ item: row.item, index: row.index });
    }
  }

  protected readonly rows = computed<TimelineRow[]>(() => {
    const items = this.items();
    const horizontal = this.horizontal();
    const align = this.resolvedAlign();
    const alternate = align === "alternate";
    const interactive = this.interactive();
    const centered = alternate || this.hasOpposite();

    return items.map((item, i) => {
      const status = item.status ?? "pending";
      const last = i === items.length - 1;
      const muted = status === "pending";
      const base = {
        item,
        index: i,
        key: item.id ?? i,
        title: item.title,
        status,
        timestamp: item.timestamp,
        description: item.description,
        opposite: item.opposite,
        color: item.color,
        last,
        titleClass: cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground"),
      };

      if (horizontal) {
        const contentTop = alternate ? i % 2 === 0 : align !== "bottom";
        return {
          ...base,
          liClass: cn(
            "relative grid min-w-24 flex-1 grid-rows-[1fr_auto_1fr] justify-items-center gap-y-2 px-2",
            interactive && INTERACTIVE,
          ),
          lineClass: cn(
            "absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2",
            status === "complete" ? "bg-success/40" : "bg-border",
          ),
          dotClass: cn(DOT_BASE, item.color ? "text-white" : DOT_BY_STATUS[status], "row-start-2"),
          contentClass: cn("min-w-0 text-center", contentTop ? "row-start-1 self-end" : "row-start-3 self-start"),
          titleRowClass: "",
          oppositeClass: "",
        };
      }

      // vertical
      const contentRight = alternate ? i % 2 === 0 : align !== "right";
      return {
        ...base,
        liClass: cn(
          "relative pb-8 last:pb-0",
          centered ? "grid grid-cols-[1fr_auto_1fr] items-start gap-3" : "flex items-start gap-3",
          !centered && align === "right" && "flex-row-reverse",
          interactive && INTERACTIVE,
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
        dotClass: cn(DOT_BASE, item.color ? "text-white" : DOT_BY_STATUS[status], centered && "col-start-2 row-start-1"),
        contentClass: cn(
          "min-h-10 min-w-0",
          centered
            ? contentRight
              ? "col-start-3 row-start-1 justify-self-start"
              : "col-start-1 row-start-1 justify-self-end"
            : "flex-1",
          !contentRight && "text-right",
        ),
        titleRowClass: cn(
          "flex min-h-6 items-center justify-between gap-2",
          !contentRight && "flex-row-reverse",
        ),
        oppositeClass: cn(
          "flex min-h-6 min-w-0 items-center text-sm text-muted-foreground",
          contentRight
            ? "col-start-1 row-start-1 justify-self-end text-right"
            : "col-start-3 row-start-1 justify-self-start text-left",
        ),
      };
    });
  });
}
