import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChildren,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type InputOtpSize = "sm" | "md" | "lg";

const cellSize: Record<InputOtpSize, string> = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
};

// resolved text direction of an element — used so arrow keys follow the
// visual cell order (in RTL, ArrowLeft advances to the next cell).
function isRtl(el: HTMLElement): boolean {
  if (el.closest('[dir="rtl"]')) return true;
  return typeof getComputedStyle === "function" && getComputedStyle(el).direction === "rtl";
}

// Group sizes: explicit groupSize wins (last group = remainder); otherwise auto
// into 2 balanced groups (even → equal halves, odd → ceil + floor).
function getGroups(length: number, groupSize?: number, grouped?: boolean): number[] {
  if (groupSize && groupSize > 0) {
    const out: number[] = [];
    for (let i = 0; i < length; i += groupSize) out.push(Math.min(groupSize, length - i));
    return out;
  }
  if (grouped) {
    return length % 2 === 0
      ? [length / 2, length / 2]
      : [Math.ceil(length / 2), Math.floor(length / 2)];
  }
  return [length];
}

interface OtpCell {
  i: number;
  isFirst: boolean;
  isLast: boolean;
}

const BASE_CELL =
  "relative border border-input bg-background text-center font-medium text-foreground shadow-sm transition-[color,border-color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] ease-[var(--bpdm-ease-overshoot)] focus:z-10 focus:scale-[1.08] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

/**
 * `<bpdm-input-otp>` — one-time-code input: one box per character with
 * auto-advance, backspace-to-previous, arrow navigation, and paste-to-fill.
 * Controlled (`[(value)]`) or uncontrolled (`defaultValue`); value is a string.
 *
 * ```html
 * <bpdm-input-otp [length]="6" integerOnly />
 * <bpdm-input-otp [length]="4" mask integerOnly />        <!-- hidden PIN -->
 * <bpdm-input-otp [(value)]="code" />
 * ```
 */
