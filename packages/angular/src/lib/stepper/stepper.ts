import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
  TemplateRef,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type StepperOrientation = "horizontal" | "vertical";

/** Screen-reader labels + status words — override for i18n. Mirrors the React `StepperMessages`. */
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

// module-level counter → a stable id base per stepper for tab ↔ panel wiring
let stepperUid = 0;

/**
 * `<bpdm-stepper>` — a step-by-step flow. State lives here (controlled via `[(value)]`
 * or uncontrolled via `defaultValue`); steps are ordered by declaration. Horizontal
 * (`<bpdm-step-list>` + `<bpdm-step-panels>`) or vertical (`<bpdm-step-item>`), with
 * optional `linear` gating. Inject `BpdmStepper` (or `#s="bpdmStepper"`) to drive
 * navigation from a custom Back/Next bar. Mirrors the React `Stepper`.
 */
@Component({
  selector: "bpdm-stepper",
  exportAs: "bpdmStepper",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[attr.data-orientation]": "orientation()", "[class]": "rootClass()" },
  template: `<ng-content />`,
})
export class BpdmStepper {
  readonly value = model<string>("");
  readonly defaultValue = input<string>("");
  readonly orientation = input<StepperOrientation>("horizontal");
  /** Require the current step before advancing — future steps aren't clickable. */
  readonly linear = input(false, { transform: booleanAttribute });
  /** Show a lock icon on steps that aren't reachable yet (with `linear`). */
  readonly lockIndicator = input(false, { transform: booleanAttribute });
  /** Screen-reader labels + status words — override for i18n. */
  readonly messages = input<Partial<StepperMessages>>({});

  /** Merged i18n labels (defaults + overrides). */
  readonly t = computed<StepperMessages>(() => ({ ...DEFAULT_STEPPER_MESSAGES, ...this.messages() }));
  /** Stable id base for tab ↔ panel wiring. */
  readonly uid = `bpdm-stepper-${stepperUid++}`;

  tabId(v: string): string {
    return `${this.uid}-tab-${v}`;
  }
  panelId(v: string): string {
    return `${this.uid}-panel-${v}`;
  }

  // forwardRef: BpdmStep is declared after this component, so the query token
  // must be deferred to avoid a temporal-dead-zone error in the compiled ɵcmp
  private readonly stepCmps = contentChildren<BpdmStep>(forwardRef(() => BpdmStep), {
    descendants: true,
  });
  readonly steps = computed(() => this.stepCmps().map((s) => s.resolvedValue()));
  private readonly finished = signal(false);

  readonly active = computed(() => this.value() || this.defaultValue() || this.steps()[0] || "");
  readonly activeIndex = computed(() => this.steps().indexOf(this.active()));
  readonly isFirst = computed(() => this.activeIndex() <= 0);
  readonly isLast = computed(() => this.activeIndex() === this.steps().length - 1);

  protected readonly rootClass = computed(() =>
    this.orientation() === "vertical" ? "flex flex-col" : "flex flex-col gap-2",
  );

  indexOf(v: string): number {
    return this.steps().indexOf(v);
  }
  isActive(v: string): boolean {
    return v === this.active();
  }
  isCompleted(v: string): boolean {
    if (this.finished()) return this.indexOf(v) > -1;
    const i = this.indexOf(v);
    const ai = this.activeIndex();
    return i > -1 && ai > -1 && i < ai;
  }
  canActivate(v: string): boolean {
    const i = this.indexOf(v);
    if (i === -1) return false;
    return !this.linear() || i <= this.activeIndex();
  }
  private goto(v: string): void {
    this.finished.set(false);
    this.value.set(v);
  }
  activate(v: string): void {
    if (this.canActivate(v)) this.goto(v);
  }
  next(): void {
    const ai = this.activeIndex();
    const s = this.steps();
    if (ai > -1 && ai < s.length - 1) this.goto(s[ai + 1]);
  }
  back(): void {
    const ai = this.activeIndex();
    if (ai > 0) this.goto(this.steps()[ai - 1]);
  }
  /** Mark the whole flow done — every step (incl. the last) shows completed. */
  complete(): void {
    this.finished.set(true);
  }
}

