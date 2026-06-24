import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  TemplateRef,
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
import {
  type FieldSize,
  FIELD_PANEL,
  SELECT_TRIGGER_BASE,
  SELECT_TRIGGER_SIZE,
} from "../internal/field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}
export type SelectItems = Array<SelectOption | SelectOptionGroup>;

const isGroup = (x: SelectOption | SelectOptionGroup): x is SelectOptionGroup =>
  Array.isArray((x as SelectOptionGroup).options);

export type SelectRow =
  | { kind: "group"; label: string }
  | { kind: "item"; option: SelectOption };

const ROW_H = 36;

export function flattenSelectRows(options: SelectItems): SelectRow[] {
  const rows: SelectRow[] = [];
  for (const entry of options) {
    if (isGroup(entry)) {
      rows.push({ kind: "group", label: entry.label });
      for (const o of entry.options) rows.push({ kind: "item", option: o });
    } else {
      rows.push({ kind: "item", option: entry });
    }
  }
  return rows;
}

export function filterSelectRows(all: SelectRow[], query: string): SelectRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  const out: SelectRow[] = [];
  let pending: SelectRow | null = null;
  let used = false;
  for (const r of all) {
    if (r.kind === "group") {
      pending = r;
      used = false;
    } else if (r.option.label.toLowerCase().includes(q)) {
      if (pending && !used) {
        out.push(pending);
        used = true;
      }
      out.push(r);
    }
  }
  return out;
}

/**
 * `<bpdm-select>` — single-select dropdown. Data-driven (`options`, flat or
 * grouped), always **virtualized** (10k+ rows stay smooth), with an optional
 * **searchable** filter. Controlled (`[(value)]`) or uncontrolled (`defaultValue`).
 * Mirrors the React `Select`.
 */
@Component({
  selector: "bpdm-select",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf],
  host: { class: "block" },
  template: `
    <button
      #trigger
      type="button"
      role="combobox"
      [attr.id]="id() || null"
      [attr.aria-expanded]="open()"
      [attr.aria-invalid]="ariaInvalid() || null"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [disabled]="disabled() || null"
      [class]="triggerClass()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="truncate" [class.text-muted-foreground]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 opacity-60 transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]" [class.rotate-180]="open()">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <ng-template #panel>
      <div #panelRoot tabindex="-1" [class]="panelClass()" [style.width.px]="panelWidth()" (keydown)="onKeydown($event)">
        @if (searchable()) {
          <div class="flex shrink-0 items-center gap-2 border-b border-border px-3">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 text-muted-foreground"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" /><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            <input #search [value]="query()" (input)="onSearch($any($event.target).value)" [attr.placeholder]="searchPlaceholder()" [attr.aria-label]="searchPlaceholder()" class="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
        }
        @if (rows().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          <cdk-virtual-scroll-viewport
            #viewport
            role="listbox"
            [itemSize]="36"
            [style.height.px]="viewportHeight()"
            class="overflow-auto px-1"
          >
            <ng-container *cdkVirtualFor="let r of rows(); let i = index">
              @if (r.kind === "group") {
                <div class="flex h-9 items-center gap-2 px-2 text-sm font-semibold text-foreground">{{ r.label }}</div>
              } @else {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="r.option.value === selected()"
                  [disabled]="r.option.disabled || null"
                  (click)="commit(r.option)"
                  (mousemove)="active.set(i)"
                  [class]="optionClass(i)"
                >
                  <span class="flex size-4 shrink-0 items-center justify-center text-primary">
                    @if (r.option.value === selected()) {
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
export class BpdmSelect implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly options = input<SelectItems>([]);
  readonly value = model<string>("");
  readonly defaultValue = input<string>("");
  readonly placeholder = input("Select…");
  /** Show a filter box at the top of the dropdown. */
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input("Search…");
  readonly emptyText = input("No results.");
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

  private readonly triggerEl = viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>("panel");
  private readonly panelRoot = viewChild<ElementRef<HTMLElement>>("panelRoot");
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>("search");
  private readonly viewport = viewChild<CdkVirtualScrollViewport>("viewport");

  protected readonly panelWidth = signal(0);
  private overlayRef?: OverlayRef;

  protected readonly selected = computed(() => this.value() || this.defaultValue());
  private readonly allRows = computed(() => flattenSelectRows(this.options()));
  protected readonly rows = computed(() => filterSelectRows(this.allRows(), this.query()));
  protected readonly viewportHeight = computed(() =>
    Math.min(this.maxHeight(), this.rows().length * ROW_H),
  );
  protected readonly selectedLabel = computed(() => {
    const sel = this.selected();
    for (const r of this.allRows()) if (r.kind === "item" && r.option.value === sel) return r.option.label;
    return "";
  });

  protected readonly triggerClass = computed(() =>
    cn(SELECT_TRIGGER_BASE, SELECT_TRIGGER_SIZE[this.size()], "group", this.classInput()),
  );
  protected readonly panelClass = computed(() => FIELD_PANEL);

  protected optionClass(i: number): string {
    return cn(
      "flex h-9 w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-3px)] px-2 text-left text-sm text-foreground transition-colors duration-[var(--bpdm-duration-fast)] disabled:pointer-events-none disabled:opacity-50",
      i === this.active() && "bg-muted",
    );
  }

  protected toggle(): void {
    if (this.open()) this.close();
    else this.openPanel();
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
    // measure the virtual viewport + move focus once the panel has rendered
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

  protected commit(option: SelectOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
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
    if (!this.open() && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
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
      if (r?.kind === "item" && !r.option.disabled) this.commit(r.option);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
