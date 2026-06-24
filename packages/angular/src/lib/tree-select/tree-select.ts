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
      [attr.id]="id() || null"
      [attr.aria-expanded]="open()"
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
          <span>{{ selectedLeaves().length }} selected</span>
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
          <button type="button" aria-label="Clear all" tabindex="-1" (pointerdown)="$event.stopPropagation()" (click)="$event.stopPropagation(); clearAll()" class="grid size-4 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground">
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
              <input #search [value]="query()" (input)="query.set($any($event.target).value)" [attr.placeholder]="searchPlaceholder()" [attr.aria-label]="searchPlaceholder()" class="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            }
          </div>
        }
        @if (visibleTree().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          <div class="min-h-0 flex-1 overflow-auto p-1" [style.maxHeight.px]="maxHeight()">
            @for (n of visibleTree(); track n.value) {
              <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: n, depth: 0 }" />
            }
          </div>
        }
      </div>
    </ng-template>

    <ng-template #nodeTpl let-n let-depth="depth">
      <div class="flex items-center gap-1.5 rounded-[calc(var(--radius)-3px)] py-1.5 pr-2 transition-colors duration-[var(--bpdm-duration-fast)] hover:bg-muted" [style.paddingLeft.px]="8 + depth * 18">
        @if (n.children?.length) {
          <button type="button" [attr.aria-label]="isExpanded(n) ? 'Collapse' : 'Expand'" (click)="toggleExpand(n.value)" class="grid size-4 shrink-0 cursor-pointer place-items-center text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5 transition-transform" [class.rotate-90]="isExpanded(n)"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        } @else {
          <span class="size-4 shrink-0"></span>
        }
        <button type="button" role="checkbox" [attr.aria-checked]="nodeIndeterminate(n) ? 'mixed' : nodeChecked(n)" [disabled]="n.disabled || null" (click)="toggleNode(n)" class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left text-sm text-foreground disabled:pointer-events-none disabled:opacity-50">
          <span [class]="boxClass(nodeChecked(n) || nodeIndeterminate(n))">
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
        @for (c of n.children; track c.value) {
          <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{ $implicit: c, depth: depth + 1 }" />
        }
      }
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

  protected readonly open = signal(false);
  protected readonly query = signal("");
  private readonly expanded = signal<Set<string>>(new Set());
  protected readonly panelWidth = signal(0);

  private readonly triggerEl = viewChild.required<ElementRef<HTMLElement>>("trigger");
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>("panel");
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>("search");
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
    this.overlayRef.outsidePointerEvents().subscribe((e) => {
      if (!trigger.contains(e.target as Node)) this.close();
    });
    setTimeout(() => this.searchEl()?.nativeElement.focus());
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.query.set("");
    this.triggerEl().nativeElement.focus();
  }

  protected onTriggerKeydown(e: KeyboardEvent): void {
    if (this.disabled()) return;
    if (!this.open() && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      this.openPanel();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
