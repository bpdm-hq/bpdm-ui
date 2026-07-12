import * as React from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/use-controllable";

export type StepperOrientation = "horizontal" | "vertical";

/** Screen-reader labels + status words — override for i18n. */
export interface StepperMessages {
  /** Step list accessible name. */
  ariaLabel: string;
  /** Status word for a completed step. */
  completed: string;
  /** Status word for the active step. */
  current: string;
  /** Status word for a not-yet-reached step. */
  upcoming: string;
  /** Status word for a locked (linear, unreachable) step. */
  locked: string;
  /** Position template — `{index}`/`{total}` placeholders, e.g. "Step {index} of {total}". */
  step: string;
}

export const DEFAULT_STEPPER_MESSAGES: StepperMessages = {
  ariaLabel: "Progress",
  completed: "Completed",
  current: "Current step",
  upcoming: "Not completed",
  locked: "Locked",
  step: "Step {index} of {total}",
};

// stable id bases so a step tab and its panel can reference each other
const stepTabId = (uid: string, value: string) => `${uid}-tab-${value}`;
const stepPanelId = (uid: string, value: string) => `${uid}-panel-${value}`;

// ── state core ───────────────────────────────────────────────────────────────
interface StepperContextValue {
  value: string;
  orientation: StepperOrientation;
  linear: boolean;
  lockIndicator: boolean;
  /** Merged i18n labels. */
  messages: StepperMessages;
  /** Per-Stepper id base for tab ↔ panel wiring. */
  uid: string;
  steps: string[];
  activeIndex: number;
  indexOf: (value: string) => number;
  isActive: (value: string) => boolean;
  isCompleted: (value: string) => boolean;
  /** Whether the step can be navigated to (linear gating + not past the frontier). */
  canActivate: (value: string) => boolean;
  activate: (value: string) => void;
  next: () => void;
  back: () => void;
  /** Mark the whole flow done — every step (including the last) shows completed. */
  complete: () => void;
  /** True once `complete()` has been called, until the user navigates again. */
  finished: boolean;
  isFirst: boolean;
  isLast: boolean;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);
// value carried down from a vertical StepItem so its <Step>/<StepPanel> children
// don't need to repeat it
const StepValueContext = React.createContext<string | null>(null);

