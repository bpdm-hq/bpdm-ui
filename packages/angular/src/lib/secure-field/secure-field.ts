import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { type FieldSize, WRAP_FIELD_BASE, WRAP_FIELD_SIZE } from "../internal/field";

export type SecureFieldFormat = "grouped" | "none";

function groupCard(digits: string): string {
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

function maskValue(formatted: string, tail: number): string {
  const visible = new Set<number>();
  if (tail > 0) {
    const idx: number[] = [];
    [...formatted].forEach((c, i) => {
      if (!/\s/.test(c)) idx.push(i);
    });
    idx.slice(Math.max(0, idx.length - tail)).forEach((i) => visible.add(i));
  }
  return [...formatted]
    .map((c, i) => (/\s/.test(c) ? c : visible.has(i) ? c : "•"))
    .join("");
}

/**
 * `<bpdm-secure-field>` — masked input for sensitive values (API keys, secrets,
 * license keys, tokens). Masked at rest with an optional visible tail, a reveal
 * toggle, and an optional copy button. Uses text + masking (not `type=password`)
 * so password managers don't hijack it. The real value is what you
 * read / copy / `(valueChange)`.
 *
 * ```html
 * <bpdm-secure-field format="grouped" [unmaskedTail]="4" placeholder="License key" />
 * <bpdm-secure-field copyable defaultValue="ak_live_7Hq2..." placeholder="API key" />
 * ```
 */
@Component({
  selector: "bpdm-secure-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-full" },
  template: `
    <div [class]="wrapClass()" [attr.aria-invalid]="ariaInvalid() ? 'true' : null">
      <input
        [id]="id() || null"
        type="text"
        autocomplete="off"
        data-1p-ignore
        data-lpignore="true"
        [attr.inputmode]="format() === 'grouped' ? 'numeric' : 'text'"
        [disabled]="disabled()"
        [value]="display()"
        [attr.name]="name() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="ariaInvalid() ? 'true' : null"
        (focus)="focused.set(true)"
        (blur)="focused.set(false)"
        (input)="onInput($any($event.target).value)"
        class="w-full min-w-0 bg-transparent tracking-wide tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
      @if (copyable()) {
        <button
          type="button"
          [attr.aria-label]="t().copy"
          [disabled]="disabled() || !current()"
          (click)="copy()"
          [class]="btnClass"
        >
          @if (copied()) {
            <svg viewBox="0 0 16 16" fill="none" class="size-4 text-success animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          } @else {
            <svg viewBox="0 0 16 16" fill="none" class="size-4" aria-hidden="true">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4" />
              <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v.5" stroke="currentColor" stroke-width="1.4" />
            </svg>
          }
        </button>
      }
      @if (revealable()) {
        <button
          type="button"
          [attr.aria-label]="revealed() ? t().hide : t().reveal"
          [attr.aria-pressed]="revealed()"
          [disabled]="disabled()"
          (click)="revealed.set(!revealed())"
          [class]="btnClass"
        >
          <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
            <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" stroke="currentColor" stroke-width="1.5" />
            <circle cx="10" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5" />
            @if (revealed()) {
              <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            }
          </svg>
        </button>
      }
      @if (copyable()) {
        <span class="sr-only" role="status" aria-live="polite">{{
          copied() ? t().copied : ""
        }}</span>
      }
    </div>
  `,
})
export class BpdmSecureField {
  /** Controlled value — `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Uncontrolled initial value. */
  readonly defaultValue = input<string>("");
  /** "grouped" groups digits 4-4-4-4 and restricts input to digits. */
  readonly format = input<SecureFieldFormat>("none");
  /** Characters kept visible while masked (e.g. 4 → •••• •••• •••• 4242). */
  readonly unmaskedTail = input<number>(0);
  /** Show the reveal (eye) toggle. */
  readonly revealable = input(true, { transform: booleanAttribute });
  /** Show a copy-to-clipboard button. */
  readonly copyable = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string>("");
  readonly size = input<FieldSize>("md");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  readonly id = input<string>("");
  /** Native `name` for form submission, forwarded to the inner `<input>`. */
  readonly name = input<string>("");
  /** Accessible name for the field, forwarded to the inner `<input>`. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** IDs of describing elements, forwarded to the inner `<input>`. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });
  /** Override the control labels + copy announcement (screen-reader text) for i18n. */
  readonly messages = input<{ reveal?: string; hide?: string; copy?: string; copied?: string }>({});

  protected readonly t = computed(() => ({
    reveal: "Reveal",
    hide: "Hide",
    copy: "Copy",
    copied: "Copied to clipboard",
    ...this.messages(),
  }));

  protected readonly revealed = signal(false);
  protected readonly focused = signal(false);
  protected readonly copied = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly btnClass =
    "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-4px)] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected readonly current = computed(() => {
    const v = this.value();
    return v === undefined ? this.defaultValue() : v;
  });

  private readonly formatted = computed(() =>
    this.format() === "grouped" ? groupCard(this.current()) : this.current(),
  );
  protected readonly display = computed(() => {
    const show = this.revealed() || this.focused();
    return show ? this.formatted() : maskValue(this.formatted(), this.unmaskedTail());
  });

  protected readonly wrapClass = computed(() =>
    cn(
      WRAP_FIELD_BASE,
      WRAP_FIELD_SIZE[this.size()],
      this.disabled() && "cursor-not-allowed opacity-50",
      this.classInput(),
    ),
  );

  protected onInput(v: string): void {
    if (this.format() === "grouped") v = v.replace(/\D/g, "").slice(0, 19);
    this.value.set(v);
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.current());
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
}
