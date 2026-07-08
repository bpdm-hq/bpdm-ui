import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { FieldChevron, FieldCheck, FieldSearch } from "./internal/field-icons";

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
  /** Accessible name for the trigger + option list (when there's no visible `<label>`). */
  "aria-label"?: string;
  "aria-describedby"?: string;
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
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: SelectProps) {
  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const selected = isControlled ? value : internal;
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  // callback-ref + state so the virtualizer re-measures once the scroll element
  // mounts (a plain ref doesn't re-render → empty list on the first open).
  const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null);

  // Portal into the nearest dialog (if any) instead of <body>. Inside a modal
  // dialog, scroll-lock makes a body-portaled popover inert (no clicks/scroll);
  // rendering within the dialog keeps the dropdown interactive. Outside a dialog
  // this is null → defaults to <body>.
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalContainer(triggerRef.current?.closest<HTMLElement>("[role='dialog']") ?? null);
  }, []);

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

  // Reset the active option ONLY when the menu opens or the filter changes — not
  // on every `rows` identity change. Inline `options` props re-create the array
  // each render, so keying off `rows` would snap the highlight + scroll back to
  // the top on every interaction.
  React.useEffect(() => {
    setActive(firstItem === -1 ? 0 : firstItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);
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

  // the id of the highlighted option, exposed via aria-activedescendant so screen
  // readers announce the active row as you arrow through the list
  const activeId = rows[active]?.kind === "item" ? optionId(active) : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(triggerVariants({ size }), "group", className)}
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <FieldChevron />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onKeyDown={onKeyDown}
          onOpenAutoFocus={(e) => {
            // focus the search box (editable combobox) or the listbox itself, so
            // aria-activedescendant is announced from the focused element
            e.preventDefault();
            (searchable ? searchRef.current : listRef.current)?.focus();
          }}
          // cap to the space available in the viewport/modal and flip if needed,
          // so it never overflows or squishes a small modal (it's portaled to
          // <body>, so opening never resizes the modal either)
          style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
          className={cn(
            "z-50 flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-md",
            "origin-[var(--radix-popover-content-transform-origin)] data-[state=open]:animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in]",
            contentClassName,
          )}
        >
          {searchable && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
              <FieldSearch />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                role="combobox"
                aria-expanded
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
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
              ref={(el) => {
                listRef.current = el;
                setListEl(el);
              }}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel ?? placeholder}
              tabIndex={-1}
              aria-activedescendant={searchable ? undefined : activeId}
              style={{ maxHeight }}
              className="min-h-0 flex-1 overflow-auto p-1 focus:outline-none"
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
                        aria-hidden="true"
                        className="absolute start-0 top-0 flex w-full items-center gap-2 px-2 text-sm font-semibold text-foreground [&_img]:size-4 [&_svg]:size-4"
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
                      id={optionId(vi.index)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={o.disabled}
                      onClick={() => !o.disabled && commit(o.value)}
                      onMouseMove={() => setActive(vi.index)}
                      className={cn(
                        "absolute start-0 top-0 flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-3px)] px-2 text-start text-sm text-foreground transition-colors duration-[var(--bpdm-duration-fast)] disabled:pointer-events-none disabled:opacity-50",
                        isActive && "bg-muted",
                      )}
                      {...common}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center text-primary">
                        {isSelected && (
                          <span className="animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]">
                            <FieldCheck />
                          </span>
                        )}
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