function useStepperContext(component: string): StepperContextValue {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Stepper>`);
  return ctx;
}

/** Read the current step's value from an explicit prop or the enclosing StepItem. */
function useResolvedValue(value: string | number | undefined): string {
  const fromItem = React.useContext(StepValueContext);
  if (value != null) return String(value);
  if (fromItem != null) return fromItem;
  throw new Error("Step/StepPanel needs a `value` (or must be inside a <StepItem value=…>)");
}

/**
 * Access the stepper's state + navigation from anywhere inside it — for custom
 * Next/Back buttons, progress text, etc.
 */
export function useStepper() {
  const ctx = useStepperContext("useStepper");
  const { value, activeIndex, steps, isFirst, isLast, next, back, activate, complete, finished } = ctx;
  return { value, activeIndex, steps, count: steps.length, isFirst, isLast, next, back, activate, complete, finished };
}

// recursively collect step values in declaration order (deterministic — no
// mount-order registration, so no first-paint races)
function collectStepValues(children: React.ReactNode, acc: string[] = []): string[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const role = (child.type as { __stepperRole?: string })?.__stepperRole;
    const props = child.props as { value?: string | number; children?: React.ReactNode };
    if (role === "step" && props.value != null) {
      const v = String(props.value);
      if (!acc.includes(v)) acc.push(v);
    } else if (props.children) {
      collectStepValues(props.children, acc);
    }
  });
  return acc;
}

export interface StepperProps {
  children: React.ReactNode;
  /** Controlled active step value. */
  value?: string | number;
  /** Uncontrolled initial value. Defaults to the first step. */
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  orientation?: StepperOrientation;
  /** Require the current step before advancing — future steps aren't clickable. */
  linear?: boolean;
  /** Show a lock icon on steps that aren't reachable yet (with `linear`). */
  lockIndicator?: boolean;
  /** Screen-reader labels + status words — override for i18n. */
  messages?: Partial<StepperMessages>;
  className?: string;
}

export function Stepper({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  linear = false,
  lockIndicator = false,
  messages,
  className,
}: StepperProps) {
  const uid = React.useId();
  const t = React.useMemo<StepperMessages>(
    () => ({ ...DEFAULT_STEPPER_MESSAGES, ...messages }),
    [messages],
  );
  const steps = React.useMemo(() => collectStepValues(children), [children]);
  const first = steps[0] ?? "";
  const [value, setValue] = useControllable(
    valueProp != null ? String(valueProp) : undefined,
    defaultValue != null ? String(defaultValue) : first,
    onValueChange,
  );
  // set once the flow is completed; any navigation clears it
  const [finished, setFinished] = React.useState(false);

  const ctx = React.useMemo<StepperContextValue>(() => {
    const idx = (v: string) => steps.indexOf(v);
    const ai = steps.indexOf(value);
    const canActivate = (v: string) => {
      const i = idx(v);
      if (i === -1) return false;
      return !linear || i <= ai;
    };
    const goto = (v: string) => {
      setFinished(false);
      setValue(v);
    };
    return {
      value,
      orientation,
      linear,
      lockIndicator,
      messages: t,
      uid,
      steps,
      activeIndex: ai,
      indexOf: idx,
      isActive: (v) => v === value,
      isCompleted: (v) => {
        if (finished) return idx(v) > -1;
        const i = idx(v);
        return i > -1 && ai > -1 && i < ai;
      },
      canActivate,
      activate: (v) => {
        if (canActivate(v)) goto(v);
      },
      next: () => {
        if (ai > -1 && ai < steps.length - 1) goto(steps[ai + 1]);
      },
      back: () => {
        if (ai > 0) goto(steps[ai - 1]);
      },
      complete: () => setFinished(true),
      finished,
      isFirst: ai <= 0,
      isLast: ai === steps.length - 1,
    };
  }, [value, orientation, linear, lockIndicator, t, uid, steps, setValue, finished]);

  return (
    <StepperContext.Provider value={ctx}>
      <div
        data-orientation={orientation}
        className={cn(orientation === "vertical" ? "flex flex-col" : "flex flex-col gap-2", className)}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// ── marker ───────────────────────────────────────────────────────────────────
function Marker({
  state,
  index,
  icon,
  locked,
}: {
  state: "completed" | "active" | "upcoming";
  index: number;
  icon?: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] [&_svg]:size-4",
        state === "completed" && "border-primary bg-primary text-primary-foreground",
        state === "active" && "scale-105 border-primary text-primary",
        state === "upcoming" && "border-border text-muted-foreground",
      )}
    >
      {state === "completed" && !icon ? (
        <Check className="animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]" />
      ) : locked ? (
        <Lock className="!size-3.5" aria-hidden />
      ) : (
        (icon ?? index + 1)
      )}
    </span>
  );
}

// ── horizontal header list ─────────────────────────────────────────────────────
export const StepList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useStepperContext("StepList");
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ctx.messages.ariaLabel}
      aria-orientation={ctx.orientation}
      className={cn("flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
});
StepList.displayName = "StepList";

export interface StepProps {
  value?: string | number;
  children?: React.ReactNode;
  /** Custom marker (overrides the number; completed still shows a check unless set). */
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function StepImpl({ value: valueProp, children, icon, disabled = false, className }: StepProps) {
  const ctx = useStepperContext("Step");
  const value = useResolvedValue(valueProp);
  const index = ctx.indexOf(value);
  const active = ctx.isActive(value);
  const completed = ctx.isCompleted(value);
  const state = completed ? "completed" : active ? "active" : "upcoming";
  const clickable = !disabled && ctx.canActivate(value);
  const locked = ctx.lockIndicator && !active && !completed && !ctx.canActivate(value);
  const isLast = index === ctx.steps.length - 1;
  const vertical = ctx.orientation === "vertical";

  // sr-only status so the state (visual-only before) is announced: e.g.
  // "Step 2 of 3, Current step"
  const position = ctx.messages.step
    .replace("{index}", String(index + 1))
    .replace("{total}", String(ctx.steps.length));
  const statusWord = completed
    ? ctx.messages.completed
    : active
      ? ctx.messages.current
      : locked
        ? ctx.messages.locked
        : ctx.messages.upcoming;

  const trigger = (
    <button
      type="button"
      role="tab"
      id={stepTabId(ctx.uid, value)}
      aria-controls={stepPanelId(ctx.uid, value)}
      aria-selected={active}
      aria-current={active ? "step" : undefined}
      disabled={disabled || (!clickable && !active)}
      onClick={() => clickable && ctx.activate(value)}
      className={cn(
        "group flex items-center gap-2.5 rounded-md text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        clickable && !active && "cursor-pointer",
        // locked (linear future) or disabled steps read as not-allowed + dimmed;
        // `!` beats the host app's global `[role=tab]{cursor:pointer}`
        !clickable && !active && "cursor-not-allowed! opacity-60",
        disabled && "cursor-not-allowed! opacity-50",
        className,
      )}
    >
      <Marker state={state} index={index} icon={icon} locked={locked} />
      {children != null && (
        <span
          className={cn(
            "whitespace-nowrap text-sm transition-colors duration-[var(--bpdm-duration-base)]",
            active ? "font-semibold text-foreground" : completed ? "font-medium text-foreground" : "text-muted-foreground",
          )}
        >
          {children}
        </span>
      )}
      <span className="sr-only">{`${position}, ${statusWord}`}</span>
    </button>
  );

  // vertical: StepItem owns the rail/connector, so just render the trigger
  if (vertical) return trigger;

  // horizontal: stretch + a connector that fills as the step completes
  return (
    <div className={cn("flex items-center", !isLast && "flex-1")}>
      {trigger}
      {!isLast && (
        // track + a primary fill that grows left→right as the step completes
        <span aria-hidden className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
          <span
            className={cn(
              "absolute inset-0 origin-left rtl:origin-right rounded-full bg-primary transition-transform duration-[360ms] ease-[var(--bpdm-ease-out)]",
              completed ? "scale-x-100" : "scale-x-0",
            )}
          />
        </span>
      )}
    </div>
  );
}
StepImpl.__stepperRole = "step";
export const Step = StepImpl;

// ── panels ─────────────────────────────────────────────────────────────────────
export const StepPanels = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-2", className)} {...props} />
));
StepPanels.displayName = "StepPanels";

export interface StepPanelProps {
  value?: string | number;
  children?: React.ReactNode;
  className?: string;
}

export function StepPanel({ value: valueProp, children, className }: StepPanelProps) {
  const ctx = useStepperContext("StepPanel");
  const value = useResolvedValue(valueProp);
  const active = ctx.isActive(value);
  const vertical = ctx.orientation === "vertical";

  // Vertical: keep the panel mounted and animate its HEIGHT (grid 1fr↔0fr) so the
  // markers + rail move smoothly instead of jumping when the active step changes.
  if (vertical) {
    return (
      <div
        role="tabpanel"
        id={stepPanelId(ctx.uid, value)}
        aria-labelledby={stepTabId(ctx.uid, value)}
        aria-hidden={!active}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-[360ms] ease-[var(--bpdm-ease-out)]",
          active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          !active && "pointer-events-none",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("ms-[2.75rem] pb-2 pt-1 text-sm text-foreground", className)}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal: only the active panel mounts; it fades + rises in.
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={stepPanelId(ctx.uid, value)}
      aria-labelledby={stepTabId(ctx.uid, value)}
      className={cn(
        "animate-[bpdm-step-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] pt-2 text-sm text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── vertical item (wraps Step + StepPanel, draws the rail) ──────────────────────
export interface StepItemProps {
  value: string | number;
  children: React.ReactNode;
  className?: string;
}

function StepItemImpl({ value, children, className }: StepItemProps) {
  const ctx = useStepperContext("StepItem");
  const v = String(value);
  const index = ctx.indexOf(v);
  const completed = ctx.isCompleted(v);
  const isLast = index === ctx.steps.length - 1;

  return (
    <StepValueContext.Provider value={v}>
      <div className={cn("relative", !isLast && "pb-2", className)}>
        {!isLast && (
          // track + a primary fill that grows top→bottom as the step completes
          <span
            aria-hidden
            className="absolute start-4 top-9 bottom-0 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border"
          >
            <span
              className={cn(
                "absolute inset-0 origin-top rounded-full bg-primary transition-transform duration-[360ms] ease-[var(--bpdm-ease-out)]",
                completed ? "scale-y-100" : "scale-y-0",
              )}
            />
          </span>
        )}
        {children}
      </div>
    </StepValueContext.Provider>
  );
}
StepItemImpl.__stepperRole = "step";
export const StepItem = StepItemImpl;
