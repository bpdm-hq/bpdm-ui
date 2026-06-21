import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionVariant = "default" | "separated" | "borderless";

const VariantContext = React.createContext<AccordionVariant>("default");

// --- composable primitives ---
export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        variant === "separated"
          ? "rounded-[var(--radius)] border border-border bg-card transition-shadow data-[state=open]:shadow-sm"
          : variant === "borderless"
            ? "border-b border-border"
            : "border-b border-border last:border-b-0",
        className,
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    icon?: React.ReactNode;
  }
>(({ className, children, icon, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex flex-1 cursor-pointer items-center gap-3 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:font-semibold [&_svg]:size-4",
          // open header stands out; closed is calmer — the "active" emphasis
          variant === "borderless"
            ? "px-0 py-4 font-medium text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
            : "px-4 py-3.5 font-medium text-foreground hover:bg-muted/50",
          className,
        )}
        {...props}
      >
        {icon}
        <span className="flex-1">{children}</span>
        <ChevronDown className="shrink-0 text-muted-foreground transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden data-[state=open]:animate-[bpdm-accordion-down_var(--bpdm-duration-base)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-accordion-up_var(--bpdm-duration-base)_var(--bpdm-ease-out)]"
      {...props}
    >
      <div
        className={cn(
          "pt-0 text-sm leading-relaxed text-muted-foreground",
          variant === "borderless" ? "px-0 pb-5" : "px-4 pb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";

// --- convenience (data-driven) ---
export interface AccordionItemData {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type AccordionProps = {
  items: AccordionItemData[];
  /** "default" (bordered list) or "separated" (each item a card). */
  variant?: AccordionVariant;
  className?: string;
} & (
  | {
      type?: "single";
      /** Allow closing the open item (single mode). Default true. */
      collapsible?: boolean;
      defaultValue?: string;
      value?: string;
      onValueChange?: (value: string) => void;
    }
  | {
      type: "multiple";
      defaultValue?: string[];
      value?: string[];
      onValueChange?: (value: string[]) => void;
    }
);

/**
 * Accordion built on Radix — accessible (keyboard, ARIA), with a smoothly
 * animated height, a rotating chevron, and two looks (`default` bordered list or
 * `separated` cards). Single or multiple open. Data-driven via `items`, or compose
 * `AccordionItem` / `AccordionTrigger` / `AccordionContent`.
 */
export function Accordion(props: AccordionProps) {
  const { items, variant = "default", className } = props;
  const single = (props.type ?? "single") === "single";

  // forward only the value/controlled props (never spread the bare discriminant)
  const valueProps: Record<string, unknown> = {};
  if ("value" in props && props.value !== undefined) valueProps.value = props.value;
  if ("defaultValue" in props && props.defaultValue !== undefined)
    valueProps.defaultValue = props.defaultValue;
  if ("onValueChange" in props && props.onValueChange)
    valueProps.onValueChange = props.onValueChange;

  const rootProps = single
    ? {
        type: "single",
        collapsible: (props as { collapsible?: boolean }).collapsible ?? true,
        ...valueProps,
      }
    : { type: "multiple", ...valueProps };

  return (
    <VariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        {...(rootProps as React.ComponentProps<typeof AccordionPrimitive.Root>)}
        className={cn(
          variant === "separated"
            ? "flex flex-col gap-2"
            : variant === "borderless"
              ? ""
              : "overflow-hidden rounded-[var(--radius)] border border-border",
          className,
        )}
      >
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
            <AccordionTrigger icon={item.icon}>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </AccordionPrimitive.Root>
    </VariantContext.Provider>
  );
}

export const AccordionRoot = AccordionPrimitive.Root;
