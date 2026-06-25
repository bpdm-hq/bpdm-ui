import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { BpdmButton } from "../button/button";
import { BpdmCheckbox } from "../checkbox/checkbox";
import { BpdmPopover } from "../popover/popover";
import {
  type ColumnFilter,
  type FilterOperator,
  NUM_OPS,
  TEXT_OPS,
} from "./data-table-types";

const FILTER_FIELD =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

/** The funnel button + popover with the per-column filter UI (text / number / select). */
@Component({
  selector: "bpdm-column-filter-menu",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmPopover, BpdmButton, BpdmCheckbox],
  host: { class: "contents" },
  template: `
    <button
      type="button"
      aria-label="Filter column"
      [bpdmPopover]="panel"
      [(bpdmPopoverOpen)]="open"
      bpdmPopoverAlign="start"
      (click)="$event.stopPropagation()"
      [class]="triggerClass()"
    >
      <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
        <path d="M2 3.5h12l-4.6 5.4v3.6l-2.8 1.4V8.9L2 3.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
      </svg>
    </button>

    <ng-template #panel>
      @if (type() === "select") {
        <div class="w-56 space-y-2">
          <div class="max-h-56 space-y-0.5 overflow-y-auto">
            @for (o of options(); track o.value) {
              <label class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted">
                <bpdm-checkbox
                  size="sm"
                  [checked]="selected().includes(o.value)"
                  (checkedChange)="toggleSelected(o.value)"
                />
                <span class="truncate">{{ o.label }}</span>
              </label>
            } @empty {
              <p class="px-2 py-1.5 text-sm text-muted-foreground">No values</p>
            }
          </div>
          <div class="flex items-center justify-between border-t border-border pt-2">
            <button bpdmButton variant="secondary" appearance="ghost" size="sm" (click)="doClear(close)">Clear</button>
            <button bpdmButton size="sm" (click)="applySelect(close)">Apply</button>
          </div>
        </div>
      } @else {
        <div class="w-64 space-y-2.5">
          @if (draft().rules.length > 1) {
            <div class="relative">
              <select
                [value]="draft().matchMode"
                (change)="setMatchMode($any($event.target).value)"
                [class]="cn(filterField, 'cursor-pointer appearance-none pr-8 font-medium')"
              >
                <option value="all">Match all</option>
                <option value="any">Match any</option>
              </select>
              <svg viewBox="0 0 16 16" fill="none" class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          }
          @for (rule of draft().rules; track i; let i = $index) {
            <div class="space-y-2">
              <div class="relative">
                <select
                  [value]="rule.op"
                  (change)="setOp(i, $any($event.target).value)"
                  [class]="cn(filterField, 'cursor-pointer appearance-none pr-8')"
                >
                  @for (o of ops(); track o.value) {
                    <option [value]="o.value">{{ o.label }}</option>
                  }
                </select>
                <svg viewBox="0 0 16 16" fill="none" class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <input
                [type]="type() === 'number' ? 'number' : 'text'"
                [value]="rule.value"
                placeholder="Value"
                (input)="setValue(i, $any($event.target).value)"
                [class]="filterField"
              />
              @if (draft().rules.length > 1) {
                <button
                  type="button"
                  (click)="removeRule(i)"
                  class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
                    <path d="M3 4.5h10M6.5 4.5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M5 4.5l.5 8a1 1 0 0 0 1 .9h3a1 1 0 0 0 1-.9l.5-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Remove rule
                </button>
              }
              @if (i < draft().rules.length - 1) {
                <div class="border-t border-border"></div>
              }
            </div>
          }
          <button
            type="button"
            (click)="addRule()"
            class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] border border-dashed border-border py-1.5 text-sm text-primary transition-colors hover:bg-primary/5"
          >
            + Add rule
          </button>
          <div class="flex items-center justify-between pt-0.5">
            <button bpdmButton variant="secondary" appearance="ghost" size="sm" (click)="doClear(close)">Clear</button>
            <button bpdmButton size="sm" (click)="applyDraft(close)">Apply</button>
          </div>
        </div>
      }
    </ng-template>
  `,
})
export class BpdmColumnFilterMenu {
  readonly type = input<"text" | "number" | "select">("text");
  readonly options = input<{ value: string; label: string }[]>([]);
  readonly filter = input<ColumnFilter | undefined>(undefined);
  readonly apply = output<ColumnFilter>();
  readonly clear = output<void>();

  protected readonly cn = cn;
  protected readonly filterField = FILTER_FIELD;
  protected readonly open = signal(false);
  protected readonly ops = computed(() => (this.type() === "number" ? NUM_OPS : TEXT_OPS));

  protected readonly draft = signal<ColumnFilter>({ matchMode: "all", rules: [] });
  protected readonly selected = signal<string[]>([]);

  protected readonly triggerClass = computed(() => {
    const active = !!this.filter() && this.filter()!.rules.some((r) => r.value !== "");
    return cn(
      "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "text-primary" : "text-muted-foreground/70",
    );
  });

  constructor() {
    // (re)seed the draft from the active filter each time the menu opens
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        const f = this.filter();
        this.draft.set(f ?? { matchMode: "all", rules: [{ op: this.ops()[0].value, value: "" }] });
        this.selected.set(f?.rules.map((r) => r.value) ?? []);
      });
    });
  }

  protected toggleSelected(value: string): void {
    this.selected.update((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]));
  }

  protected setMatchMode(v: string): void {
    this.draft.update((d) => ({ ...d, matchMode: v as "all" | "any" }));
  }
  protected setOp(i: number, v: string): void {
    this.draft.update((d) => {
      const rules = [...d.rules];
      rules[i] = { ...rules[i], op: v as FilterOperator };
      return { ...d, rules };
    });
  }
  protected setValue(i: number, v: string): void {
    this.draft.update((d) => {
      const rules = [...d.rules];
      rules[i] = { ...rules[i], value: v };
      return { ...d, rules };
    });
  }
  protected removeRule(i: number): void {
    this.draft.update((d) => ({ ...d, rules: d.rules.filter((_, j) => j !== i) }));
  }
  protected addRule(): void {
    this.draft.update((d) => ({ ...d, rules: [...d.rules, { op: this.ops()[0].value, value: "" }] }));
  }

  protected applyDraft(close: () => void): void {
    this.apply.emit(this.draft());
    close();
  }
  protected applySelect(close: () => void): void {
    this.apply.emit({
      matchMode: "any",
      rules: this.selected().map((v) => ({ op: "equals" as FilterOperator, value: v })),
    });
    close();
  }
  protected doClear(close: () => void): void {
    this.clear.emit();
    close();
  }

  protected readonly close = () => this.open.set(false);
}
