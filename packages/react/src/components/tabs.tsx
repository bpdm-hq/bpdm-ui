import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "./internal/use-isomorphic-layout-effect";

// --- composable primitives ---
export const TabsRoot = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "underline" | "pill";
    /** Underline track spans the full row ("full") or only the tabs ("content"). */
    baseline?: "full" | "content";
    /** Let the row scroll horizontally when the tabs overflow (many tabs). */
    scrollable?: boolean;
  }
>(({ className, variant = "underline", baseline = "full", scrollable = false, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-bpdm-slot="tabs-list"
    className={cn(
      "relative flex items-center gap-1",
      // vertical: stack the tabs; the underline track runs down the inline-end edge
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
      variant === "underline" &&
        "border-b border-border data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-e",
      // content → shrink the list so the baseline ends with the last tab
      variant === "underline" && baseline === "content" && "w-fit",
      // scroll the row when tabs overflow: keep tabs at natural width (no squeeze),
      // smooth scroll, and hide the scrollbar (arrow-key focus still scrolls into view)
      scrollable &&
        "overflow-x-auto scroll-smooth [scrollbar-width:none] [&>*]:shrink-0 [&::-webkit-scrollbar]:hidden",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const triggerVariants = cva(
  "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed! disabled:opacity-50 data-[orientation=vertical]:justify-start [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // each trigger draws its own active border, so the bare parts work standalone.
        // The convenience `Tabs` adds a sliding indicator for horizontal and suppresses
        // this static bottom border there (so the two don't double up); vertical always
        // uses its own inline-end border.
        underline:
          "-mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground data-[state=inactive]:enabled:hover:border-primary-strong/60 data-[state=inactive]:enabled:hover:text-primary-strong data-[state=active]:font-semibold data-[state=active]:text-primary-strong data-[state=active]:border-primary-strong data-[orientation=vertical]:mb-0 data-[orientation=vertical]:-me-px data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-e-2 data-[orientation=vertical]:data-[state=active]:border-primary-strong",
        pill: "relative z-10 rounded-lg px-3 py-1.5 text-muted-foreground data-[state=inactive]:enabled:hover:text-foreground data-[state=active]:text-foreground data-[orientation=vertical]:data-[state=inactive]:enabled:hover:bg-muted/60 data-[orientation=vertical]:data-[state=active]:bg-muted",
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof triggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-bpdm-slot="tabs-trigger"
    className={cn(triggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-bpdm-slot="tabs-content"
    className={cn(
      "pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      // vertical: the panel sits beside the list instead of below it
      "data-[orientation=vertical]:flex-1 data-[orientation=vertical]:pt-0 data-[orientation=vertical]:ps-4",
      "data-[state=active]:animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

// --- convenience (data-driven) ---
export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "underline" (line indicator) or "pill" (filled active). Default "underline". */
  variant?: "underline" | "pill";
  /** Underline track spans the full row ("full") or only the tabs ("content"). Default "full". */
  baseline?: "full" | "content";
  /** Tabs stretch to fill the row width equally. */
  fullWidth?: boolean;
  /** Scroll the tab row horizontally when the tabs overflow (many tabs). Horizontal orientation. */
  scrollable?: boolean;
  /** Layout + arrow-key axis. "horizontal" (default) stacks left→right; "vertical" stacks the tabs down the side. */
  orientation?: "horizontal" | "vertical";
  /** "automatic" (default) — arrow keys move focus AND select; "manual" — arrow moves focus, Enter/Space selects. */
  activationMode?: "automatic" | "manual";
  /** Accessible name for the tablist (screen readers announce it). The one translatable a11y string. */
  ariaLabel?: string;
  /** Arrow-key direction for horizontal tabs; auto-detected from the ambient direction when omitted. */
  dir?: "ltr" | "rtl";
  className?: string;
  listClassName?: string;
}

/**
 * Tabs built on Radix — accessible (roving focus, arrow keys), with two looks:
 * "underline" (a line indicator under the active tab) and "pill" (a filled active
 * tab). Data-driven via `items`, or compose `TabsRoot`/`TabsList`/`TabsTrigger`/
 * `TabsContent`. Controlled or uncontrolled; supports icons and disabled tabs.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "underline",
  baseline = "full",
  fullWidth = false,
  scrollable = false,
  orientation = "horizontal",
  activationMode = "automatic",
  ariaLabel,
  dir,
  className,
  listClassName,
}: TabsProps) {
  const hasContent = items.some((t) => t.content !== undefined);
  // auto-detect the ambient direction so horizontal arrow keys mirror under RTL
  // without the caller wiring up a direction provider (explicit `dir` wins)
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [autoDir, setAutoDir] = React.useState<"ltr" | "rtl" | undefined>(undefined);
  React.useEffect(() => {
    if (dir || !rootRef.current) return;
    setAutoDir(getComputedStyle(rootRef.current).direction === "rtl" ? "rtl" : "ltr");
  }, [dir]);

  // scroll buttons: a mouse-only affordance (no trackpad/wheel needed) that appears
  // at whichever edge has more tabs; keyboard users scroll via the arrow keys
  const listRef = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ prev: false, next: false });
  const rtl = (dir ?? autoDir) === "rtl";
  const updateEdges = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // abs handles the negative-scrollLeft RTL model
    setEdges({ prev: pos > 1, next: pos < max - 1 });
  }, []);
  React.useEffect(() => {
    if (!scrollable) return;
    updateEdges();
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollable, updateEdges, items.length]);
  const scrollByDir = (logical: -1 | 1) =>
    listRef.current?.scrollBy({
      left: (rtl ? -logical : logical) * listRef.current.clientWidth * 0.7,
      behavior: "smooth",
    });

  // sliding active indicator (horizontal): a single element that translates + resizes
  // under/behind the active tab, so switching tabs glides instead of jumping
  const slide = orientation === "horizontal";
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const measure = React.useCallback(() => {
    const el = listRef.current;
    const ind = indicatorRef.current;
    if (!el || !ind) return;
    const active = el.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      ind.style.opacity = "0";
      return;
    }
    const first = !ind.dataset.ready;
    if (first) ind.style.transition = "none"; // don't animate the initial placement
    ind.style.opacity = "1";
    ind.style.width = `${active.offsetWidth}px`;
    ind.style.transform = `translateX(${active.offsetLeft - el.scrollLeft}px)`;
    if (first) {
      void ind.offsetWidth; // flush, then hand control back to the CSS transition
      ind.style.transition = "";
      ind.dataset.ready = "1";
    }
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (!slide) return;
    measure();
    const el = listRef.current;
    if (!el) return;
    const mo = new MutationObserver(measure);
    mo.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-state"] });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [slide, measure, items.length, variant]);

  const indicator = slide ? (
    <span
      ref={indicatorRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 opacity-0 transition-[transform,width,opacity] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] motion-reduce:transition-none",
        variant === "underline"
          ? "-bottom-px h-0.5 bg-primary-strong" // sit on the baseline (like the tab's -mb-px border), flush not floating
          : "inset-y-0 z-0 rounded-lg bg-muted",
      )}
    />
  ) : null;

  // where the sliding indicator draws the marker (horizontal underline), hide each
  // trigger's own static bottom border so the two don't stack into a double line
  const suppressStatic =
    slide && variant === "underline"
      ? "[&_[role=tab][data-state=active]]:border-b-transparent!"
      : "";

  // minimal inline chevron (no chip/border) — dims at the edge it can't scroll toward
  const chevron =
    "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30";
  // symmetric edge fade so partial tabs dissolve at both ends (RTL-safe)
  const fade = "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)";

  const triggers = items.map((t) => (
    <TabsTrigger
      key={t.value}
      value={t.value}
      variant={variant}
      disabled={t.disabled}
      className={cn(fullWidth && "flex-1 justify-center")}
    >
      {t.icon}
      {t.label}
    </TabsTrigger>
  ));

  return (
    <TabsRoot
      ref={rootRef}
      data-bpdm="" data-bpdm-slot="tabs"
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      orientation={orientation}
      activationMode={activationMode}
      dir={dir ?? autoDir}
      className={cn("data-[orientation=vertical]:flex data-[orientation=vertical]:gap-3", className)}
    >
      {scrollable ? (
        // inline chevrons flank a fade-masked scroll row; the underline moves to the
        // wrapper so it stays solid edge-to-edge
        <div className={cn("flex items-center", variant === "underline" && "border-b border-border")}>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            disabled={!edges.prev}
            onClick={() => scrollByDir(-1)}
            className={chevron}
          >
            <ChevronLeft className="size-4 rtl:-scale-x-100" />
          </button>
          <TabsList
            ref={listRef}
            variant={variant}
            baseline={baseline}
            scrollable
            aria-label={ariaLabel}
            onScroll={() => {
              updateEdges();
              measure();
            }}
            style={{ maskImage: fade, WebkitMaskImage: fade }}
            className={cn("min-w-0 flex-1 border-b-0", suppressStatic, listClassName)}
          >
            {indicator}
            {triggers}
          </TabsList>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            disabled={!edges.next}
            onClick={() => scrollByDir(1)}
            className={chevron}
          >
            <ChevronRight className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
      ) : (
        <TabsList
          ref={listRef}
          variant={variant}
          baseline={baseline}
          aria-label={ariaLabel}
          className={cn(fullWidth && "w-full", suppressStatic, listClassName)}
        >
          {indicator}
          {triggers}
        </TabsList>
      )}
      {hasContent &&
        items.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {t.content}
          </TabsContent>
        ))}
    </TabsRoot>
  );
}
