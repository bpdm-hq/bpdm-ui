import { NgTemplateOutlet } from "@angular/common";
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
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import { type FieldSize, FIELD_PANEL, FIELD_TRIGGER_BASE, FIELD_TRIGGER_SIZE } from "../internal/field";

export interface TreeNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: TreeNode[];
}

// a single visible (expanded) treeitem, in DOM order, for keyboard navigation
interface FlatRow {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  isOpen: boolean;
  parentValue: string | null;
}

function leafValues(node: TreeNode): string[] {
  if (!node.children?.length) return node.disabled ? [] : [node.value];
  return node.children.flatMap(leafValues);
}

// keep nodes matching the query (full subtree) + ancestors of matches; collect
// ancestor values to force-expand so matches are visible.
function filterTree(nodes: TreeNode[], q: string): { nodes: TreeNode[]; expand: Set<string> } {
  const expand = new Set<string>();
  const rec = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const n of list) {
      if (n.label.toLowerCase().includes(q)) {
        out.push(n);
      } else if (n.children?.length) {
        const kids = rec(n.children);
        if (kids.length) {
          out.push({ ...n, children: kids });
          expand.add(n.value);
        }
      }
    }
    return out;
  };
  return { nodes: rec(nodes), expand };
}

/** Per-instance counter for a stable tree id (aria-controls). */
let treeUid = 0;

/**
 * `<bpdm-tree-select>` — hierarchical multi-select. Expand/collapse branches;
 * checking a parent selects all its (enabled) leaves, and a parent shows
 * indeterminate when only some leaves are selected. Selection is leaf-based —
 * `value` is the array of selected leaf values. Mirrors the React `TreeSelect`.
 */
