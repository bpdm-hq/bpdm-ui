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
  title?: string;
  status?: TimelineStatus;
  /** Short timestamp / meta shown inline on the right, e.g. "12:04". */
  timestamp?: string;
  description?: string;
  /** Content shown on the opposite side of the line (vertical layouts). */
  opposite?: string;
  /** Custom marker colour (any CSS colour / token), overriding the status colour. */
  color?: string;
}

/** Context handed to a `markerTemplate` / `contentTemplate` / `oppositeTemplate`. */
export interface TimelineSlotContext {
  $implicit: TimelineItem;
  index: number;
  status: TimelineStatus;
}

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

interface TimelineRow {
  item: TimelineItem;
  index: number;
  key: string | number;
  title?: string;
  status: TimelineStatus;
  timestamp?: string;
  description?: string;
  opposite?: string;
  color?: string;
  last: boolean;
  liClass: string;
  lineClass: string;
  dotClass: string;
  markerWrapClass: string;
  contentClass: string;
  contentPlacement: string;
  titleRowClass: string;
  titleClass: string;
  oppositeClass: string;
  oppositePlacement: string;
}

const DOT_BY_STATUS: Record<TimelineStatus, string> = {
  complete: "bg-success text-success-foreground",
  current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  pending: "border-2 border-border bg-background text-transparent",
  failed: "bg-destructive text-destructive-foreground",
};

const DOT_BASE = "relative z-10 grid size-6 shrink-0 place-items-center rounded-full [&_svg]:size-3.5";
const MARKER_WRAP = "relative z-10 flex shrink-0 items-center justify-center";
const INTERACTIVE =
  "cursor-pointer rounded-lg outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * `<bpdm-status-timeline>` — status timeline for lifecycles (deployment, approval,
 * onboarding, builds). `layout` sets the orientation (vertical / horizontal) and
 * `align` which side the content sits on. It doubles as a fully templatable shell:
 * `markerTemplate` / `contentTemplate` / `oppositeTemplate` take over any slot while
 * the line, layout, and interactivity are handled for you. Set `interactive` +
 * `(itemClick)` for clickable steps.
 */
