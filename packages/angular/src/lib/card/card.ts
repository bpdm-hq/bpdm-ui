import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
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
 *     <button bpdmButton size="iconSm" variant="ghost" bpdmCardAction aria-label="Menu">⋯</button>
 *   </bpdm-card-header>
 *   <div bpdmCardContent>Build #482 is rolling out to production.</div>
 *   <div bpdmCardFooter divider><button bpdmButton size="sm">View logs</button></div>
 * </bpdm-card>
 * ```
 */
@Component({
  selector: "bpdm-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class]": "classes()" },
  template: `<ng-content />`,
})
export class BpdmCard {
  /** Surface style. */
  readonly variant = input<NonNullable<CardVariants["variant"]>>("elevated");
  /** Lift + deepen the shadow on hover. */
  readonly hoverable = input(false);
  /** Focusable + pressable (use for fully-clickable cards). */
  readonly interactive = input(false);
  /** Extra classes, merged with tailwind-merge. */
  readonly classInput = input<string>("", { alias: "class" });

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
  host: { class: "text-lg font-semibold leading-tight tracking-tight" },
})
export class BpdmCardTitle {}

/** Card description — apply to a paragraph. */
@Directive({
  selector: "[bpdmCardDescription]",
  host: { class: "text-sm text-muted-foreground" },
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
  readonly divider = input(false);
}