@Component({
  selector: "bpdm-tree-select",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: "block" },
  template: `
    <div
      #trigger
      role="combobox"
      aria-haspopup="tree"
      [attr.id]="id() || null"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? treeId : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="ariaInvalid() || null"
      [attr.aria-disabled]="disabled() || null"
      [attr.data-disabled]="disabled() ? '' : null"
      [tabindex]="disabled() ? -1 : 0"
      [class]="triggerClass()"
      (click)="!disabled() && toggleOpen()"
      (keydown)="onTriggerKeydown($event)"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        @if (selectedLeaves().length === 0) {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        } @else if (maxDisplay() === 0) {
          <span>{{ t().selected(selectedLeaves().length) }}</span>
        } @else {
          @for (o of chips(); track o.value) {
            <span class="inline-flex max-w-[140px] shrink-0 items-center gap-1 rounded-[calc(var(--radius)-4px)] bg-muted px-1.5 py-0.5 text-xs">
              <span class="truncate">{{ o.label }}</span>
            </span>
          }
          @if (extra() > 0) {
            <span class="shrink-0 text-xs text-muted-foreground">+{{ extra() }}</span>
          }
        }
      </div>
      <div class="flex shrink-0 items-center gap-1">
        @if (selectedLeaves().length > 0 && !disabled()) {
          <button type="button" [attr.aria-label]="t().clearAll" tabindex="-1" (pointerdown)="$event.stopPropagation()" (click)="$event.stopPropagation(); clearAll()" class="grid size-4 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
        }
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 opacity-60 transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]" [class.rotate-180]="open()"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
    </div>

    <ng-template #panel>
      <div [class]="panelClass()" [style.width.px]="panelWidth()" (keydown.escape)="close()">
        @if (searchable() || (selectAll() && visibleLeaves().length > 0)) {
          <div class="flex shrink-0 items-center gap-2 border-b border-border px-3">
            @if (selectAll() && visibleLeaves().length > 0) {
              <button type="button" role="checkbox" [attr.aria-checked]="allSel() ? 'true' : someSel() ? 'mixed' : 'false'" (click)="toggleAll()" [attr.aria-label]="t().selectAll" [attr.title]="t().selectAll" [class]="searchable() ? 'flex shrink-0 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground' : 'flex w-full shrink-0 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground'">
                <span [class]="boxClass(allSel() || someSel())">
                  @if (allSel()) {
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  } @else if (someSel()) {
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M4 8h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
                  }
                </span>
                @if (!searchable()) { {{ t().selectAll }} }
              </button>
              @if (searchable()) { <span class="w-px shrink-0 self-stretch bg-border" aria-hidden="true"></span> }
            }
            @if (searchable()) {
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4 shrink-0 text-muted-foreground"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" /><path d="M11 11l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
              <input #search [value]="query()" (input)="query.set($any($event.target).value)" [attr.placeholder]="searchPlaceholder()" [attr.aria-label]="searchPlaceholder()" class="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            }
          </div>
        }
        @if (visibleTree().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          <div
            #tree
            role="tree"
            [attr.id]="treeId"
            [attr.aria-label]="ariaLabel() || placeholder()"
            aria-multiselectable="true"
            tabindex="0"
            [attr.aria-activedescendant]="activeDescId()"
            (keydown)="onTreeKeydown($event)"
            class="min-h-0 flex-1 overflow-auto p-1 focus:outline-none"
            [style.maxHeight.px]="maxHeight()"
          >
            @for (n of visibleTree(); track n.value; let i = $index) {
              <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: n, depth: 0, pos: i + 1, size: visibleTree().length }" />
            }
          </div>
        }
      </div>
    </ng-template>

    <ng-template #nodeTpl let-n let-depth="depth" let-pos="pos" let-size="size">
      <div
        [attr.id]="itemId(n.value)"
        role="treeitem"
        [attr.aria-level]="depth + 1"
        [attr.aria-setsize]="size"
        [attr.aria-posinset]="pos"
        [attr.aria-selected]="nodeChecked(n)"
        [attr.aria-checked]="nodeIndeterminate(n) ? 'mixed' : nodeChecked(n)"
        [attr.aria-expanded]="n.children?.length ? isExpanded(n) : null"
        [attr.aria-disabled]="n.disabled || null"
      >
        <div class="flex items-center gap-1.5 rounded-[calc(var(--radius)-3px)] py-1.5 pe-2 transition-colors duration-[var(--bpdm-duration-fast)] hover:bg-muted" [class.bg-muted]="activeValue() === n.value" [style.paddingInlineStart.px]="8 + depth * 18">
          @if (n.children?.length) {
            <button type="button" tabindex="-1" [attr.aria-label]="isExpanded(n) ? t().collapse : t().expand" (click)="toggleExpand(n.value)" class="grid size-4 shrink-0 cursor-pointer place-items-center text-muted-foreground hover:text-foreground">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5 transition-transform rtl:-scale-x-100" [class.rotate-90]="isExpanded(n)"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          } @else {
            <span class="size-4 shrink-0"></span>
          }
          <button type="button" tabindex="-1" [disabled]="n.disabled || null" (click)="toggleNode(n)" class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-start text-sm text-foreground disabled:pointer-events-none disabled:opacity-50">
            <span aria-hidden="true" [class]="boxClass(nodeChecked(n) || nodeIndeterminate(n))">
              @if (nodeChecked(n)) {
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              } @else if (nodeIndeterminate(n)) {
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5"><path d="M4 8h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
              }
            </span>
            <span class="truncate">{{ n.label }}</span>
          </button>
        </div>
        @if (n.children?.length && isExpanded(n)) {
          <div role="group">
            @for (c of n.children; track c.value; let i = $index) {
              <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: c, depth: depth + 1, pos: i + 1, size: n.children.length }" />
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class BpdmTreeSelect implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly options = input<TreeNode[]>([]);
  readonly value = model<string[]>([]);
  readonly defaultValue = input<string[]>([]);
  readonly placeholder = input("Select…");
  /** Show a filter box at the top of the dropdown. */
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input("Search…");
  readonly emptyText = input("No results.");
  /** Show a "Select all" row in the header. Default true. */
  readonly selectAll = input(true, { transform: booleanAttribute });
  readonly maxDisplay = input(3);
  /** Max height (px) of the scrollable list. */
  readonly maxHeight = input(280);
  readonly size = input<FieldSize>("md");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input("", { alias: "class" });
  readonly id = input("");
  /** Accessible name for the trigger + tree — pass a translated string. */
  readonly ariaLabel = input("", { alias: "aria-label" });
  readonly ariaDescribedby = input("", { alias: "aria-describedby" });
  /** Screen-reader labels + count text — override for i18n. */
  readonly messages = input<{
    expand?: string;
    collapse?: string;
    selectAll?: string;
    clearAll?: string;
    selected?: (count: number) => string;
  }>({});

  protected readonly t = computed(() => ({
    expand: "Expand",
    collapse: "Collapse",
    selectAll: "Select all",
    clearAll: "Clear all",
    selected: (n: number) => `${n} selected`,
    ...this.messages(),
  }));
  protected readonly treeId = `bpdm-tree-${(treeUid += 1)}`;

  protected readonly open = signal(false);
  protected readonly query = signal("");
  private readonly expanded = signal<Set<string>>(new Set());
  protected readonly panelWidth = signal(0);
  /** value of the active (aria-activedescendant) treeitem. */
  protected readonly activeValue = signal<string | null>(null);

  private readonly triggerEl = viewChild.required<ElementRef<HTMLElement>>("trigger");
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>("panel");
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>("search");
  private readonly treeEl = viewChild<ElementRef<HTMLElement>>("tree");
  private overlayRef?: OverlayRef;
  private seeded = false;

  constructor() {
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

  private readonly q = computed(() => this.query().trim().toLowerCase());
  private readonly filtered = computed(() =>
    this.q() ? filterTree(this.options(), this.q()) : { nodes: this.options(), expand: null },
  );
  protected readonly visibleTree = computed(() => this.filtered().nodes);
  private readonly forceExpand = computed(() => this.filtered().expand);

  protected readonly selectedSet = computed(() => new Set(this.value()));
  private readonly leafLabel = computed(() => {
    const m = new Map<string, string>();
    const walk = (n: TreeNode) => {
      if (!n.children?.length) m.set(n.value, n.label);
      else n.children.forEach(walk);
    };
    this.options().forEach(walk);
    return m;
  });
  protected readonly selectedLeaves = computed(() => {
    const m = this.leafLabel();
    return this.value()
      .filter((v) => m.has(v))
      .map((v) => ({ value: v, label: m.get(v)! }));
  });
  protected readonly chips = computed(() =>
    this.maxDisplay() > 0 ? this.selectedLeaves().slice(0, this.maxDisplay()) : [],
  );
  protected readonly extra = computed(() => this.selectedLeaves().length - this.chips().length);

  protected readonly visibleLeaves = computed(() => this.visibleTree().flatMap(leafValues));
  protected readonly allSel = computed(() => {
    const l = this.visibleLeaves();
    return l.length > 0 && l.every((v) => this.selectedSet().has(v));
  });
  protected readonly someSel = computed(
    () => !this.allSel() && this.visibleLeaves().some((v) => this.selectedSet().has(v)),
  );

  // flatten the currently-visible (expanded) tree into DOM-order rows so the
  // arrow keys can walk exactly what the eye sees.
  protected readonly flatVisible = computed<FlatRow[]>(() => {
    const rows: FlatRow[] = [];
    const walk = (list: TreeNode[], depth: number, parentValue: string | null) => {
      for (const node of list) {
        const hasChildren = !!node.children?.length;
        const isOpen = this.isExpanded(node);
        rows.push({ node, depth, hasChildren, isOpen, parentValue });
        if (hasChildren && isOpen) walk(node.children!, depth + 1, node.value);
      }
    };
    walk(this.visibleTree(), 0, null);
    return rows;
  });
  protected itemId(value: string): string {
    return `${this.treeId}-ti-${value}`;
  }
  protected readonly activeDescId = computed(() => {
    const v = this.activeValue();
    return v && this.flatVisible().some((r) => r.node.value === v) ? this.itemId(v) : null;
  });

  protected readonly triggerClass = computed(() =>
    cn(FIELD_TRIGGER_BASE, FIELD_TRIGGER_SIZE[this.size()], "group", this.classInput()),
  );
  protected readonly panelClass = computed(() => FIELD_PANEL);

  protected boxClass(on: boolean): string {
    return cn(
      "grid size-4 shrink-0 place-items-center rounded-[4px] border",
      on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
    );
  }

  protected nodeChecked(n: TreeNode): boolean {
    const leaves = leafValues(n);
    return leaves.length > 0 && leaves.every((v) => this.selectedSet().has(v));
  }
  protected nodeIndeterminate(n: TreeNode): boolean {
    const leaves = leafValues(n);
    const sel = leaves.filter((v) => this.selectedSet().has(v)).length;
    return sel > 0 && sel < leaves.length;
  }
  protected isExpanded(n: TreeNode): boolean {
    const force = this.forceExpand();
    if (force) return force.has(n.value) || this.expanded().has(n.value);
    return this.expanded().has(n.value);
  }

  protected toggleExpand(value: string): void {
    const next = new Set(this.expanded());
    if (next.has(value)) next.delete(value);
    else next.add(value);
    this.expanded.set(next);
  }

  protected toggleNode(n: TreeNode): void {
    const leaves = leafValues(n);
    if (!leaves.length) return;
    const allSel = leaves.every((v) => this.selectedSet().has(v));
    if (allSel) {
      const rm = new Set(leaves);
      this.value.set(this.value().filter((v) => !rm.has(v)));
    } else {
      this.value.set(Array.from(new Set([...this.value(), ...leaves])));
    }
  }

  protected toggleAll(): void {
    const l = this.visibleLeaves();
    if (this.allSel()) {
      const rm = new Set(l);
      this.value.set(this.value().filter((v) => !rm.has(v)));
    } else {
      this.value.set(Array.from(new Set([...this.value(), ...l])));
    }
  }

  protected clearAll(): void {
    this.value.set([]);
  }

  protected toggleOpen(): void {
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
    this.activeValue.set(this.flatVisible()[0]?.node.value ?? null);
    this.overlayRef.outsidePointerEvents().subscribe((e) => {
      if (!trigger.contains(e.target as Node)) this.close();
    });
    // focus the search box (editable combobox) or the tree itself, so
    // aria-activedescendant is announced from the focused element and the
    // (non-searchable) tree is keyboard-reachable
    setTimeout(() => {
      const search = this.searchEl()?.nativeElement;
      if (search) search.focus();
      else this.treeEl()?.nativeElement.focus();
    });
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.query.set("");
    this.activeValue.set(null);
    this.triggerEl().nativeElement.focus();
  }

  protected onTriggerKeydown(e: KeyboardEvent): void {
    if (this.disabled()) return;
    if (!this.open() && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      this.openPanel();
    }
  }

  private moveActive(rows: FlatRow[], i: number): void {
    const r = rows[i];
    if (!r) return;
    this.activeValue.set(r.node.value);
    setTimeout(() => document.getElementById(this.itemId(r.node.value))?.scrollIntoView({ block: "nearest" }));
  }

  protected onTreeKeydown(e: KeyboardEvent): void {
    const rows = this.flatVisible();
    if (rows.length === 0) return;
    const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let idx = rows.findIndex((r) => r.node.value === this.activeValue());
    if (idx < 0) idx = 0;
    const cur = rows[idx];
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.moveActive(rows, Math.min(idx + 1, rows.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        this.moveActive(rows, Math.max(idx - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        this.moveActive(rows, 0);
        break;
      case "End":
        e.preventDefault();
        this.moveActive(rows, rows.length - 1);
        break;
      case forward:
        e.preventDefault();
        if (cur?.hasChildren) {
          if (!cur.isOpen) this.toggleExpand(cur.node.value);
          else this.moveActive(rows, idx + 1); // first child is the next visible row
        }
        break;
      case backward:
        e.preventDefault();
        if (cur?.hasChildren && cur.isOpen) {
          this.toggleExpand(cur.node.value);
        } else if (cur?.parentValue) {
          const p = rows.findIndex((r) => r.node.value === cur.parentValue);
          if (p >= 0) this.moveActive(rows, p);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (cur && !cur.node.disabled) this.toggleNode(cur.node);
        break;
      case "Escape":
        e.preventDefault();
        this.close();
        break;
      default:
        // type-ahead: jump to the next visible treeitem whose label starts with the key
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ch = e.key.toLowerCase();
          for (let k = 1; k <= rows.length; k++) {
            const j = (idx + k) % rows.length;
            if (rows[j].node.label.toLowerCase().startsWith(ch)) {
              this.moveActive(rows, j);
              break;
            }
          }
        }
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
