import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  CONTROL_BTN_CLASS,
  type ItemKey,
  type ItemKeyFn,
  moveSelectedBottom,
  moveSelectedDown,
  moveSelectedTop,
  moveSelectedUp,
  sameOrder,
} from "./list-internals";

/**
 * `<bpdm-reorder-controls>` — the up / to-top / down / to-bottom column used by
 * `OrderList` and `PickList`. Emits the reordered array.
 */
@Component({
  selector: "bpdm-reorder-controls",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  template: `
    <div [class]="rootClass()">
      <button type="button" aria-label="Move up" title="Move up" [class]="btn" [disabled]="!canUp()" (click)="apply('up')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 15 6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <button type="button" aria-label="Move to top" title="Move to top" [class]="btn" [disabled]="!canTop()" (click)="apply('top')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 17 5-5 5 5M7 11l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <button type="button" aria-label="Move down" title="Move down" [class]="btn" [disabled]="!canDown()" (click)="apply('down')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <button type="button" aria-label="Move to bottom" title="Move to bottom" [class]="btn" [disabled]="!canBottom()" (click)="apply('bottom')">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 5 5 5-5M7 13l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
  `,
})
export class BpdmReorderControls<T = unknown> {
  readonly items = input<T[]>([]);
  readonly itemKey = input.required<ItemKeyFn<T>>();
  readonly selected = input<Set<ItemKey>>(new Set());
  readonly classInput = input<string>("", { alias: "class" });
  readonly reorder = output<T[]>();

  protected readonly btn = CONTROL_BTN_CLASS;
  protected readonly rootClass = computed(() => cn("flex flex-row gap-1.5 sm:flex-col", this.classInput()));

  private readonly fns = {
    up: moveSelectedUp,
    top: moveSelectedTop,
    down: moveSelectedDown,
    bottom: moveSelectedBottom,
  } as const;

  private can(kind: keyof typeof this.fns): boolean {
    if (this.selected().size === 0) return false;
    const next = this.fns[kind](this.items(), this.itemKey(), this.selected());
    return !sameOrder(next, this.items(), this.itemKey());
  }
  protected readonly canUp = computed(() => this.can("up"));
  protected readonly canTop = computed(() => this.can("top"));
  protected readonly canDown = computed(() => this.can("down"));
  protected readonly canBottom = computed(() => this.can("bottom"));

  protected apply(kind: keyof typeof this.fns): void {
    const next = this.fns[kind](this.items(), this.itemKey(), this.selected());
    if (!sameOrder(next, this.items(), this.itemKey())) this.reorder.emit(next);
  }
}
