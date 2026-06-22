import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { FieldChevron, FieldCheck, FieldClearX, FieldDash, FieldSearch } from "./internal/field-icons";
import { fieldTriggerVariants as triggerVariants } from "./internal/field-trigger";
import type { SelectItems, SelectOption, SelectOptionGroup } from "./select";

const isGroup = (x: SelectOption | SelectOptionGroup): x is SelectOptionGroup =>
  Array.isArray((x as SelectOptionGroup).options);

type Row =
  | { kind: "group"; label: string; icon?: React.ReactNode }
  | { kind: "item"; option: SelectOption };

const ITEM_H = 36;
const GROUP_H = 30;


export interface MultiSelectProps extends VariantProps<typeof triggerVariants> {
  options: SelectItems;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Max selected chips shown before "+N". 0 → show "N selected" count. Default 3. */
  maxDisplay?: number;
  /** Show a "Select all" row at the top of the dropdown. Default true. */
  selectAll?: boolean;
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean;
  id?: string;
}

/**
 * Searchable, virtualized multi-select (Select's bigger sibling). Same options
 * (flat or grouped), always virtualized for large lists. The trigger shows up to
 * `maxDisplay` chips then "+N", or a count when `maxDisplay={0}`.
 */
export function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchable = false,
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  maxDisplay = 3,
  selectAll = true,
  maxHeight = 256,
  size,
  disabled,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const selected = React.useMemo(
    () => (isControlled ? (value ?? []) : internal),
    [isControlled, value, internal],
  );
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null);

  // portal into the nearest dialog (if any) so the dropdown stays interactive
  // inside a modal; outside a dialog this is null → defaults to <body>
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalContainer(triggerRef.current?.closest<HTMLElement>("[role='dialog']") ?? null);
  }, []);

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

  // flat list of all options for resolving selected labels
  const optionByValue = React.useMemo(() => {
    const m = new Map<string, SelectOption>();
    for (const r of allRows) if (r.kind === "item") m.set(r.option.value, r.option);
    return m;
  }, [allRows]);
  const selectedOptions = selected
    .map((v) => optionByValue.get(v))
    .filter(Boolean) as SelectOption[];

  const firstItem = React.useMemo(() => rows.findIndex((r) => r.kind === "item"), [rows]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listEl,
    estimateSize: (i) => (rows[i]?.kind === "group" ? GROUP_H : ITEM_H),
    overscan: 12,
  });

  // Reset the active option ONLY when the menu opens or the filter changes — not
  // on every `rows` identity change. Inline `options` props re-create the array
  // each render, so keying off `rows` would snap the highlight + scroll back to
  // the top on every selection (the click appears to "jump" to the first item).
  React.useEffect(() => {
    setActive(firstItem === -1 ? 0 : firstItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);
  React.useEffect(() => {
    if (open && rows.length) virtualizer.scrollToIndex(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const setSelected = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };
  const toggle = (val: string) =>
    setSelected(selectedSet.has(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  const clearAll = () => setSelected([]);

  // "Select all" operates on the currently visible (filtered) items
  const filteredItemValues = React.useMemo(() => {
    const vals: string[] = [];
    for (const r of rows) if (r.kind === "item" && !r.option.disabled) vals.push(r.option.value);
    return vals;
  }, [rows]);
  const allSel =
    filteredItemValues.length > 0 && filteredItemValues.every((v) => selectedSet.has(v));
  const someSel = !allSel && filteredItemValues.some((v) => selectedSet.has(v));
  const toggleAll = () =>
    allSel
      ? setSelected(selected.filter((v) => !filteredItemValues.includes(v)))
      : setSelected(Array.from(new Set([...selected, ...filteredItemValues])));

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
      if (r?.kind === "item" && !r.option.disabled) toggle(r.option.value);
    }
  };

  const chips = maxDisplay > 0 ? selectedOptions.slice(0, maxDisplay) : [];
  const extra = selectedOptions.length - chips.length;

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
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : maxDisplay === 0 ? (
              <span>{selected.length} selected</span>
            ) : (
              <>
                {chips.map((o) => (
                  <span
                    key={o.value}
                    className="inline-flex max-w-[140px] shrink-0 items-center gap-1 rounded-[calc(var(--radius)-4px)] bg-muted px-1.5 py-0.5 text-xs"
                  >
                    <span className="truncate">{o.label}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${o.label}`}
                      tabIndex={-1}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.value);
                      }}
                      className="grid cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <FieldClearX />
                    </button>
                  </span>
                ))}
                {extra > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">+{extra}</span>
                )}
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {selected.length > 0 && !disabled && (
              <button
                type="button"
                aria-label="Clear all"
                tabIndex={-1}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
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
          onKeyDown={onKeyDown}
          style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
          className={cn(
            "z-50 flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-md",
            "origin-[var(--radix-popover-content-transform-origin)] data-[state=open]:animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in]",
            contentClassName,
          )}
        >
          {(searchable || (selectAll && filteredItemValues.length > 0)) && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
              {selectAll && filteredItemValues.length > 0 && (
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
              {selectAll && filteredItemValues.length > 0 && searchable && (
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

          {rows.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            <div ref={setListEl} role="listbox" aria-multiselectable style={{ maxHeight }} className="min-h-0 flex-1 overflow-auto p-1">
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((vi) => {
                  const r = rows[vi.index];
                  const common = {
                    style: { height: vi.size, transform: `translateY(${vi.start}px)` } as React.CSSProperties,
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
                  const isSelected = selectedSet.has(o.value);
                  const isActive = vi.index === active;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={o.disabled}
                      onClick={() => !o.disabled && toggle(o.value)}
                      onMouseMove={() => setActive(vi.index)}
                      className={cn(
                        "absolute left-0 top-0 flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-3px)] px-2 text-left text-sm text-foreground transition-colors duration-[var(--bpdm-duration-fast)] disabled:pointer-events-none disabled:opacity-50",
                        isActive && "bg-muted",
                      )}
                      {...common}
                    >
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors duration-[var(--bpdm-duration-fast)]",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/50",
                        )}
                      >
                        {isSelected && <FieldCheck className="animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]" />}
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
