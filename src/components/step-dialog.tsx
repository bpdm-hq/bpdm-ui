import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose } from "./dialog";
import { Button } from "./button";

export interface Step {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
}

export interface StepDialogProps {
  steps: Step[];
  trigger?: React.ReactNode;
  /** Overall dialog title (defaults to the current step's title). */
  title?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fired when the last step's Finish is clicked. */
  onComplete?: () => void;
  finishText?: string;
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <li className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-[background-color,border-color,color,transform] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)]",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "scale-110 border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground",
                )}
              >
                {done ? <CheckGlyph /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            </li>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors duration-[var(--bpdm-duration-slow)] ease-[var(--bpdm-ease-out)]",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

/**
 * Multi-step "wizard" dialog — a progress stepper, per-step content, and
 * Back / Next / Finish navigation. Built on the Dialog. The step resets when the
 * dialog closes; `onComplete` fires on Finish.
 */
export function StepDialog({
  steps,
  trigger,
  title,
  size = "md",
  open,
  defaultOpen,
  onOpenChange,
  onComplete,
  finishText = "Finish",
}: StepDialogProps) {
  const [step, setStep] = React.useState(0);
  const last = steps.length - 1;
  const current = steps[Math.min(step, last)];

  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(o) => {
        onOpenChange?.(o);
        if (!o) setStep(0); // restart next time it opens
      }}
      trigger={trigger}
      size={size}
      title={title ?? current.title}
      description={current.description}
      footer={
        <>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < last ? (
            <Button onClick={() => setStep((s) => Math.min(s + 1, last))}>Next</Button>
          ) : (
            <DialogClose asChild>
              <Button onClick={() => onComplete?.()}>{finishText}</Button>
            </DialogClose>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <Stepper steps={steps} current={step} />
        <div
          key={step}
          className="animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]"
        >
          {current.content}
        </div>
      </div>
    </Dialog>
  );
}
