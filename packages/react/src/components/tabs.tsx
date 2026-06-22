import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// --- composable primitives ---
export const TabsRoot = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "underline" | "pill";
    /** Underline track spans the full row ("full") or only the tabs ("content"). */
    baseline?: "full" | "content";
  }
>(({ className, variant = "underline", baseline = "full", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center gap-1",
      variant === "underline" && "border-b border-border",
      // content → shrink the list so the baseline ends with the last tab
      variant === "underline" && baseline === "content" && "w-fit",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const triggerVariants = cva(
  "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        underline:
          "-mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary",
        pill: "rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground",
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
    className={cn(
      "pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "data-[state=active]:animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
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
  className,
  listClassName,
}: TabsProps) {
  const hasContent = items.some((t) => t.content !== undefined);
  return (
    <TabsRoot
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList
        variant={variant}
        baseline={baseline}
        className={cn(fullWidth && "w-full", listClassName)}
      >
        {items.map((t) => (
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
        ))}
      </TabsList>
      {hasContent &&
        items.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {t.content}
          </TabsContent>
        ))}
    </TabsRoot>
  );
}
