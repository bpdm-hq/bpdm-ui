import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  untracked,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type AccordionVariant = "default" | "separated" | "borderless";
export type AccordionType = "single" | "multiple";
/** Heading level for each item's header (correct document outline). */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AccordionItemData {
  value: string;
  title: string;
  content: TemplateRef<unknown>;
  icon?: TemplateRef<unknown>;
  disabled?: boolean;
}

/** Per-item view model — open state + the ids that wire the trigger to its panel. */
interface AccordionRow {
  item: AccordionItemData;
  open: boolean;
  triggerId: string;
  regionId: string;
}

const ITEM_VARIANT: Record<AccordionVariant, string> = {
  separated:
    "rounded-[var(--radius)] border border-border bg-card transition-shadow data-[state=open]:shadow-sm",
  borderless: "border-b border-border",
  default: "border-b border-border last:border-b-0",
};
const TRIGGER_VARIANT: Record<AccordionVariant, string> = {
  separated: "px-4 py-3.5 font-medium text-foreground hover:bg-muted/50",
  default: "px-4 py-3.5 font-medium text-foreground hover:bg-muted/50",
  borderless:
    "px-0 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
};
const CONTENT_PAD: Record<AccordionVariant, string> = {
  separated: "px-4 pb-4",
  default: "px-4 pb-4",
  borderless: "px-0 pb-5",
};
const ROOT_VARIANT: Record<AccordionVariant, string> = {
  separated: "flex flex-col gap-2",
  borderless: "",
  default: "overflow-hidden rounded-[var(--radius)] border border-border",
};

// process-wide counter so every accordion instance gets collision-free ids
let accordionUid = 0;

/**
 * `<bpdm-accordion>` — accessible accordion (full WAI-ARIA disclosure pattern:
 * heading + button `aria-expanded`/`aria-controls`, panel `role="region"` labelled
 * by its trigger, collapsed panels removed from the tab order and hidden from
 * assistive tech, and Arrow/Home/End keyboard navigation between headers). Smoothly
 * animated height, a rotating chevron, and three looks (`default` bordered list,
 * `separated` cards, `borderless`). Single or multiple panels open at once, RTL-safe.
 * Data-driven via `items`. Mirrors the React `Accordion`.
 *
 * ```html
 * <bpdm-accordion [items]="faq" variant="separated" defaultValue="deploys" />
 * ```
 */
@Component({
  selector: "bpdm-accordion",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { "[class]": "rootClass()" },
  template: `
    @for (row of rows(); track row.item.value) {
      <div [class]="itemClass()" [attr.data-state]="row.open ? 'open' : 'closed'">
        <div role="heading" [attr.aria-level]="headingLevel()" class="flex">
          <button
            type="button"
            data-accordion-trigger
            [id]="row.triggerId"
            [class]="triggerClass()"
            [attr.data-state]="row.open ? 'open' : 'closed'"
            [attr.aria-expanded]="row.open"
            [attr.aria-controls]="row.regionId"
            [disabled]="row.item.disabled || null"
            (click)="toggle(row.item)"
            (keydown)="onTriggerKey($event)"
          >
            @if (row.item.icon) {
              <ng-container [ngTemplateOutlet]="row.item.icon" />
            }
            <span class="flex-1">{{ row.item.title }}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]"
              [class.rotate-180]="row.open"
              [class.!text-foreground]="row.open"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <div
          role="region"
          [id]="row.regionId"
          [attr.aria-labelledby]="row.triggerId"
          [attr.inert]="row.open ? null : ''"
          class="grid transition-[grid-template-rows] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] motion-reduce:transition-none"
          [class]="row.open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div [class]="contentClass()">
              <ng-container [ngTemplateOutlet]="row.item.content" />
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class BpdmAccordion {
  readonly items = input<AccordionItemData[]>([]);
  readonly variant = input<AccordionVariant>("default");
  readonly type = input<AccordionType>("single");
  /** Allow closing the open item (single mode). Default true. */
  readonly collapsible = input(true);
  readonly defaultValue = input<string | string[]>("");
  /** Heading level for each item's header, for correct document outline. */
  readonly headingLevel = input<AccordionHeadingLevel>(3);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly baseId = `bpdm-accordion-${accordionUid++}`;
  private readonly openValues = signal<string[]>([]);

  constructor() {
    // seed the open set from defaultValue once it's known
    effect(() => {
      const dv = this.defaultValue();
      untracked(() => this.openValues.set(Array.isArray(dv) ? [...dv] : dv ? [dv] : []));
    });
  }

  protected readonly rootClass = computed(() => cn("block", ROOT_VARIANT[this.variant()]));
  protected readonly itemClass = computed(() => ITEM_VARIANT[this.variant()]);
  protected readonly triggerClass = computed(() =>
    cn(
      "group flex flex-1 cursor-pointer items-center gap-3 text-start text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:font-semibold",
      TRIGGER_VARIANT[this.variant()],
    ),
  );
  protected readonly contentClass = computed(() =>
    cn("pt-0 text-sm leading-relaxed text-muted-foreground", CONTENT_PAD[this.variant()]),
  );

  /** Open state + trigger/panel ids, recomputed only when items or open-set change. */
  protected readonly rows = computed<AccordionRow[]>(() => {
    const open = this.openValues();
    return this.items().map((item, i) => ({
      item,
      open: open.includes(item.value),
      triggerId: `${this.baseId}-trigger-${i}`,
      regionId: `${this.baseId}-region-${i}`,
    }));
  });

  protected toggle(item: AccordionItemData): void {
    if (item.disabled) return;
    const open = this.openValues();
    const isOpen = open.includes(item.value);
    if (this.type() === "multiple") {
      this.openValues.set(isOpen ? open.filter((v) => v !== item.value) : [...open, item.value]);
    } else {
      this.openValues.set(isOpen ? (this.collapsible() ? [] : open) : [item.value]);
    }
  }

  /**
   * WAI-ARIA accordion keyboard navigation: Arrow Down/Up move focus to the
   * next/previous enabled header, Home/End to the first/last. Enter/Space toggle
   * natively (the header is a `<button>`).
   */
  protected onTriggerKey(e: KeyboardEvent): void {
    const key = e.key;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
    const triggers = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>("button[data-accordion-trigger]"),
    ).filter((b) => !b.disabled);
    if (triggers.length === 0) return;
    e.preventDefault();
    const current = triggers.indexOf(e.target as HTMLButtonElement);
    let next = current;
    switch (key) {
      case "ArrowDown":
        next = current < 0 ? 0 : Math.min(current + 1, triggers.length - 1);
        break;
      case "ArrowUp":
        next = current < 0 ? 0 : Math.max(current - 1, 0);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = triggers.length - 1;
        break;
    }
    triggers[next]?.focus();
  }
}
