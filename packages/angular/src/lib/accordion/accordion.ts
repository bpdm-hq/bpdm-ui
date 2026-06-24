import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  TemplateRef,
  untracked,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type AccordionVariant = "default" | "separated" | "borderless";
export type AccordionType = "single" | "multiple";

export interface AccordionItemData {
  value: string;
  title: string;
  content: TemplateRef<unknown>;
  icon?: TemplateRef<unknown>;
  disabled?: boolean;
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

/**
 * `<bpdm-accordion>` — accessible accordion (keyboard, ARIA) with a smoothly
 * animated height, a rotating chevron, and three looks (`default` bordered list,
 * `separated` cards, `borderless`). Single or multiple panels open at once.
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
    @for (item of items(); track item.value) {
      <div [class]="itemClass()" [attr.data-state]="isOpen(item.value) ? 'open' : 'closed'">
        <h3 class="flex">
          <button
            type="button"
            [class]="triggerClass()"
            [attr.data-state]="isOpen(item.value) ? 'open' : 'closed'"
            [attr.aria-expanded]="isOpen(item.value)"
            [disabled]="item.disabled || null"
            (click)="toggle(item)"
          >
            @if (item.icon) {
              <ng-container [ngTemplateOutlet]="item.icon" />
            }
            <span class="flex-1">{{ item.title }}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]"
              [class.rotate-180]="isOpen(item.value)"
              [class.!text-foreground]="isOpen(item.value)"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </h3>
        <div
          role="region"
          class="grid transition-[grid-template-rows] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]"
          [class]="isOpen(item.value) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div [class]="contentClass()">
              <ng-container [ngTemplateOutlet]="item.content" />
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
      "group flex flex-1 cursor-pointer items-center gap-3 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:font-semibold",
      TRIGGER_VARIANT[this.variant()],
    ),
  );
  protected readonly contentClass = computed(() =>
    cn("pt-0 text-sm leading-relaxed text-muted-foreground", CONTENT_PAD[this.variant()]),
  );

  protected isOpen(value: string): boolean {
    return this.openValues().includes(value);
  }

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
}
