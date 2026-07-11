import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { BpdmButton } from "../button/button";
import { BpdmDialog, BpdmDialogBody, BpdmDialogFooter, type DialogSize } from "../dialog/dialog";

export interface StepDialogStep {
  title: string;
  description?: string;
  content: TemplateRef<unknown>;
}

/**
 * `<bpdm-step-dialog>` — a multi-step "wizard" dialog: a progress stepper, per-step
 * content, and Back / Next / Finish navigation. Built on `<bpdm-dialog>`. The step
 * resets when the dialog closes; `(complete)` fires on Finish. Mirrors the React
 * `StepDialog`.
 *
 * ```html
 * <bpdm-step-dialog title="Set up workspace" [steps]="steps" (complete)="save()">
 *   <button bpdmButton bpdmStepDialogTrigger>Get started</button>
 * </bpdm-step-dialog>
 * ```
 */
@Component({
  selector: "bpdm-step-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmDialog, BpdmDialogBody, BpdmDialogFooter, BpdmButton, NgTemplateOutlet],
  host: { class: "contents" },
  template: `
    <ng-content select="[bpdmStepDialogTrigger]" />
    <bpdm-dialog
      [open]="open()"
      (openChange)="open.set($event)"
      [size]="size()"
      [title]="dialogTitle()"
      [description]="currentDescription()"
    >
      <ng-template bpdmDialogBody>
        <div class="space-y-5">
          <ol class="m-0 flex list-none items-center gap-2 p-0">
            @for (s of steps(); track $index) {
              <li class="flex shrink-0 items-center gap-2">
                <span [class]="circleClass($index)">
                  @if ($index < step()) {
                    <svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true">
                      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  } @else {
                    {{ $index + 1 }}
                  }
                </span>
                <span [class]="$index === step() ? 'hidden text-sm font-medium text-foreground sm:inline' : 'hidden text-sm text-muted-foreground sm:inline'">
                  {{ s.title }}
                </span>
              </li>
              @if ($index < steps().length - 1) {
                <span
                  class="h-px flex-1 transition-colors duration-[var(--bpdm-duration-slow)] ease-[var(--bpdm-ease-out)]"
                  [class]="$index < step() ? 'bg-primary' : 'bg-border'"
                ></span>
              }
            }
          </ol>
          @for (k of [step()]; track k) {
            <div class="animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]">
              @if (currentContent()) {
                <ng-container [ngTemplateOutlet]="currentContent()!" />
              }
            </div>
          }
        </div>
      </ng-template>
      <ng-template bpdmDialogFooter>
        @if (step() > 0) {
          <button bpdmButton variant="secondary" appearance="ghost" (click)="back()">Back</button>
        }
        @if (step() < last()) {
          <button bpdmButton (click)="next()">Next</button>
        } @else {
          <button bpdmButton (click)="finish()">{{ finishText() }}</button>
        }
      </ng-template>
    </bpdm-dialog>
  `,
})
export class BpdmStepDialog {
  readonly steps = input<StepDialogStep[]>([]);
  /** Overall dialog title (defaults to the current step's title). */
  readonly title = input("");
  readonly size = input<DialogSize>("md");
  readonly finishText = input("Finish");
  /** Open state — two-way bindable via `[(open)]`. */
  readonly open = model(false);
  /** Fired when the last step's Finish is clicked. */
  readonly complete = output<void>();

  protected readonly step = signal(0);
  protected readonly last = computed(() => Math.max(0, this.steps().length - 1));
  protected readonly currentStep = computed(() => this.steps()[Math.min(this.step(), this.last())]);
  protected readonly currentContent = computed(() => this.currentStep()?.content ?? null);
  protected readonly currentDescription = computed(() => this.currentStep()?.description ?? "");
  protected readonly dialogTitle = computed(() => this.title() || this.currentStep()?.title || "");

  constructor() {
    // restart the wizard whenever the dialog is closed
    effect(() => {
      if (!this.open()) this.step.set(0);
    });
  }

  openDialog(): void {
    this.open.set(true);
  }

  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected next(): void {
    this.step.update((s) => Math.min(s + 1, this.last()));
  }

  protected finish(): void {
    this.complete.emit();
    this.open.set(false);
  }

  protected circleClass(i: number): string {
    const step = this.step();
    return cn(
      "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-[background-color,border-color,color,transform] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)]",
      i < step
        ? "bg-primary text-primary-foreground"
        : i === step
          ? "scale-110 border-2 border-primary text-primary"
          : "border border-border text-muted-foreground",
    );
  }
}

/** Opens the nearest `<bpdm-step-dialog>` — put it on any trigger button. */
@Directive({
  selector: "[bpdmStepDialogTrigger]",
  host: { "(click)": "stepDialog.openDialog()" },
})
export class BpdmStepDialogTrigger {
  protected readonly stepDialog = inject(BpdmStepDialog);
}
