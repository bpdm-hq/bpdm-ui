import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose } from "./dialog";
import { Button } from "./button";

export interface StepDialogStep {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
}

// --- i18n ---
export interface StepDialogMessages {
  back: string;
  next: string;
  finish: string;
  /** sr-only progress text. Tokens {index} and {total} are interpolated. */
  step: string;
  /** aria-label for the inherited close (X) button. */
  close: string;
}

export const DEFAULT_STEP_DIALOG_MESSAGES: StepDialogMessages = {
  back: "Back",
  next: "Next",
  finish: "Finish",
  step: "Step {index} of {total}",
  close: "Close",
};

export interface StepDialogProps {
  steps: StepDialogStep[];
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
  /** Screen-reader / navigation strings (Back, Next, Finish, progress, close). */
  messages?: Partial<StepDialogMessages>;
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stepper({
  steps,
  current,
  progress,
}: {
  steps: StepDialogStep[];
  current: number;
  progress: string;
}) {
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0">
      <li className="sr-only" aria-live="polite">
        {progress}
      </li>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <li className="flex shrink-0 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-[background-color,border-color,color,transform] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)]",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "scale-110 bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
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
              // Decorative connector — an <li> (not a bare <span>) so the <ol> has only
              // list-item children; aria-hidden keeps it out of the AT tree.
              <li
                aria-hidden="true"
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
  finishText,
  messages,
}: StepDialogProps) {
  const [step, setStep] = React.useState(0);
  const last = steps.length - 1;
  const current = steps[Math.min(step, last)];
  const t = React.useMemo(() => ({ ...DEFAULT_STEP_DIALOG_MESSAGES, ...messages }), [messages]);
  const progress = t.step
    .replace("{index}", String(Math.min(step, last) + 1))
    .replace("{total}", String(steps.length));

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
      messages={{ close: t.close }}
      // focus the panel itself, not the first field — a freshly opened wizard
      // shouldn't glow a field's focus ring before the user has interacted
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement | null)?.focus();
      }}
      footer={
        <>
          {step > 0 && (
            <Button variant="secondary" appearance="ghost" onClick={() => setStep((s) => s - 1)}>
              {t.back}
            </Button>
          )}
          {step < last ? (
            <Button onClick={() => setStep((s) => Math.min(s + 1, last))}>{t.next}</Button>
          ) : (
            <DialogClose asChild>
              <Button onClick={() => onComplete?.()}>{finishText ?? t.finish}</Button>
            </DialogClose>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <Stepper steps={steps} current={step} progress={progress} />
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
