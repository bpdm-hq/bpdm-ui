import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};
export type SelectOptionGroup = {
  label: string;
  icon?: React.ReactNode;
  options: SelectOption[];
};
export type SelectItems = Array<SelectOption | SelectOptionGroup>;

const isGroup = (x: SelectOption | SelectOptionGroup): x is SelectOptionGroup =>
  Array.isArray((x as SelectOptionGroup).options);

const triggerVariants = cva(
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-input bg-background text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type Row =
  | { kind: "group"; label: string; icon?: React.ReactNode }
  | { kind: "item"; option: SelectOption };

const ITEM_H = 36;
const GROUP_H = 30;

function ChevronDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 opacity-60" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export interface SelectProps extends VariantProps<typeof triggerVariants> {
  options: SelectItems;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Show a filter box at the top of the dropdown. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Max height (px) of the scrollable option list. */
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean;
  id?: string;
}

/**
 * Single-select dropdown. Data-driven (`options`, flat or grouped), always
 * **virtualized** (10k+ rows stay smooth), with an optional **searchable** filter.
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchable = false,
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  maxHeight = 256,
  size,
  disabled,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
  id,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const selected = isControlled ? value : internal;
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  // callback-ref + state so the virtualizer re-measures once the scroll element
  // mounts (a plain ref doesn't re-render → empty list on the first open).
  const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null);

  // flatten options → rows (group headers + items)
  const allRows = React.useMemo<Row[]>(() => {
    const rows: Row[] = [];
    for (const entry of options) {
      if (isGroup(entry)) {
        rows.push({ kind: "group", label: entry.label, icon: entry.icon });
        for (const o of entry.options) rows.push({ kind: "item", option: o });
      } else {
        rows.push({ kind: "item", option: entry });
      }
    }
    return rows;
  }, [options]);

  // filter (keeps a group header only if it has a matching item)
  const rows = React.useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    const out: Row[] = [];
    let pending: Row | null = null;
    let used = false;
    for (const r of allRows) {
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
  }, [allRows, query]);

  const firstItem = React.useMemo(
    () => rows.findIndex((r) => r.kind === "item"),
    [rows],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listEl,
    estimateSize: (i) => (rows[i]?.kind === "group" ? GROUP_H : ITEM_H),
    overscan: 12,
  });

  React.useEffect(() => setActive(firstItem === -1 ? 0 : firstItem), [rows, firstItem]);
  React.useEffect(() => {
    if (open && rows.length) virtualizer.scrollToIndex(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const selectedLabel = React.useMemo(() => {
    for (const r of allRows)
      if (r.kind === "item" && r.option.value === selected) return r.option.label;
    return undefined;
  }, [allRows, selected]);

  const commit = (val: string) => {
    if (!isControlled) setInternal(val);
    onValueChange?.(val);
    setOpen(false);
    setQuery("");
  };

  const move = (dir: 1 | -1) =>
    setActive((cur) => {
      let i = cur;
      do {
        i += dir;
      } while (i >= 0 && i < rows.length && rows[i].kind === "group");
      return i < 0 || i >= rows.length ? cur : i;
    });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = rows[active];
      if (r?.kind === "item" && !r.option.disabled) commit(r.option.value);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(triggerVariants({ size }), className)}
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronDown />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onKeyDown={onKeyDown}
          // cap to the space available in the viewport/modal and flip if needed,
          // so it never overflows or squishes a small modal (it's portaled to
          // <body>, so opening never resizes the modal either)
          style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
          className={cn(
            "z-50 flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-md",
            contentClassName,
          )}
        >
          {searchable && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
              <SearchIcon />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          )}

          {rows.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <div
              ref={setListEl}
              role="listbox"
              style={{ maxHeight }}
              className="min-h-0 flex-1 overflow-auto p-1"
            >
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((vi) => {
                  const r = rows[vi.index];
                  const common = {
                    style: {
                      height: vi.size,
                      transform: `translateY(${vi.start}px)`,
                    } as React.CSSProperties,
                  };
                  if (r.kind === "group") {
                    return (
                      <div
                        key={`g-${vi.index}`}
                        className="absolute left-0 top-0 flex w-full items-center gap-2 px-2 text-sm font-semibold text-foreground [&_img]:size-4 [&_svg]:size-4"
                        {...common}
                      >
                        {r.icon}
                        {r.label}
                      </div>
                    );
                  }
                  const o = r.option;
                  const isSelected = o.value === selected;
                  const isActive = vi.index === active;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={o.disabled}
                      onClick={() => !o.disabled && commit(o.value)}
                      onMouseMove={() => setActive(vi.index)}
                      className={cn(
                        "absolute left-0 top-0 flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-3px)] px-2 text-left text-sm text-foreground disabled:pointer-events-none disabled:opacity-50",
                        isActive && "bg-muted",
                      )}
                      {...common}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center text-primary">
                        {isSelected && <Check />}
                      </span>
                      {o.icon}
                      <span className="truncate">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