@Component({
  selector: "bpdm-status-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [NgTemplateOutlet],
  template: `
    <ol [class]="rootClass()" [attr.aria-label]="label() || null">
      @for (row of rows(); track row.key) {
        <li
          [class]="row.liClass"
          [attr.aria-current]="row.status === 'current' ? 'step' : null"
          [attr.role]="interactive() ? 'button' : null"
          [attr.tabindex]="interactive() ? 0 : null"
          (click)="interactive() && itemClick.emit({ item: row.item, index: row.index })"
          (keydown)="onKey($event, row)"
        >
          <span class="sr-only">{{ t()[row.status] }}</span>
          @if (!row.last) {
            <span [class]="row.lineClass" aria-hidden="true"></span>
          }

          @if (markerTemplate()) {
            <span [class]="row.markerWrapClass">
              <ng-container [ngTemplateOutlet]="markerTemplate()!" [ngTemplateOutletContext]="ctx(row)" />
            </span>
          } @else {
            <span [style.background-color]="row.color || null" [class]="row.dotClass">
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
          }

          @if (contentTemplate()) {
            <div [class]="row.contentPlacement">
              <ng-container [ngTemplateOutlet]="contentTemplate()!" [ngTemplateOutletContext]="ctx(row)" />
            </div>
          } @else if (horizontal()) {
            <div [class]="row.contentClass">
              <div class="flex min-h-6 items-center justify-center">
                <p [class]="row.titleClass">{{ row.title }}</p>
              </div>
              @if (row.timestamp) {
                <p class="m-0 text-xs tabular-nums text-muted-foreground">{{ row.timestamp }}</p>
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
          }

          @if (!horizontal() && showOpposite()) {
            @if (oppositeTemplate()) {
              <div [class]="row.oppositePlacement">
                <ng-container [ngTemplateOutlet]="oppositeTemplate()!" [ngTemplateOutletContext]="ctx(row)" />
              </div>
            } @else {
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
  /** Accessible name for the timeline (sets `aria-label` on the list). */
  readonly label = input<string>("");
  /** Override the visually-hidden status labels announced to screen readers (i18n). */
  readonly messages = input<Partial<StatusTimelineMessages>>({});
  /** Render the whole marker yourself (context: item + index + status). */
  readonly markerTemplate = input<TemplateRef<TimelineSlotContext> | undefined>(undefined);
  /** Render the whole content cell yourself (a rich card, etc.). */
  readonly contentTemplate = input<TemplateRef<TimelineSlotContext> | undefined>(undefined);
  /** Render the whole opposite cell yourself (vertical layouts). */
  readonly oppositeTemplate = input<TemplateRef<TimelineSlotContext> | undefined>(undefined);
  /** Make each step interactive (role/tabindex + `(itemClick)`). */
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });

  readonly itemClick = output<{ item: TimelineItem; index: number }>();

  /** Visually-hidden status labels (English defaults merged with `messages`). */
  protected readonly t = computed<StatusTimelineMessages>(() => ({
    ...DEFAULT_STATUS_TIMELINE_MESSAGES,
    ...this.messages(),
  }));
  protected readonly horizontal = computed(() => this.layout() === "horizontal");
  private readonly resolvedAlign = computed<TimelineAlign>(
    () => this.align() ?? (this.horizontal() ? "top" : "left"),
  );
  protected readonly showOpposite = computed(
    () => !!this.oppositeTemplate() || this.items().some((it) => it.opposite != null),
  );
  protected readonly rootClass = computed(() =>
    cn(
      this.horizontal() ? "m-0 flex list-none overflow-x-auto p-0" : "relative m-0 list-none p-0",
      this.classInput(),
    ),
  );

  protected ctx(row: TimelineRow): TimelineSlotContext {
    return { $implicit: row.item, index: row.index, status: row.status };
  }

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
    const centered = alternate || this.showOpposite();

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
        dotClass: cn(DOT_BASE, item.color ? "text-white" : DOT_BY_STATUS[status]),
        titleClass: cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground"),
      };

      if (horizontal) {
        const contentTop = alternate ? i % 2 === 0 : align !== "bottom";
        const contentPlacement = cn("min-w-0", contentTop ? "row-start-1 self-end" : "row-start-3 self-start");
        return {
          ...base,
          liClass: cn(
            "relative grid min-w-24 flex-1 grid-rows-[1fr_auto_1fr] justify-items-center gap-y-2 px-2",
            interactive && INTERACTIVE,
          ),
          lineClass: cn(
            // logical `start-1/2` so the connector runs toward the next marker in LTR and RTL
            "absolute start-1/2 top-1/2 h-px w-full -translate-y-1/2",
            status === "complete" ? "bg-success/40" : "bg-border",
          ),
          dotClass: cn(base.dotClass, "row-start-2"),
          markerWrapClass: cn(MARKER_WRAP, "row-start-2"),
          contentPlacement,
          contentClass: cn(contentPlacement, "text-center"),
          titleRowClass: "",
          oppositeClass: "",
          oppositePlacement: "",
        };
      }

      // vertical
      const contentRight = alternate ? i % 2 === 0 : align !== "right";
      const markerPlacement = centered ? "col-start-2 row-start-1" : "";
      const contentPlacement = cn(
        "min-w-0",
        centered
          ? contentRight
            ? "col-start-3 row-start-1 justify-self-start"
            : "col-start-1 row-start-1 justify-self-end"
          : "flex-1",
      );
      const oppositePlacement = cn(
        "min-w-0",
        contentRight ? "col-start-1 row-start-1 justify-self-end" : "col-start-3 row-start-1 justify-self-start",
      );
      return {
        ...base,
        liClass: cn(
          // gap is a margin (not padding) so the interactive hover/ring hugs the
          // step content instead of bleeding into the connector gap
          "relative mb-8 last:mb-0",
          centered ? "grid grid-cols-[1fr_auto_1fr] items-start gap-3" : "flex items-start gap-3",
          !centered && align === "right" && "flex-row-reverse",
          interactive && INTERACTIVE,
        ),
        lineClass: cn(
          // extend past the box into the margin gap to reach the next dot;
          // logical `start`/`end` insets so it mirrors correctly in RTL
          "absolute top-6 -bottom-8 w-px",
          centered
            ? "left-1/2 -translate-x-1/2"
            : align === "right"
              ? "end-3 translate-x-1/2"
              : "start-3 -translate-x-1/2",
          status === "complete" ? "bg-success/40" : "bg-border",
        ),
        dotClass: cn(base.dotClass, markerPlacement),
        markerWrapClass: cn(MARKER_WRAP, markerPlacement),
        contentPlacement,
        contentClass: cn(contentPlacement, "min-h-10", !contentRight && "text-end"),
        titleRowClass: cn("flex min-h-6 items-center justify-between gap-2", !contentRight && "flex-row-reverse"),
        oppositePlacement,
        oppositeClass: cn(
          oppositePlacement,
          "flex min-h-6 items-center text-sm text-muted-foreground",
          contentRight ? "text-end" : "text-start",
        ),
      };
    });
  });
}
