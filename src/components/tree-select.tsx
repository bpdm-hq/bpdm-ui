import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { FieldChevron, FieldCheck, FieldClearX, FieldDash, FieldSearch } from "./internal/field-icons";

export type TreeNode = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: TreeNode[];
};

const triggerVariants = cva(
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-input bg-background text-foreground shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
  {
    variants: {
      size: {
        sm: "min-h-8 px-2 py-1 text-sm",
        md: "min-h-10 px-2.5 py-1.5 text-sm",
        lg: "min-h-12 px-3 py-2 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

function Caret({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cn("size-3.5 transition-transform", open && "rotate-90")} aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function leafValues(node: TreeNode): string[] {
  if (!node.children?.length) return node.disabled ? [] : [node.value];
  return node.children.flatMap(leafValues);
}

// keep nodes matching the query (full subtree) + ancestors of matches; collect
// the ancestor values to force-expand so matches are visible.
function filterTree(
  nodes: TreeNode[],
  q: string,
): { nodes: TreeNode[]; expand: Set<string> } {
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

export interface TreeSelectProps extends VariantProps<typeof triggerVariants> {
  options: TreeNode[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Show a "Select all" row in the header. Default true. */
  selectAll?: boolean;
  maxDisplay?: number;
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean;
  id?: string;
}

/**
 * Hierarchical multi-select. Expand/collapse branches; checking a parent selects
 * all its (enabled) leaves, and a parent shows indeterminate when only some leaves
 * are selected. Selection is leaf-based — `value` is the array of selected leaf
 * values. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 */
export function TreeSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchable = false,
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  selectAll = true,
  maxDisplay = 3,
  maxHeight = 280,
  size,
  disabled,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
  id,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const selected = isControlled ? (value ?? []) : internal;
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  // portal into the nearest dialog (if any) so the dropdown stays interactive
  // inside a modal; outside a dialog this is null → defaults to <body>
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalContainer(triggerRef.current?.closest<HTMLElement>("[role='dialog']") ?? null);
  }, []);
  const { nodes: visibleTree, forceExpand } = React.useMemo(() => {
    if (!q) return { nodes: options, forceExpand: null as Set<string> | null };
    const r = filterTree(options, q);
    return { nodes: r.nodes, forceExpand: r.expand };
  }, [options, q]);

  // label lookup for leaves (for chips)
  const leafLabel = React.useMemo(() => {
    const m = new Map<string, { label: string; icon?: React.ReactNode }>();
    const walk = (n: TreeNode) => {
      if (!n.children?.length) m.set(n.value, { label: n.label, icon: n.icon });
      else n.children.forEach(walk);
    };
    options.forEach(walk);
    return m;
  }, [options]);

  const setSelected = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const toggleNode = (node: TreeNode) => {
    const leaves = leafValues(node);
    if (leaves.length === 0) return;
    const allSel = leaves.every((v) => selectedSet.has(v));
    if (allSel) {
      const remove = new Set(leaves);
      setSelected(selected.filter((v) => !remove.has(v)));
    } else {
      setSelected(Array.from(new Set([...selected, ...leaves])));
    }
  };

  const toggleExpand = (val: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });

  // "Select all" operates on all leaves currently visible (after filtering)
  const allVisibleLeaves = React.useMemo(
    () => visibleTree.flatMap(leafValues),
    [visibleTree],
  );
  const allSel =
    allVisibleLeaves.length > 0 && allVisibleLeaves.every((v) => selectedSet.has(v));
  const someSel = !allSel && allVisibleLeaves.some((v) => selectedSet.has(v));
  const toggleAll = () => {
    if (allSel) {
      const rm = new Set(allVisibleLeaves);
      setSelected(selected.filter((v) => !rm.has(v)));
    } else {
      setSelected(Array.from(new Set([...selected, ...allVisibleLeaves])));
    }
  };

  const selectedLeaves = selected
    .map((v) => leafLabel.get(v))
    .filter(Boolean) as { label: string; icon?: React.ReactNode }[];
  const chips = maxDisplay > 0 ? selectedLeaves.slice(0, maxDisplay) : [];
  const extra = selectedLeaves.length - chips.length;

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const hasChildren = !!node.children?.length;
    const leaves = leafValues(node);
    const selCount = leaves.filter((v) => selectedSet.has(v)).length;
    const checked = leaves.length > 0 && selCount === leaves.length;
    const indeterminate = selCount > 0 && !checked;
    const isOpen = forceExpand
      ? forceExpand.has(node.value) || expanded.has(node.value)
      : expanded.has(node.value);

    return (
      <React.Fragment key={node.value}>
        <div
          className="flex items-center gap-1.5 rounded-[calc(var(--radius)-3px)] py-1.5 pr-2 transition-colors duration-[var(--bpdm-duration-fast)] hover:bg-muted"
          style={{ paddingLeft: 8 + depth * 18 }}
        >
          {hasChildren ? (
            <button
              type="button"
              aria-label={isOpen ? "Collapse" : "Expand"}
              onClick={() => toggleExpand(node.value)}
              className="grid size-4 shrink-0 cursor-pointer place-items-center text-muted-foreground hover:text-foreground"
            >
              <Caret open={isOpen} />
            </button>
          ) : (
            <span className="size-4 shrink-0" />
          )}

          <button
            type="button"
            role="checkbox"
            aria-checked={indeterminate ? "mixed" : checked}
            disabled={node.disabled}
            onClick={() => toggleNode(node)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left text-sm text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <span
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                checked || indeterminate
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/50",
              )}
            >
              {checked ? <FieldCheck /> : indeterminate ? <FieldDash /> : null}
            </span>
            {node.icon}
            <span className="truncate">{node.label}</span>
          </button>
        </div>
        {hasChildren && isOpen && node.children!.map((c) => renderNode(c, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          ref={triggerRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          aria-disabled={disabled}
          data-disabled={disabled ? "" : undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
          className={cn(triggerVariants({ size }), "group", className)}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {selectedLeaves.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : maxDisplay === 0 ? (
              <span>{selectedLeaves.length} selected</span>
            ) : (
              <>
                {chips.map((o, i) => (
                  <span
                    key={i}
                    className="inline-flex max-w-[140px] shrink-0 items-center gap-1 rounded-[calc(var(--radius)-4px)] bg-muted px-1.5 py-0.5 text-xs"
                  >
                    <span className="truncate">{o.label}</span>
                  </span>
                ))}
                {extra > 0 && <span className="shrink-0 text-xs text-muted-foreground">+{extra}</span>}
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {selectedLeaves.length > 0 && !disabled && (
              <button
                type="button"
                aria-label="Clear all"
                tabIndex={-1}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected([]);
                }}
                className="grid size-4 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <FieldClearX />
              </button>
            )}
            <FieldChevron />
          </div>
        </div>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
          className={cn(
            "z-50 flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-md",
            "origin-[var(--radix-popover-content-transform-origin)] data-[state=open]:animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in]",
            contentClassName,
          )}
        >
          {(searchable || (selectAll && allVisibleLeaves.length > 0)) && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
              {selectAll && allVisibleLeaves.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  aria-label="Select all"
                  title="Select all"
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 py-2 text-sm font-medium text-foreground",
                    !searchable && "w-full",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                      allSel || someSel
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/50",
                    )}
                  >
                    {allSel ? <FieldCheck /> : someSel ? <FieldDash /> : null}
                  </span>
                  {!searchable && "Select all"}
                </button>
              )}
              {selectAll && allVisibleLeaves.length > 0 && searchable && (
                <span className="w-px shrink-0 self-stretch bg-border" aria-hidden />
              )}
              {searchable && (
                <>
                  <FieldSearch />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </>
              )}
            </div>
          )}
          {visibleTree.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            <div style={{ maxHeight }} className="min-h-0 flex-1 overflow-auto p-1">
              {visibleTree.map((n) => renderNode(n, 0))}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
