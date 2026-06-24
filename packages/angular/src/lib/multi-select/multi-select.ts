import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from "@angular/cdk/scrolling";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import { type FieldSize, FIELD_PANEL, FIELD_TRIGGER_BASE, FIELD_TRIGGER_SIZE } from "../internal/field";
import {
  filterSelectRows,
  flattenSelectRows,
  type SelectItems,
  type SelectOption,
} from "../select/select";

const ROW_H = 36;

/**
 * `<bpdm-multi-select>` — searchable, virtualized multi-select (Select's bigger
 * sibling). Same `options` (flat or grouped), always virtualized. The trigger
 * shows up to `maxDisplay` chips then "+N", or a count when `maxDisplay=0`.
 * Mirrors the React `MultiSelect`.
 */
@Component({
  selector: "bpdm-multi-select",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  host: { class: "block" },
  template: `
    <div
      #trigger
      role="combobox"
      [attr.id]="id() || null"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="ariaInvalid() || null"
      [attr.aria-disabled]="disabled() || null"
      [attr.data-disabled]="disabled() ? '' : null"
      [tabindex]="disabled() ? -1 : 0"
      [class]="triggerClass()"
      (click)="!disabled() && toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        @if (selected().length === 0) {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        } @else if (maxDisplay() === 0) {
          <span>{{ selected().length }} selected</span>
        } @else {
          @for (o of chips(); track o.value) {
            <span class="inline-flex max-w-[140px] shrink-0 items-center gap-1 rounded-[calc(var(--radius)-4px)] bg-muted px-1.5 py-0.5 text-xs">
              <span class="truncate">{{ o.label }}</span>
              <button type="button" [attr.aria-label]="'Remove ' + o.label" tabindex="-1" (pointerdown)="$event.stopPropagation()" (click)="$event.stopPropagation(); toggle(o.value)" class="grid cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              </button>
            </span>
          }
          @if (extra() > 0) {
            <span class="shrink-0 text-xs text-muted-foreground">+{{ extra() }}</span>
          }
        }
      </div>
      <div class="flex shrink-0 items-center gap-1">
        @if (selected().length > 0 && !disabled()) {
          <button type="button" aria-label="Clear all" tabindex="-1" (pointerdown)="$event.stopPropagation()" (click)="$event.stopPropagation(); clearAll()" class="grid size-4 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        }
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 opacity-60 transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]" [class.rotate-180]="open()"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
    </div>

    <ng-template #panel>
      <div #panelRoot tabindex="-1" [class]="panelClass()" [style.width.px]="panelWidth()" (keydown)="onKeydown($event)">
        @if (searchable() || (selectAll() && filteredValues().length > 0)) {
          <div class="flex shrink-0 items-center gap-2 border-b border-border px-3">
            @if (selectAll() && filteredValues().length > 0) {
              <button type="button" (click)="toggleAll()" aria-label="Select all" title="Select all" [class]="searchable() ? 'flex shrink-0 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground' : 'flex w-full shrink-0 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground'">
                <span [class]="boxClass(allSel() || someSel())">
                  @if (allSel()) {
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  } @else if (someSel()) {
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M4 8h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
                  }
                </span>
                @if (!searchable()) { Select all }
              </button>
              @if (searchable()) { <span class="w-px shrink-0 self-stretch bg-border" aria-hidden="true"></span> }
            }
            @if (searchable()) {
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 text-muted-foreground"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" /><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
              <input #search [value]="query()" (input)="onSearch($any($event.target).value)" [attr.placeholder]="searchPlaceholder()" [attr.aria-label]="searchPlaceholder()" class="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            }
          </div>
        }
        @if (rows().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          <cdk-virtual-scroll-viewport #viewport role="listbox" aria-multiselectable="true" [itemSize]="36" [style.height.px]="viewportHeight()" class="overflow-auto px-1">
            <ng-container *cdkVirtualFor="let r of rows(); let i = index">
              @if (r.kind === "group") {
                <div class="flex h-9 items-center gap-2 px-2 text-sm font-semibold text-foreground">{{ r.label }}</div>
              } @else {
                <button type="button" role="option" [attr.aria-selected]="selectedSet().has(r.option.value)" [disabled]="r.option.disabled || null" (click)="toggle(r.option.value)" (mousemove)="active.set(i)" [class]="optionClass(i)">
                  <span [class]="boxClass(selectedSet().has(r.option.value))">
                    @if (selectedSet().has(r.option.value)) {
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5 animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    }
                  </span>
                  <span class="truncate">{{ r.option.label }}</span>
                </button>
              }
            </ng-container>
          </cdk-virtual-scroll-viewport>
        }
      </div>
    </ng-template>
  `,
})
export class BpdmMultiSelect implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly options = input<SelectItems>([]);
  readonly value = model<string[]>([]);
  readonly defaultValue = input<string[]>([]);
  readonly placeholder = input("Select…");
  /** Show a filter box at the top of the dropdown. */
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input("Search…");
  readonly emptyText = input("No results.");
  /** Max selected chips shown before "+N". 0 → show "N selected" count. Default 3. */
  readonly maxDisplay = input(3);
  /** Show a "Select all" row at the top of the dropdown. Default true. */
  readonly selectAll = input(true, { transform: booleanAttribute });
  /** Max height (px) of the scrollable option list. */
  readonly maxHeight = input(256);
  readonly size = input<FieldSize>("md");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input("", { alias: "class" });
  readonly id = input("");

  protected readonly open = signal(false);
  protected readonly query = signal("");
  protected readonly active = signal(0);
  protected readonly panelWidth = signal(0);

  private readonly triggerEl = viewChild.required<ElementRef<HTMLElement>>("trigger");
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>("panel");
  private readonly panelRoot = viewChild<ElementRef<HTMLElement>>("panelRoot");
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>("search");
  private readonly viewport = viewChild<CdkVirtualScrollViewport>("viewport");
  private overlayRef?: OverlayRef;
  private seeded = false;

  constructor() {
    // seed the selection from defaultValue once (uncontrolled use)
    effect(() => {
      const dv = this.defaultValue();
      untracked(() => {
        if (!this.seeded) {
          this.seeded = true;
          if (dv.length) this.value.set([...dv]);
        }
      });
    });
  }

  protected readonly selected = computed(() => this.value());
  protected readonly selectedSet = computed(() => new Set(this.value()));
  private readonly allRows = computed(() => flattenSelectRows(this.options()));
  protected readonly rows = computed(() => filterSelectRows(this.allRows(), this.query()));
  private readonly optionByValue = computed(() => {
    const m = new Map<string, SelectOption>();
    for (const r of this.allRows()) if (r.kind === "item") m.set(r.option.value, r.option);
    return m;
  });
  protected readonly chips = computed(() => {
    if (this.maxDisplay() <= 0) return [];
    const m = this.optionByValue();
    return this.value()
      .map((v) => m.get(v))
      .filter((o): o is SelectOption => !!o)
      .slice(0, this.maxDisplay());
  });
  protected readonly extra = computed(() => {
    const m = this.optionByValue();
    const total = this.value().filter((v) => m.has(v)).length;
    return total - this.chips().length;
  });
  protected readonly filteredValues = computed(() => {
    const out: string[] = [];
    for (const r of this.rows()) if (r.kind === "item" && !r.option.disabled) out.push(r.option.value);
    return out;
  });
  protected readonly allSel = computed(() => {
    const f = this.filteredValues();
    return f.length > 0 && f.every((v) => this.selectedSet().has(v));
  });
  protected readonly someSel = computed(
    () => !this.allSel() && this.filteredValues().some((v) => this.selectedSet().has(v)),
  );
  protected readonly viewportHeight = computed(() =>
    Math.min(this.maxHeight(), this.rows().length * ROW_H),
  );

  protected readonly triggerClass = computed(() =>
    cn(FIELD_TRIGGER_BASE, FIELD_TRIGGER_SIZE[this.size()], "group", this.classInput()),
  );
  protected readonly panelClass = computed(() => FIELD_PANEL);

  protected boxClass(on: boolean): string {
    return cn(
      "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors duration-[var(--bpdm-duration-fast)]",
      on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
    );
  }
  protected optionClass(i: number): string {
    return cn(
      "flex h-9 w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-3px)] px-2 text-left text-sm text-foreground transition-colors duration-[var(--bpdm-duration-fast)] disabled:pointer-events-none disabled:opacity-50",
      i === this.active() && "bg-muted",
    );
  }

  protected toggle(val?: string): void {
    if (val === undefined) {
      if (this.open()) this.close();
      else this.openPanel();
      return;
    }
    const has = this.selectedSet().has(val);
    this.value.set(has ? this.value().filter((v) => v !== val) : [...this.value(), val]);
  }

  protected clearAll(): void {
    this.value.set([]);
  }

  protected toggleAll(): void {
    const f = this.filteredValues();
    if (this.allSel()) {
      this.value.set(this.value().filter((v) => !f.includes(v)));
    } else {
      this.value.set(Array.from(new Set([...this.value(), ...f])));
    }
  }

  private openPanel(): void {
    if (this.disabled() || this.overlayRef) return;
    const trigger = this.triggerEl().nativeElement;
    this.panelWidth.set(trigger.offsetWidth);
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions([
        { originX: "start", originY: "bottom", overlayX: "start", overlayY: "top", offsetY: 4 },
        { originX: "start", originY: "top", overlayX: "start", overlayY: "bottom", offsetY: -4 },
      ])
      .withFlexibleDimensions(false)
      .withPush(false);
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.open.set(true);
    this.resetActive();
    this.overlayRef.outsidePointerEvents().subscribe((e) => {
      if (!trigger.contains(e.target as Node)) this.close();
    });
    setTimeout(() => {
      this.viewport()?.checkViewportSize();
      const search = this.searchEl()?.nativeElement;
      if (search) search.focus();
      else this.panelRoot()?.nativeElement.focus();
    });
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.query.set("");
    this.triggerEl().nativeElement.focus();
  }

  protected onSearch(v: string): void {
    this.query.set(v);
    this.resetActive();
  }

  private resetActive(): void {
    const first = this.rows().findIndex((r) => r.kind === "item");
    this.active.set(first === -1 ? 0 : first);
  }

  private move(dir: 1 | -1): void {
    const rows = this.rows();
    let i = this.active();
    do {
      i += dir;
    } while (i >= 0 && i < rows.length && rows[i].kind === "group");
    if (i < 0 || i >= rows.length) return;
    this.active.set(i);
    this.viewport()?.scrollToIndex(i, "smooth");
  }

  protected onTriggerKeydown(e: KeyboardEvent): void {
    if (this.disabled()) return;
    if (!this.open() && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      this.openPanel();
    }
  }

  protected onKeydown(e: KeyboardEvent): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = this.rows()[this.active()];
      if (r?.kind === "item" && !r.option.disabled) this.toggle(r.option.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