@Component({
  selector: "bpdm-input-otp",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  template: `
    @if (isGrouped()) {
      <div
        role="group"
        [id]="id() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="ariaDescribedby() || null"
        class="flex items-center gap-3"
      >
        @for (group of groups(); track groupIndex; let groupIndex = $index) {
          @if (groupIndex > 0) {
            <span aria-hidden="true" class="select-none px-1 text-muted-foreground">{{ separator() }}</span>
          }
          <div class="flex items-center">
            @for (cell of group; track cell.i) {
              <input
                #cellInput
                type="text"
                [attr.inputmode]="integerOnly() ? 'numeric' : 'text'"
                [attr.autocomplete]="cell.i === 0 ? 'one-time-code' : 'off'"
                data-1p-ignore
                data-lpignore="true"
                maxlength="1"
                [disabled]="disabled()"
                [attr.aria-label]="cellLabel()(cell.i, length())"
                [value]="cells()[cell.i]"
                [style.-webkit-text-security]="mask() ? 'disc' : null"
                [class]="cellClass(cell)"
                (input)="onInput(cell.i, $any($event.target).value)"
                (keydown)="onKeydown(cell.i, $event)"
                (paste)="onPaste($event)"
                (focus)="$any($event.target).select()"
              />
            }
          </div>
        }
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="cells().join('')" />
        }
      </div>
    } @else {
      <div
        role="group"
        [id]="id() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="ariaDescribedby() || null"
        class="flex items-center gap-2"
      >
        @for (cell of groups()[0]; track cell.i) {
          <input
            #cellInput
            type="text"
            [attr.inputmode]="integerOnly() ? 'numeric' : 'text'"
            [attr.autocomplete]="cell.i === 0 ? 'one-time-code' : 'off'"
            data-1p-ignore
            data-lpignore="true"
            maxlength="1"
            [disabled]="disabled()"
            [attr.aria-label]="cellLabel()(cell.i, length())"
            [value]="cells()[cell.i]"
            [style.-webkit-text-security]="mask() ? 'disc' : null"
            [class]="cellClass(cell)"
            (input)="onInput(cell.i, $any($event.target).value)"
            (keydown)="onKeydown(cell.i, $event)"
            (paste)="onPaste($event)"
            (focus)="$any($event.target).select()"
          />
        }
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="cells().join('')" />
        }
      </div>
    }
  `,
})
export class BpdmInputOtp {
  /** Number of cells. */
  readonly length = input<number>(6);
  /** Controlled value — `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Uncontrolled initial value. */
  readonly defaultValue = input<string>("");
  /** Hide characters (one-time PINs). */
  readonly mask = input(false, { transform: booleanAttribute });
  /** Restrict input to digits 0-9. */
  readonly integerOnly = input(false, { transform: booleanAttribute });
  readonly size = input<InputOtpSize>("md");
  /** Connect cells into fixed groups of this size (e.g. 3 → 3-3, last = remainder). */
  readonly groupSize = input<number | undefined>(undefined);
  /** Auto-group into 2 balanced segments. Ignored if `groupSize` is set. */
  readonly grouped = input(false, { transform: booleanAttribute });
  /** Character shown between groups. */
  readonly separator = input<string>("−");
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Focus the first cell on mount. */
  readonly autoFocus = input(false, { transform: booleanAttribute });
  /** Emits the joined value under this `name` via a hidden input for native form submission. */
  readonly name = input<string>("");
  /** Group id (for label association / testing). */
  readonly id = input<string>("");
  readonly ariaLabel = input<string>("One-time code", { alias: "aria-label" });
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });
  /** Per-cell screen-reader label. Override for i18n. Default: `Character N of M`. */
  readonly cellLabel = input<(index: number, length: number) => string>(
    (index, len) => `Character ${index + 1} of ${len}`,
  );
  /** Fired once every cell is filled — handy for auto-submit. */
  readonly complete = output<string>();

  private readonly cellInputs = viewChildren<ElementRef<HTMLInputElement>>("cellInput");

  constructor() {
    afterNextRender(() => {
      if (this.autoFocus()) this.cellInputs()[0]?.nativeElement.focus();
    });
  }

  protected readonly isGrouped = computed(
    () => (!!this.groupSize() && this.groupSize()! > 0) || this.grouped(),
  );

  // re-sizes to the current `length` every render, so changing length grows /
  // shrinks the cells (works for a string source).
  protected readonly cells = computed<string[]>(() => {
    const v = this.value();
    const src = v === undefined ? this.defaultValue() : v;
    return Array.from({ length: this.length() }, (_, i) => src[i] ?? "");
  });

  protected readonly groups = computed<OtpCell[][]>(() => {
    const sizes = getGroups(this.length(), this.groupSize(), this.grouped());
    const out: OtpCell[][] = [];
    let offset = 0;
    for (const sz of sizes) {
      const group: OtpCell[] = [];
      for (let k = 0; k < sz; k++) {
        group.push({ i: offset + k, isFirst: k === 0, isLast: k === sz - 1 });
      }
      out.push(group);
      offset += sz;
    }
    return out;
  });

  protected cellClass(cell: OtpCell): string {
    return cn(
      BASE_CELL,
      cellSize[this.size()],
      this.isGrouped()
        ? cn(
            "rounded-none",
            !cell.isFirst && "-ms-px",
            cell.isFirst && "rounded-s-[var(--radius)]",
            cell.isLast && "rounded-e-[var(--radius)]",
          )
        : "rounded-[var(--radius)]",
    );
  }

  protected onInput(i: number, raw: string): void {
    const ch = raw.slice(-1);
    if (this.integerOnly() && ch && !/\d/.test(ch)) {
      // reject — restore the cell to its committed value
      this.syncCell(i);
      return;
    }
    const next = this.cells().slice();
    next[i] = ch;
    this.commit(next);
    if (ch) this.focusCell(i + 1);
  }

  protected onKeydown(i: number, e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = this.cells().slice();
      if (this.cells()[i]) {
        next[i] = "";
        this.commit(next);
        this.syncCell(i);
      } else if (i > 0) {
        next[i - 1] = "";
        this.commit(next);
        this.focusCell(i - 1);
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      // arrows follow visual order — in RTL, ArrowLeft moves to the next cell
      const forward = e.key === (isRtl(e.target as HTMLElement) ? "ArrowLeft" : "ArrowRight");
      this.focusCell(forward ? i + 1 : i - 1);
    }
  }

  protected onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    let chars = (e.clipboardData?.getData("text") ?? "").trim().split("");
    if (this.integerOnly()) chars = chars.filter((c) => /\d/.test(c));
    const len = this.length();
    const next = Array.from({ length: len }, (_, k) => chars[k] ?? "");
    this.commit(next);
    this.focusCell(Math.min(chars.length, len - 1));
  }

  private commit(next: string[]): void {
    const joined = next.join("");
    this.value.set(joined);
    if (next.length === this.length() && next.every((c) => c.length === 1)) {
      this.complete.emit(joined);
    }
  }

  private focusCell(i: number): void {
    const idx = Math.max(0, Math.min(this.length() - 1, i));
    this.cellInputs()[idx]?.nativeElement.focus();
  }

  // restore a cell's DOM value to the committed model value (after a rejected
  // keystroke the native input keeps the typed char until we overwrite it)
  private syncCell(i: number): void {
    const el = this.cellInputs()[i]?.nativeElement;
    if (el) el.value = this.cells()[i] ?? "";
  }
}
