import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  TemplateRef,
  viewChildren,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type TabsVariant = "underline" | "pill";
export type TabsBaseline = "full" | "content";

export interface TabItem {
  value: string;
  label: string;
  /** Optional leading icon template. */
  icon?: TemplateRef<unknown>;
  /** Optional panel content template. */
  content?: TemplateRef<unknown>;
  disabled?: boolean;
}

let tid = 0;

const TRIGGER_BASE =
  "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";
const TRIGGER_VARIANT: Record<TabsVariant, string> = {
  underline:
    "-mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary",
  pill: "rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground",
};

/**
 * `<bpdm-tabs>` — accessible tabs (roving focus, arrow-key nav) with two looks:
 * `underline` (a line indicator under the active tab) and `pill` (a filled active
 * tab). Data-driven via `items`; controlled or uncontrolled (`[(value)]` /
 * `defaultValue`); supports icons, disabled tabs, and `fullWidth`. Mirrors the
 * React `Tabs`.
 *
 * ```html
 * <bpdm-tabs [items]="tabs" variant="underline" />
 * ```
 */
@Component({
  selector: "bpdm-tabs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { "[class]": "hostClass()" },
  template: `
    <div role="tablist" [class]="listClass()" (keydown)="onKeydown($event)">
      @for (t of items(); track t.value) {
        <button
          #tab
          type="button"
          role="tab"
          [id]="ids + '-tab-' + t.value"
          [attr.aria-selected]="t.value === active()"
          [attr.aria-controls]="ids + '-panel-' + t.value"
          [attr.data-state]="t.value === active() ? 'active' : 'inactive'"
          [tabindex]="t.value === active() ? 0 : -1"
          [disabled]="t.disabled || null"
          [class]="triggerClass()"
          (click)="select(t)"
        >
          @if (t.icon) {
            <ng-container [ngTemplateOutlet]="t.icon" />
          }
          {{ t.label }}
        </button>
      }
    </div>
    @if (hasContent()) {
      @for (t of items(); track t.value) {
        @if (t.value === active()) {
          <div
            role="tabpanel"
            [id]="ids + '-panel-' + t.value"
            [attr.aria-labelledby]="ids + '-tab-' + t.value"
            class="pt-4 outline-none animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]"
          >
            @if (t.content) {
              <ng-container [ngTemplateOutlet]="t.content" />
            }
          </div>
        }
      }
    }
  `,
})
export class BpdmTabs {
  readonly items = input<TabItem[]>([]);
  readonly value = model<string>("");
  readonly defaultValue = input<string>("");
  readonly variant = input<TabsVariant>("underline");
  readonly baseline = input<TabsBaseline>("full");
  readonly fullWidth = input(false, { transform: booleanAttribute });

  protected readonly ids = `bpdm-tabs-${++tid}`;
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>("tab");

  /** The effective active value — controlled `value`, else default, else first tab. */
  protected readonly active = computed(
    () => this.value() || this.defaultValue() || this.items()[0]?.value || "",
  );
  protected readonly hasContent = computed(() => this.items().some((t) => t.content));

  protected readonly hostClass = computed(() => "block");

  protected readonly listClass = computed(() =>
    cn(
      "flex items-center gap-1",
      this.variant() === "underline" && "border-b border-border",
      this.variant() === "underline" && this.baseline() === "content" && "w-fit",
      this.fullWidth() && "w-full",
    ),
  );

  protected readonly triggerClass = computed(() =>
    cn(TRIGGER_BASE, TRIGGER_VARIANT[this.variant()], this.fullWidth() && "flex-1 justify-center"),
  );

  protected select(t: TabItem): void {
    if (t.disabled) return;
    this.value.set(t.value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const items = this.items();
    const enabled = items.filter((t) => !t.disabled);
    if (!enabled.length) return;
    const curr = enabled.findIndex((t) => t.value === this.active());
    let nextIdx = curr;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIdx = (curr + 1) % enabled.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIdx = (curr - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = enabled.length - 1;
        break;
    }
    const target = enabled[nextIdx];
    this.value.set(target.value);
    // move focus to the newly active tab
    const fullIndex = items.findIndex((t) => t.value === target.value);
    this.tabs()[fullIndex]?.nativeElement.focus();
  }
}
