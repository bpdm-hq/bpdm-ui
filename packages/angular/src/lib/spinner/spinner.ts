import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { cn, spinnerSize, type SpinnerSize, type SpinnerVariant } from "@bpdm/variants";

/**
 * `<bpdm-spinner>` — a loading indicator in six looks: `ring`, `gradient`,
 * `square`, `dots`, `bars`, `flip`. Inherits the current text color (set a
 * `text-*` class to recolor), sizes xs–xl, and announces itself to screen
 * readers. Same sizing/animation as the React spinner.
 */
@Component({
  selector: "bpdm-spinner",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: "status", "aria-live": "polite", "[class]": "hostClass()" },
  template: `
    @switch (variant()) {
      @case ("gradient") {
        <span class="inline-block animate-spin rounded-full" [class]="s().ring" [style]="gradientStyle()"></span>
      }
      @case ("square") {
        <span class="inline-block animate-spin rounded-[28%]" [class]="s().ring" [style]="squareStyle()"></span>
      }
      @case ("dots") {
        <span class="inline-flex items-center" [class]="s().gap">
          @for (i of [0, 1, 2]; track i) {
            <span
              class="inline-block rounded-full bg-current animate-[bpdm-dot-bounce_1.1s_ease-in-out_infinite]"
              [class]="s().dot"
              [style.animation-delay.s]="i * 0.16"
            ></span>
          }
        </span>
      }
      @case ("bars") {
        <span class="inline-flex items-end" [class]="s().gap">
          @for (i of [0, 1, 2, 3]; track i) {
            <span
              class="inline-block origin-bottom rounded-full bg-current animate-[bpdm-bar_1s_ease-in-out_infinite]"
              [class]="s().bar"
              [style.animation-delay.s]="i * 0.12"
            ></span>
          }
        </span>
      }
      @case ("flip") {
        <span
          class="inline-block rounded-[32%] shadow-sm animate-[bpdm-flip_1.2s_ease-in-out_infinite]"
          [class]="s().ring"
          style="background: linear-gradient(135deg, currentColor, color-mix(in srgb, currentColor 45%, transparent))"
        ></span>
      }
      @default {
        <span class="inline-block animate-spin rounded-full border-current/25 border-t-current" [class]="s().ring + ' ' + s().border"></span>
      }
    }
    <span class="sr-only">{{ label() }}</span>
  `,
})
export class BpdmSpinner {
  readonly variant = input<SpinnerVariant>("ring");
  readonly size = input<SpinnerSize>("md");
  /** Accessible label (visually hidden). */
  readonly label = input("Loading");
  /** Extra classes; `text-*` recolors the spinner (merged via tailwind-merge). */
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly s = computed(() => spinnerSize[this.size()]);
  protected readonly hostClass = computed(() =>
    cn("inline-flex items-center justify-center text-primary", this.classInput()),
  );

  // a conic "comet" ring, masked to a ring of the size's thickness
  protected readonly gradientStyle = computed(() => {
    const t = this.s().thickness;
    const mask = `radial-gradient(farthest-side, transparent calc(100% - ${t}), #000 calc(100% - ${t}))`;
    return {
      background: "conic-gradient(from 90deg, transparent 5%, currentColor)",
      "-webkit-mask": mask,
      mask,
    };
  });

  // rotating gradient shown only on the border of a rounded square
  protected readonly squareStyle = computed(() => ({
    padding: this.s().thickness,
    background: "conic-gradient(from 90deg, transparent 5%, currentColor)",
    "-webkit-mask": "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    "-webkit-mask-composite": "xor",
    "mask-composite": "exclude",
  }));
}

/**
 * `<bpdm-loading-overlay>` — covers its nearest positioned ancestor (give that
 * ancestor `relative`), or the whole viewport with `fullPage`, with a soft,
 * blurred scrim and a centered spinner. Use it page-level or scoped to a card.
 */
@Component({
  selector: "bpdm-loading-overlay",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmSpinner],
  host: {
    role: "status",
    "aria-live": "polite",
    "aria-busy": "true",
    "[class]": "hostClass()",
    "[class.hidden]": "!show()",
  },
  template: `
    <bpdm-spinner [variant]="variant()" [size]="spinnerSize()" [label]="label() ?? 'Loading'" />
    @if (label()) {
      <p class="m-0 text-sm font-medium text-muted-foreground">{{ label() }}</p>
    }
    <ng-content />
  `,
})
export class BpdmLoadingOverlay {
  /** Show the overlay. */
  readonly show = input(true, { transform: booleanAttribute });
  /** Visible message under the spinner. */
  readonly label = input<string>();
  readonly variant = input<SpinnerVariant>("ring");
  readonly size = input<SpinnerSize>();
  /** Cover the whole viewport instead of the nearest positioned ancestor. */
  readonly fullPage = input(false, { transform: booleanAttribute });
  /** Blur the content behind the overlay. */
  readonly blur = input(true, { transform: booleanAttribute });

  protected readonly spinnerSize = computed<SpinnerSize>(
    () => this.size() ?? (this.fullPage() ? "lg" : "md"),
  );
  protected readonly hostClass = computed(() =>
    cn(
      "z-50 flex flex-col items-center justify-center gap-3 bg-background/60 animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
      this.fullPage() ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
      this.blur() && "backdrop-blur-sm",
    ),
  );
}
