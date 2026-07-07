import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { type FieldSize, WRAP_FIELD_BASE, WRAP_FIELD_SIZE } from "../internal/field";

/** 0–4 strength score from length + character variety. */
export function scorePassword(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

const DEFAULT_LABELS: Record<number, string[]> = {
  3: ["Weak", "Medium", "Strong"],
  4: ["Weak", "Fair", "Good", "Strong"],
  5: ["Very weak", "Weak", "Fair", "Good", "Strong"],
};

/** Per-instance counter for a stable strength-meter id (aria-describedby). */
let meterUid = 0;

/**
 * `<bpdm-password-input>` — password input with a show/hide toggle and an
 * optional strength meter (segmented bar + label: Weak / Fair / Good / Strong).
 * Uses `type="password"`, so password managers work. Controlled (`[(value)]`)
 * or uncontrolled (`defaultValue`).
 *
 * ```html
 * <bpdm-password-input placeholder="Password" />
 * <bpdm-password-input [feedback]="false" placeholder="Password" />
 * ```
 */
@Component({
  selector: "bpdm-password-input",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-full" },
  template: `
    <div [class]="rootClass()">
      <div [class]="wrapClass()" [attr.aria-invalid]="ariaInvalid() ? 'true' : null">
        <input
          [id]="id() || null"
          [type]="revealed() ? 'text' : 'password'"
          [attr.name]="name() || null"
          [attr.autocomplete]="autoComplete() || null"
          [disabled]="disabled()"
          [value]="current()"
          [attr.placeholder]="placeholder() || null"
          [attr.aria-label]="ariaLabel() || null"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="ariaInvalid() ? 'true' : null"
          (input)="value.set($any($event.target).value)"
          class="w-full min-w-0 bg-transparent focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          [attr.aria-label]="revealed() ? 'Hide password' : 'Show password'"
          [attr.aria-pressed]="revealed()"
          [disabled]="disabled()"
          (click)="revealed.set(!revealed())"
          class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-[calc(var(--radius)-4px)] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
        >
          <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
            <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" stroke="currentColor" stroke-width="1.5" />
            <circle cx="10" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5" />
            @if (revealed()) {
              <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            }
          </svg>
        </button>
      </div>

      @if (showMeter()) {
        <div class="mt-2">
          <div class="flex gap-1" aria-hidden="true">
            @for (i of segments(); track i) {
              <span [class]="'h-1 flex-1 rounded-full transition-colors ' + (i < filled() ? barColor() : 'bg-muted')"></span>
            }
          </div>
          <p [id]="meterId" [class]="'mt-1 text-xs ' + textColor()" aria-live="polite">{{ meterLabel() }}</p>
        </div>
      }
    </div>
  `,
})
export class BpdmPasswordInput {
  /** Controlled value — `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Uncontrolled initial value. */
  readonly defaultValue = input<string>("");
  /** Show the strength meter below the field. Default true. */
  readonly feedback = input(true, { transform: booleanAttribute });
  /** Number of strength segments. Default 4. */
  readonly levels = input<number>(4);
  /** Custom scorer returning 0..levels. Defaults to a length + variety heuristic. */
  readonly strength = input<((value: string) => number) | undefined>(undefined);
  /** Labels per level (length = levels). Defaults provided for 3 / 4 / 5. */
  readonly labels = input<string[] | undefined>(undefined);
  readonly placeholder = input<string>("");
  readonly size = input<FieldSize>("md");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly autoComplete = input<string>("");
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  readonly id = input<string>("");
  /** Native `name` for form submission, forwarded to the inner `<input>`. */
  readonly name = input<string>("");
  /** Accessible name for the field, forwarded to the inner `<input>`. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** IDs of describing elements, merged with the strength meter's id. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });

  /** Stable id linking the strength meter to the field via aria-describedby. */
  protected readonly meterId = `bpdm-pw-strength-${(meterUid += 1)}`;

  protected readonly revealed = signal(false);

  protected readonly current = computed(() => {
    const v = this.value();
    return v === undefined ? this.defaultValue() : v;
  });

  protected readonly showMeter = computed(() => this.feedback() && this.current().length > 0);

  protected readonly describedBy = computed(() => {
    const parts = [this.ariaDescribedby(), this.showMeter() ? this.meterId : ""].filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  });

  private readonly rawScore = computed(() => {
    const custom = this.strength();
    return custom ? custom(this.current()) : Math.round((scorePassword(this.current()) / 4) * this.levels());
  });
  protected readonly filled = computed(() =>
    Math.max(0, Math.min(this.levels(), this.rawScore())),
  );
  private readonly ratio = computed(() => (this.levels() > 0 ? this.filled() / this.levels() : 0));
  private readonly tone = computed(() => {
    if (this.filled() === 0) return "";
    const r = this.ratio();
    return r <= 0.34 ? "weak" : r <= 0.67 ? "medium" : "strong";
  });
  protected readonly barColor = computed(() => {
    const t = this.tone();
    return t === "weak" ? "bg-destructive" : t === "strong" ? "bg-success" : "bg-primary";
  });
  protected readonly textColor = computed(() => {
    const t = this.tone();
    return t === "weak"
      ? "text-destructive"
      : t === "strong"
        ? "text-success"
        : "text-muted-foreground";
  });
  protected readonly meterLabel = computed(() => {
    const set = this.labels() ?? DEFAULT_LABELS[this.levels()] ?? [];
    return this.filled() > 0 ? (set[this.filled() - 1] ?? "") : "";
  });
  protected readonly segments = computed(() =>
    Array.from({ length: this.levels() }, (_, i) => i),
  );

  protected readonly rootClass = computed(() => cn("w-full", this.classInput()));
  protected readonly wrapClass = computed(() =>
    cn(
      WRAP_FIELD_BASE,
      WRAP_FIELD_SIZE[this.size()],
      this.disabled() && "cursor-not-allowed opacity-50",
    ),
  );
}
