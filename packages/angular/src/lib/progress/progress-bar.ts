import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  progressFill,
  progressFillFg,
  progressTrack,
  type ProgressSize,
  type ProgressVariant,
} from "@bpdm/variants";

/**
 * `<bpdm-progress-bar>` — a process indicator: determinate (drive `value`, the
 * fill animates to its width) or `indeterminate` (an animated sweep). Five
 * colors, three sizes, the value above the bar or `valuePosition="inside"`, a
 * custom `format`, and accessible (`role="progressbar"` with aria-value*).
 * Same tones as the React progress bar.
 */
@Component({
  selector: "bpdm-progress-bar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-full" },
  template: `
    @if (hasHeader()) {
      <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span class="truncate text-muted-foreground">{{ label() }}</span>
        <span class="shrink-0 font-medium tabular-nums text-foreground">{{ valueText() }}</span>
      </div>
    }
    <div
      role="progressbar"
      [attr.aria-label]="label() ?? 'Progress'"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="indeterminate() ? null : max()"
      [attr.aria-valuenow]="indeterminate() ? null : round(value())"
      [attr.aria-valuetext]="indeterminate() ? 'Loading' : valueText()"
      class="relative w-full overflow-hidden rounded-full bg-muted"
      [class]="inside() ? 'h-5' : track()"
    >
      @if (inside()) {
        <span
          class="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-[0.7rem] font-semibold tabular-nums text-muted-foreground"
        >{{ valueText() }}</span>
      }

      @if (indeterminate()) {
        <span
          class="absolute inset-y-0 left-0 w-2/5 overflow-hidden rounded-full animate-[bpdm-progress-indeterminate_1.4s_ease-in-out_infinite]"
          [class]="fill()"
        >
          <span aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></span>
        </span>
      } @else {
        <span
          class="relative z-[2] block h-full overflow-hidden rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.45,0,0.2,1)]"
          [class]="fill()"
          [style.width.%]="pct()"
        >
          <span aria-hidden="true" class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></span>
          @if (inside() && pct() > 0) {
            <span
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center text-[0.7rem] font-semibold tabular-nums"
              [class]="fillFg()"
              [style.width.%]="(100 / pct()) * 100"
            >{{ valueText() }}</span>
          }
        </span>
      }
    </div>
  `,
})
export class BpdmProgressBar {
  /** Current value (ignored when `indeterminate`). */
  readonly value = input(0);
  /** Max value. */
  readonly max = input(100);
  /** No known value — an animated bar sweeps across. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly size = input<ProgressSize>("md");
  readonly variant = input<ProgressVariant>("primary");
  /** Show a label row above the bar (defaults to the percentage). */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Where the value sits: a row above (`outside`) or `inside` the bar. */
  readonly valuePosition = input<"outside" | "inside">("outside");
  /** Custom label, e.g. `(v, max) => \`${v}/${max}\``. Implies a header row. */
  readonly format = input<(value: number, max: number) => string>();
  /** Leading text shown opposite the value (e.g. "Uploading…"). */
  readonly label = input<string>();

  protected readonly pct = computed(() =>
    this.indeterminate() ? 0 : Math.min(100, Math.max(0, (this.value() / this.max()) * 100)),
  );
  protected readonly inside = computed(
    () => this.valuePosition() === "inside" && !this.indeterminate(),
  );
  protected readonly hasHeader = computed(
    () =>
      !this.indeterminate() &&
      !this.inside() &&
      (this.showValue() || !!this.format() || !!this.label()),
  );
  protected readonly valueText = computed(() => {
    const fmt = this.format();
    return fmt ? fmt(this.value(), this.max()) : `${Math.round(this.pct())}%`;
  });
  protected readonly track = computed(() => progressTrack[this.size()]);
  protected readonly fill = computed(() => progressFill[this.variant()]);
  protected readonly fillFg = computed(() => progressFillFg[this.variant()]);

  protected round(n: number): number {
    return Math.round(n);
  }
}