/** Horizontal header row for the steps. */
@Component({
  selector: "bpdm-step-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "tablist",
    class: "flex items-center",
    "[attr.aria-label]": "ariaLabel()",
    "[attr.aria-orientation]": "orientation()",
  },
  template: `<ng-content />`,
})
export class BpdmStepList {
  private readonly stepper = inject(BpdmStepper);
  protected readonly ariaLabel = computed(() => this.stepper.t().ariaLabel);
  protected readonly orientation = computed(() => this.stepper.orientation());
}

/** Vertical wrapper around a `<bpdm-step>` + `<bpdm-step-panel>`; draws the rail. */
@Component({
  selector: "bpdm-step-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <div class="relative" [class.pb-2]="!isLast()">
      @if (!isLast()) {
        <span
          aria-hidden="true"
          class="absolute bottom-0 start-4 top-9 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border"
        >
          <span
            class="absolute inset-0 origin-top rounded-full bg-primary transition-transform duration-[360ms] ease-[var(--bpdm-ease-out)]"
            [class]="completed() ? 'scale-y-100' : 'scale-y-0'"
          ></span>
        </span>
      }
      <ng-content />
    </div>
  `,
})
export class BpdmStepItem {
  readonly value = input.required<string | number>();
  private readonly stepper = inject(BpdmStepper);
  readonly resolved = computed(() => String(this.value()));
  protected readonly index = computed(() => this.stepper.indexOf(this.resolved()));
  protected readonly completed = computed(() => this.stepper.isCompleted(this.resolved()));
  protected readonly isLast = computed(
    () => this.index() === this.stepper.steps().length - 1,
  );
}

/** A single step header — marker + label, with a connector (horizontal). */
@Component({
  selector: "bpdm-step",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: "contents" },
  template: `
    <div [class]="vertical() ? 'contents' : isLast() ? 'flex items-center' : 'flex flex-1 items-center'">
      <button
        type="button"
        role="tab"
        [attr.id]="tabId()"
        [attr.aria-controls]="panelId()"
        [attr.aria-selected]="active()"
        [attr.aria-current]="active() ? 'step' : null"
        [disabled]="disabled() || (!clickable() && !active())"
        (click)="onClick()"
        [class]="btnClass()"
      >
        <span [class]="markerClass()">
          @if (state() === "completed" && !icon()) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          } @else if (locked()) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="!size-3.5" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          } @else if (icon()) {
            <ng-container [ngTemplateOutlet]="icon()!" />
          } @else {
            {{ index() + 1 }}
          }
        </span>
        <span [class]="labelClass()"><ng-content /></span>
        <span class="sr-only">{{ srStatus() }}</span>
      </button>
      @if (!vertical() && !isLast()) {
        <span aria-hidden="true" class="relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
          <span
            class="absolute inset-0 origin-left rtl:origin-right rounded-full bg-primary transition-transform duration-[360ms] ease-[var(--bpdm-ease-out)]"
            [class]="completed() ? 'scale-x-100' : 'scale-x-0'"
          ></span>
        </span>
      }
    </div>
  `,
})
export class BpdmStep {
  readonly value = input<string | number>("");
  /** Custom marker template (overrides the number; completed still shows a check). */
  readonly icon = input<TemplateRef<unknown> | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly stepper = inject(BpdmStepper);
  private readonly item = inject(BpdmStepItem, { optional: true });

  readonly resolvedValue = computed(() => {
    const own = this.value();
    if (own !== "" && own != null) return String(own);
    return this.item ? this.item.resolved() : "";
  });

  protected readonly vertical = computed(() => this.stepper.orientation() === "vertical");
  protected readonly index = computed(() => this.stepper.indexOf(this.resolvedValue()));
  protected readonly active = computed(() => this.stepper.isActive(this.resolvedValue()));
  protected readonly completed = computed(() => this.stepper.isCompleted(this.resolvedValue()));
  protected readonly isLast = computed(
    () => this.index() === this.stepper.steps().length - 1,
  );
  protected readonly clickable = computed(
    () => !this.disabled() && this.stepper.canActivate(this.resolvedValue()),
  );
  protected readonly locked = computed(
    () =>
      this.stepper.lockIndicator() &&
      !this.active() &&
      !this.completed() &&
      !this.stepper.canActivate(this.resolvedValue()),
  );
  protected readonly state = computed<"completed" | "active" | "upcoming">(() =>
    this.completed() ? "completed" : this.active() ? "active" : "upcoming",
  );

  protected readonly tabId = computed(() => this.stepper.tabId(this.resolvedValue()));
  protected readonly panelId = computed(() => this.stepper.panelId(this.resolvedValue()));
  // sr-only status so the state (visual-only before) is announced: e.g.
  // "Step 2 of 3, Current step"
  protected readonly srStatus = computed(() => {
    const t = this.stepper.t();
    const position = t.step
      .replace("{index}", String(this.index() + 1))
      .replace("{total}", String(this.stepper.steps().length));
    const word = this.completed()
      ? t.completed
      : this.active()
        ? t.current
        : this.locked()
          ? t.locked
          : t.upcoming;
    return `${position}, ${word}`;
  });

  protected readonly btnClass = computed(() =>
    cn(
      "group flex items-center gap-2.5 rounded-md text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      this.clickable() && !this.active() && "cursor-pointer",
      // `!` beats the host app's global `[role=tab]{cursor:pointer}`
      !this.clickable() && !this.active() && "cursor-not-allowed! opacity-60",
      this.disabled() && "cursor-not-allowed! opacity-50",
    ),
  );
  protected readonly markerClass = computed(() =>
    cn(
      "grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] [&_svg]:size-4",
      this.state() === "completed" && "border-primary bg-primary text-primary-foreground",
      this.state() === "active" && "scale-105 border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
      this.state() === "upcoming" && "border-border text-muted-foreground",
    ),
  );
  protected readonly labelClass = computed(() =>
    cn(
      "whitespace-nowrap text-sm transition-colors duration-[var(--bpdm-duration-base)] empty:hidden",
      this.active()
        ? "font-semibold text-foreground"
        : this.completed()
          ? "font-medium text-foreground"
          : "text-muted-foreground",
    ),
  );

  protected onClick(): void {
    if (this.clickable()) this.stepper.activate(this.resolvedValue());
  }
}

/** Wrapper for the horizontal step panels. */
@Component({
  selector: "bpdm-step-panels",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "mt-2 block" },
  template: `<ng-content />`,
})
export class BpdmStepPanels {}

/** Content for one step. Mounts only when active (horizontal) or animates height (vertical). */
@Component({
  selector: "bpdm-step-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  // a single <ng-content> for both orientations — two ng-content slots (one per
  // @if branch) would leave projected content with no slot in the inactive branch.
  // Both modes animate height via the grid 1fr↔0fr trick (no JS measuring).
  template: `
    <div
      role="tabpanel"
      [attr.id]="panelId()"
      [attr.aria-labelledby]="tabId()"
      [attr.aria-hidden]="!active()"
      [class]="outerClass()"
    >
      <div class="overflow-hidden">
        <div [class]="innerClass()"><ng-content /></div>
      </div>
    </div>
  `,
})
export class BpdmStepPanel {
  readonly value = input<string | number>("");
  private readonly stepper = inject(BpdmStepper);
  private readonly item = inject(BpdmStepItem, { optional: true });
  private readonly resolved = computed(() => {
    const own = this.value();
    if (own !== "" && own != null) return String(own);
    return this.item ? this.item.resolved() : "";
  });
  protected readonly vertical = computed(() => this.stepper.orientation() === "vertical");
  protected readonly active = computed(() => this.stepper.isActive(this.resolved()));
  protected readonly tabId = computed(() => this.stepper.tabId(this.resolved()));
  protected readonly panelId = computed(() => this.stepper.panelId(this.resolved()));

  protected readonly outerClass = computed(() =>
    cn(
      "grid transition-[grid-template-rows,opacity] duration-[360ms] ease-[var(--bpdm-ease-out)]",
      this.active() ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none",
    ),
  );
  protected readonly innerClass = computed(() =>
    cn("text-sm text-foreground", this.vertical() ? "ms-[2.75rem] pb-2 pt-1" : "pt-2"),
  );
}
