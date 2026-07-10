import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from "@angular/core";
import { cn } from "@bpdm/variants";

export interface StatCardMessages {
  /** Screen-reader word for a positive delta. Default "Increased". */
  increased: string;
  /** Screen-reader word for a negative delta. Default "Decreased". */
  decreased: string;
  /** Screen-reader text for a zero delta. Default "No change". */
  noChange: string;
  /** Appended to the label while `loading`. Default "loading". */
  loading: string;
}

export const DEFAULT_STAT_CARD_MESSAGES: StatCardMessages = {
  increased: "Increased",
  decreased: "Decreased",
  noChange: "No change",
  loading: "loading",
};

let statCardUid = 0;

/**
 * `<bpdm-stat-card>` — a dashboard KPI card: a label, a big value, an optional
 * percentage delta (green/red by whether the change is good — set
 * `[positiveIsGood]="false"` for metrics where up is bad, e.g. churn), and an
 * optional icon badge (`bpdmStatCardIcon`). Pass `accent` (any CSS color) to tint
 * the card + badge. The card is a labelled `role="group"` and the delta carries a
 * screen-reader text alternative (direction is not colour-only). Same look as the
 * React stat card.
 *
 * ```html
 * <bpdm-stat-card label="Active users" value="8,420" [delta]="3.1" deltaLabel="vs last week">
 *   <svg bpdmStatCardIcon …></svg>
 * </bpdm-stat-card>
 * ```
 */
@Component({
  selector: "bpdm-stat-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "cardClass()",
    "[style.background-color]": "cardBg()",
    "[attr.role]": "'group'",
    "[attr.aria-busy]": "loading() ? 'true' : null",
    "[attr.aria-live]": "loading() ? 'polite' : null",
    "[attr.aria-label]": "loading() ? label() + ' ' + t().loading : null",
    "[attr.aria-labelledby]": "loading() ? null : labelId",
  },
  template: `
    @if (loading()) {
      <div class="min-w-0 flex-1 space-y-2.5">
        <div class="h-3.5 w-24 animate-pulse rounded bg-muted"></div>
        <div class="h-7 w-28 animate-pulse rounded bg-muted"></div>
        <div class="h-3.5 w-32 animate-pulse rounded bg-muted"></div>
      </div>
      <div class="size-12 shrink-0 animate-pulse rounded-full bg-muted"></div>
    } @else {
    <div class="min-w-0">
      <p [id]="labelId" class="truncate text-sm text-muted-foreground">{{ label() }}</p>
      <p class="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{{ value() }}</p>
      @if (hasDelta()) {
        <div class="mt-1.5 flex items-center gap-1.5 text-sm">
          <span class="inline-flex items-center gap-0.5 font-medium" [class]="deltaColor()" [attr.aria-label]="deltaSr()">
            @if (!neutral()) {
              <svg viewBox="0 0 12 12" fill="none" class="size-3" aria-hidden="true">
                <path
                  [attr.d]="up() ? 'M6 9.5v-7M3 5.5L6 2.5l3 3' : 'M6 2.5v7M3 6.5L6 9.5l3-3'"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
            <span aria-hidden="true">{{ neutral() ? "0" : deltaNum() }}%</span>
          </span>
          @if (deltaLabel()) {
            <span class="text-muted-foreground">{{ deltaLabel() }}</span>
          }
        </div>
      }
    </div>

    <span
      aria-hidden="true"
      [style.background-color]="badgeBg()"
      [style.color]="accent() || null"
      class="grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)] group-hover:scale-110 [&_svg]:size-5 empty:hidden"
      [class.bg-muted]="!accent()"
      [class.text-muted-foreground]="!accent()"
    >
      <ng-content select="[bpdmStatCardIcon]" />
    </span>
    }
  `,
})
export class BpdmStatCard {
  readonly label = input.required<string>();
  /** Pre-formatted value, e.g. "$124,592". */
  readonly value = input.required<string>();
  /** Percent change, e.g. 12.5 or -3.2. */
  readonly delta = input<number>();
  /** Caption next to the delta, e.g. "vs last month". */
  readonly deltaLabel = input<string>();
  /** When false, an increase is shown as bad (red) — e.g. churn. */
  readonly positiveIsGood = input(true, { transform: booleanAttribute });
  /** Any CSS color — tints the card background + icon badge. */
  readonly accent = input<string>();
  /** Show a shimmering skeleton in place of the content (data still loading). */
  readonly loading = input(false, { transform: booleanAttribute });
  /** BCP 47 locale for formatting the delta number (decimal separator). */
  readonly locale = input<string>();
  /** Override screen-reader / loading text for i18n. */
  readonly messages = input<Partial<StatCardMessages>>({});
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly labelId = `bpdm-stat-${++statCardUid}`;

  protected readonly t = computed<StatCardMessages>(() => ({
    ...DEFAULT_STAT_CARD_MESSAGES,
    ...this.messages(),
  }));

  protected readonly hasDelta = computed(() => {
    const d = this.delta();
    return d !== undefined && !Number.isNaN(d);
  });
  protected readonly up = computed(() => (this.delta() ?? 0) > 0);
  protected readonly neutral = computed(() => (this.delta() ?? 0) === 0);
  protected readonly deltaNum = computed(() =>
    new Intl.NumberFormat(this.locale()).format(Math.abs(this.delta() ?? 0)),
  );
  protected readonly deltaSr = computed(() => {
    if (this.neutral()) return this.t().noChange;
    return `${this.up() ? this.t().increased : this.t().decreased} ${this.deltaNum()}%`;
  });
  protected readonly deltaColor = computed(() => {
    if (this.neutral()) return "text-muted-foreground";
    const good = this.positiveIsGood() ? this.up() : !this.up();
    return good ? "text-success" : "text-destructive";
  });

  protected readonly cardClass = computed(() =>
    cn(
      "group flex items-center justify-between gap-4 rounded-2xl border p-5 text-card-foreground shadow-sm transition-[transform,box-shadow] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:-translate-y-0.5 hover:shadow-md",
      this.accent() && !this.loading() ? "border-transparent" : "border-border bg-card",
      this.classInput(),
    ),
  );
  protected readonly cardBg = computed(() =>
    this.accent() && !this.loading() ? `color-mix(in srgb, ${this.accent()} 8%, var(--card))` : null,
  );
  protected readonly badgeBg = computed(() =>
    this.accent() ? `color-mix(in srgb, ${this.accent()} 14%, transparent)` : null,
  );
}
