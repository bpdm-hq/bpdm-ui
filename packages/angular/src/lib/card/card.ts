import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  ElementRef,
  inject,
  input,
} from "@angular/core";
import { cardVariants, cn, type CardVariants } from "@bpdm/variants";

/**
 * `<bpdm-card>` — a surface container. Compose it with the card parts:
 *
 * ```html
 * <bpdm-card variant="outlined" hoverable>
 *   <bpdm-card-header>
 *     <h3 bpdmCardTitle>Deployment</h3>
 *     <p bpdmCardDescription>Triggered 2 minutes ago</p>
 *     <button bpdmButton size="iconSm" variant="secondary" appearance="ghost" bpdmCardAction aria-label="Menu">⋯</button>
 *   </bpdm-card-header>
 *   <div bpdmCardContent>Build #482 is rolling out to production.</div>
 *   <div bpdmCardFooter divider><button bpdmButton size="sm">View logs</button></div>
 * </bpdm-card>
 * ```
 */
@Component({
  selector: "bpdm-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    // An `interactive` card carries hover/press affordances, so it must be a
    // real, keyboard-operable control: focusable + role=button + Enter/Space.
    "[attr.role]": "interactive() ? 'button' : null",
    "[attr.tabindex]": "interactive() ? 0 : null",
    "(keydown)": "onKeyDown($event)",
  },
  template: `<ng-content />`,
})
export class BpdmCard {
  /** Surface style. */
  readonly variant = input<NonNullable<CardVariants["variant"]>>("elevated");
  /** Lift + deepen the shadow on hover. */
  readonly hoverable = input(false, { transform: booleanAttribute });
  /** Focusable + pressable (use for fully-clickable cards). */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Extra classes, merged with tailwind-merge. */
  readonly classInput = input<string>("", { alias: "class" });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly classes = computed(() =>
    cn(
      cardVariants({
        variant: this.variant(),
        hoverable: this.hoverable(),
        interactive: this.interactive(),
      }),
      this.classInput(),
    ),
  );

  protected onKeyDown(e: KeyboardEvent): void {
    if (!this.interactive()) return;
    // only self-activate — never hijack Enter/Space aimed at a nested control
    if (e.target !== this.host.nativeElement) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      this.host.nativeElement.click();
    }
  }
}

const ASPECTS: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  auto: "",
};

/**
 * Edge-to-edge media band at the top (or side) of a card. Pass `src` for an
 * image (it zooms on card hover) or project your own content. `overlay` adds a
 * bottom scrim for text placed over the media.
 */
@Component({
  selector: "bpdm-card-media",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "hostClass()" },
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt()"
        class="size-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]"
      />
    } @else {
      <ng-content />
    }
    @if (overlay()) {
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent"
      ></div>
    }
  `,
})
export class BpdmCardMedia {
  /** Image URL; omit to project custom content instead. */
  readonly src = input<string>();
  readonly alt = input("");
  /** Aspect ratio of the band. Default `video` (16:9). */
  readonly aspect = input<keyof typeof ASPECTS>("video");
  /** Dark gradient scrim at the bottom (for text/badges over the media). */
  readonly overlay = input(false, { transform: booleanAttribute });
  /** Extra classes, merged with tailwind-merge. */
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly hostClass = computed(() =>
    cn("relative block overflow-hidden bg-muted", ASPECTS[this.aspect()], this.classInput()),
  );
}

/** Header row — projects the title/description; mark a trailing element `bpdmCardAction`. */
@Component({
  selector: "bpdm-card-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex items-start justify-between gap-4 px-5 pt-5" },
  template: `
    <div class="flex min-w-0 flex-col gap-1"><ng-content /></div>
    <div class="shrink-0"><ng-content select="[bpdmCardAction]" /></div>
  `,
})
export class BpdmCardHeader {}

/** Card title — apply to a heading element. */
@Directive({
  selector: "[bpdmCardTitle]",
  host: { class: "m-0 text-lg font-semibold leading-tight tracking-tight" },
})
export class BpdmCardTitle {}

/** Card description — apply to a paragraph. */
@Directive({
  selector: "[bpdmCardDescription]",
  host: { class: "m-0 text-sm text-muted-foreground" },
})
export class BpdmCardDescription {}

/** Card body content. */
@Directive({
  selector: "[bpdmCardContent]",
  host: { class: "px-5 py-4 text-sm leading-relaxed text-muted-foreground" },
})
export class BpdmCardContent {}

/** Card footer (actions row). Set `divider` for a hairline above it. */
@Directive({
  selector: "[bpdmCardFooter]",
  host: {
    class: "mt-auto flex items-center gap-3 px-5 pb-5 pt-1",
    "[class.border-t]": "divider()",
    "[class.border-border]": "divider()",
    "[class.pt-4]": "divider()",
  },
})
export class BpdmCardFooter {
  /** Add a hairline divider above the footer. */
  readonly divider = input(false, { transform: booleanAttribute });
}
