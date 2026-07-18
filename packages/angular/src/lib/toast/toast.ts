import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injectable,
  InjectionToken,
  input,
  signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
  viewChild,
  type Provider,
} from "@angular/core";
import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";

// public types (mirror the React toast exactly)
export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Secondary line under the title. */
  description?: string;
  /** Colour + default leading icon. */
  variant?: ToastVariant;
  /** Auto-dismiss after N ms. `Infinity` (or 0) keeps it until dismissed. */
  duration?: number;
  /** A single inline action button; clicking it runs `onClick` and dismisses. */
  action?: ToastAction;
  /** Show the close (X) button. Default true (false while a promise is loading). */
  dismissible?: boolean;
  /** Called when the toast is dismissed (auto-timeout, close button, or swipe). */
  onDismiss?: () => void;
  /** Reuse an id to update an existing toast in place. */
  id?: string;
  /** Override the leading icon with a template; pass `null` to hide it. */
  icon?: TemplateRef<unknown> | null;
}

export interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

/** @internal — a live toast in the store. */
interface ToastRecord extends Omit<ToastOptions, "id"> {
  id: string;
  title: string;
  loading?: boolean;
}

// i18n
export interface ToastMessages {
  /** aria-label for each toast's close (X) button. */
  dismiss: string;
  /** Accessible label for the toast live-region / viewport. */
  regionLabel: string;
}

export const DEFAULT_TOAST_MESSAGES: ToastMessages = {
  dismiss: "Dismiss",
  regionLabel: "Notifications",
};

/** App-wide localizable defaults for the toast close button; `<bpdm-toaster [messages]>` still wins. */
export const BPDM_TOAST_MESSAGES = new InjectionToken<Partial<ToastMessages>>(
  "BPDM_TOAST_MESSAGES",
);

/** Provide app-wide toast message defaults. */
export function provideBpdmToastMessages(messages: Partial<ToastMessages>): Provider {
  return { provide: BPDM_TOAST_MESSAGES, useValue: messages };
}

// the service: the imperative store + entry point, injectable anywhere
/**
 * Fire toasts from anywhere — inject `BpdmToast` and call `.success(...)`,
 * `.error(...)`, `.promise(p, {...})`, etc. Render `<bpdm-toaster>` once near the
 * app root; it reads this service's signal store and renders. No provider or
 * context wiring required. Mirrors the React `toast()` API.
 *
 * ```ts
 * const toast = inject(BpdmToast);
 * toast.success("Saved", { description: "Your changes are live." });
 * ```
 */
@Injectable({ providedIn: "root" })
export class BpdmToast {
  private readonly _toasts = signal<ToastRecord[]>([]);
  /** The live toasts, newest first. `<bpdm-toaster>` renders this. */
  readonly toasts = this._toasts.asReadonly();
  private seq = 0;

  private upsert(record: ToastRecord): void {
    this._toasts.update((list) => {
      const exists = list.some((r) => r.id === record.id);
      // update in place, or prepend (newest first — the viewport orders by position)
      return exists
        ? list.map((r) => (r.id === record.id ? { ...r, ...record } : r))
        : [record, ...list];
    });
  }

  private create(title: string, opts: ToastOptions, variant: ToastVariant): string {
    const id = opts.id ?? `bpdm-toast-${++this.seq}`;
    this.upsert({ ...opts, id, title, variant: opts.variant ?? variant });
    return id;
  }

  /** Show a neutral toast. Returns its id (reuse it to update in place). */
  show(title: string, opts: ToastOptions = {}): string {
    return this.create(title, opts, "default");
  }
  success(title: string, opts: ToastOptions = {}): string {
    return this.create(title, opts, "success");
  }
  error(title: string, opts: ToastOptions = {}): string {
    return this.create(title, opts, "error");
  }
  warning(title: string, opts: ToastOptions = {}): string {
    return this.create(title, opts, "warning");
  }
  info(title: string, opts: ToastOptions = {}): string {
    return this.create(title, opts, "info");
  }

  /** Dismiss one toast by id, or all when called with no argument. */
  dismiss(id?: string): void {
    this._toasts.update((list) => (id == null ? [] : list.filter((r) => r.id !== id)));
  }

  /** Show a loading toast, then resolve it to success/error when the promise settles. */
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> {
    const id = `bpdm-toast-${++this.seq}`;
    this.upsert({
      id,
      title: messages.loading,
      variant: "default",
      loading: true,
      duration: Infinity,
      dismissible: false,
    });
    promise.then(
      (data) =>
        this.upsert({
          id,
          loading: false,
          variant: "success",
          duration: undefined,
          dismissible: true,
          title: typeof messages.success === "function" ? messages.success(data) : messages.success,
        }),
      (err) =>
        this.upsert({
          id,
          loading: false,
          variant: "error",
          duration: undefined,
          dismissible: true,
          title: typeof messages.error === "function" ? messages.error(err) : messages.error,
        }),
    );
    return promise;
  }
}

// per-variant look: icon + colored left accent + subtle icon tint
interface VariantLook {
  hasIcon: boolean;
  fg: string;
  accent: string; // faint full-height track (::before)
  bar: string; // bright countdown fill
  tint: string;
}

const VARIANTS: Record<ToastVariant, VariantLook> = {
  default: { hasIcon: false, fg: "", accent: "before:bg-border", bar: "bg-border", tint: "" },
  success: {
    hasIcon: true,
    fg: "text-success",
    accent: "before:bg-success",
    bar: "bg-success",
    tint: "bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
  },
  error: {
    hasIcon: true,
    fg: "text-destructive",
    accent: "before:bg-destructive",
    bar: "bg-destructive",
    tint: "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)]",
  },
  warning: {
    hasIcon: true,
    fg: "text-warning",
    accent: "before:bg-warning",
    bar: "bg-warning",
    tint: "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  },
  info: {
    hasIcon: true,
    fg: "text-info",
    accent: "before:bg-info",
    bar: "bg-info",
    tint: "bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
  },
};

interface PositionConfig {
  viewport: string;
  col: string;
  swipe: "right" | "left" | "up" | "down";
  in: string;
  out: string;
}

const POSITIONS: Record<ToastPosition, PositionConfig> = {
  "top-left": { viewport: "top-0 left-0 sm:top-4 sm:left-4 items-start", col: "flex-col", swipe: "left", in: "bpdm-toast-in-left", out: "bpdm-toast-out-left" },
  "top-center": { viewport: "top-0 left-1/2 -translate-x-1/2 sm:top-4 items-center", col: "flex-col", swipe: "up", in: "bpdm-toast-in-top", out: "bpdm-toast-out-top" },
  "top-right": { viewport: "top-0 right-0 sm:top-4 sm:right-4 items-end", col: "flex-col", swipe: "right", in: "bpdm-toast-in-right", out: "bpdm-toast-out-right" },
  "bottom-left": { viewport: "bottom-0 left-0 sm:bottom-4 sm:left-4 items-start", col: "flex-col-reverse", swipe: "left", in: "bpdm-toast-in-left", out: "bpdm-toast-out-left" },
  "bottom-center": { viewport: "bottom-0 left-1/2 -translate-x-1/2 sm:bottom-4 items-center", col: "flex-col-reverse", swipe: "down", in: "bpdm-toast-in-bottom", out: "bpdm-toast-out-bottom" },
  "bottom-right": { viewport: "bottom-0 right-0 sm:bottom-4 sm:right-4 items-end", col: "flex-col-reverse", swipe: "right", in: "bpdm-toast-in-right", out: "bpdm-toast-out-right" },
};

// exit-animation fallback: if `animationend` never fires (reduced motion, no
// compositor, headless test env) still remove the toast so it can't get stuck.
const EXIT_MS = 200;
// swipe distance (px) past which a drag dismisses instead of springing back.
const SWIPE_THRESHOLD = 45;

/** @internal — one rendered toast. Owns its enter/exit, auto-dismiss timer and swipe. */
@Component({
  selector: "bpdm-toast-item",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    "[attr.data-bpdm-toast]": "''",
    "[attr.data-state]": "closing() ? 'closed' : 'open'",
    "[attr.data-swipe]": "swipe() === 'none' ? null : swipe()",
    "[attr.role]": "role()",
    "[attr.aria-live]": "ariaLive()",
    "[attr.aria-atomic]": "'true'",
    "[class]": "rootClass()",
    "[style.--bpdm-toast-in]": "cfg().in",
    "[style.--bpdm-toast-out]": "cfg().out",
    "[style.--radix-toast-swipe-move-x]": "moveX()",
    "[style.--radix-toast-swipe-move-y]": "moveY()",
    "(mouseenter)": "onHoverStart()",
    "(mouseleave)": "onHoverEnd()",
    "(focusin)": "onFocusIn()",
    "(focusout)": "onFocusOut($event)",
    "(animationend)": "onAnimationEnd($event)",
    "(pointerdown)": "onPointerDown($event)",
    "(pointermove)": "onPointerMove($event)",
    "(pointerup)": "onPointerUp($event)",
    "(pointercancel)": "onPointerUp($event)",
  },
  template: `
    @if (!sticky()) {
      <span
        data-bpdm-countdown
        aria-hidden="true"
        [style.animation]="'bpdm-toast-countdown ' + dur() + 'ms linear forwards'"
        [class]="countdownClass()"
      ></span>
    }

    @switch (leadingKind()) {
      @case ("loading") {
        <span [class]="iconBoxClass('bg-muted')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 animate-spin text-muted-foreground" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      }
      @case ("custom") {
        <span [class]="iconBoxClass(v().tint)">
          <ng-container [ngTemplateOutlet]="record().icon ?? null" />
        </span>
      }
      @case ("variant") {
        <span [class]="iconBoxClass(v().tint)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class]="iconSvgClass()" aria-hidden="true">
            @switch (variant()) {
              @case ("success") {
                <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              }
              @case ("error") {
                <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
              }
              @case ("warning") {
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
              }
              @case ("info") {
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              }
            }
          </svg>
        </span>
      }
    }

    <div class="min-w-0 flex-1">
      <p class="m-0 text-sm font-semibold">{{ record().title }}</p>
      @if (record().description != null) {
        <p class="m-0 mt-1 text-sm text-muted-foreground">{{ record().description }}</p>
      }
      @if (record().action; as action) {
        <div class="mt-2.5">
          <button
            type="button"
            (click)="onAction(action)"
            class="inline-flex h-7 items-center rounded-md border border-border bg-transparent px-2.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ action.label }}
          </button>
        </div>
      }
    </div>

    @if (dismissible()) {
      <button
        type="button"
        [attr.aria-label]="dismissLabel()"
        (click)="beginClose()"
        class="absolute end-2 top-2 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="size-3.5" aria-hidden="true">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    }
  `,
})
export class BpdmToastItem {
  readonly record = input.required<ToastRecord>();
  readonly cfg = input.required<PositionConfig>();
  readonly fallbackDuration = input(4000);
  readonly dismissLabel = input("Dismiss");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toast = inject(BpdmToast);

  protected readonly variant = computed(() => this.record().variant ?? "default");
  protected readonly v = computed(() => VARIANTS[this.variant()]);
  protected readonly dur = computed(() => this.record().duration ?? this.fallbackDuration());
  protected readonly sticky = computed(() => {
    const r = this.record();
    return !!r.loading || r.duration === Infinity || r.duration === 0;
  });
  protected readonly dismissible = computed(() => this.record().dismissible ?? !this.record().loading);
  // title-only → centre the icon with the text; a description/action makes it
  // multi-line, so the icon top-aligns to the first line instead.
  protected readonly compact = computed(() => this.record().description == null && !this.record().action);

  protected readonly leadingKind = computed<"loading" | "custom" | "variant" | "none">(() => {
    const r = this.record();
    if (r.loading) return "loading";
    if (r.icon === undefined) return this.v().hasIcon ? "variant" : "none";
    if (r.icon === null) return "none";
    return "custom";
  });

  protected readonly closing = signal(false);
  protected readonly swipe = signal<"none" | "move" | "cancel" | "end">("none");
  protected readonly moveX = signal("0px");
  protected readonly moveY = signal("0px");

  protected readonly role = computed(() => (this.variant() === "error" ? "alert" : "status"));
  protected readonly ariaLive = computed(() => (this.variant() === "error" ? "assertive" : "polite"));

  protected readonly rootClass = computed(() =>
    cn(
      "group pointer-events-auto relative flex w-full gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg transition-shadow hover:shadow-xl",
      this.compact() ? "items-center" : "items-start",
      // accent track on the inline-START edge (logical → correct under RTL)
      "before:absolute before:inset-y-0 before:start-0 before:w-1 before:content-['']",
      this.v().accent,
      !this.sticky() && "before:opacity-40",
    ),
  );
  protected readonly countdownClass = computed(() =>
    cn(
      "absolute inset-y-0 start-0 z-[1] w-1 origin-top group-hover:[animation-play-state:paused]",
      this.v().bar,
    ),
  );
  protected readonly iconSvgClass = computed(() => cn("size-4", this.v().fg));

  protected iconBoxClass(tint: string): string {
    return cn(
      "flex size-8 shrink-0 items-center justify-center rounded-lg",
      !this.compact() && "mt-0.5",
      tint,
    );
  }

  // auto-dismiss timer (pauses on hover / while swiping)
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private exitTimer: ReturnType<typeof setTimeout> | undefined;
  private startedAt = 0;
  private remaining = 0;
  private finalized = false;
  private dragStart: { x: number; y: number } | null = null;
  private dragDelta = 0;

  constructor() {
    // (Re)start the countdown whenever the record changes — e.g. a promise toast
    // upserting from sticky "loading" to an auto-dismissing "success".
    effect(() => {
      this.record(); // track upserts
      untracked(() => {
        this.clearTimer();
        this.remaining = this.dur();
        if (!this.sticky() && !this.closing()) this.startTimer();
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.clearTimer();
      if (this.exitTimer != null) clearTimeout(this.exitTimer);
    });
  }

  private startTimer(): void {
    this.startedAt = Date.now();
    this.timerId = setTimeout(() => this.beginClose(), this.remaining);
  }
  private clearTimer(): void {
    if (this.timerId == null) return;
    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
  }
  private resumeTimer(): void {
    if (this.sticky() || this.closing() || this.timerId != null) return;
    this.startTimer();
  }

  protected onHoverStart(): void {
    this.clearTimer();
  }
  protected onHoverEnd(): void {
    this.resumeTimer();
  }

  // Keyboard parity with hover: a keyboard user reading/acting on a toast
  // (Tab into the action or close button) shouldn't have it vanish mid-read.
  protected onFocusIn(): void {
    this.clearTimer();
  }
  protected onFocusOut(event: FocusEvent): void {
    // `focusout` bubbles, so it also fires when focus merely moves between the
    // toast's own controls — only resume once focus leaves the toast entirely.
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.resumeTimer();
  }

  /** Play the exit animation, then remove the record from the store. */
  protected beginClose(): void {
    if (this.closing()) return;
    this.clearTimer();
    this.closing.set(true);
    this.exitTimer = setTimeout(() => this.finalize(), EXIT_MS);
  }

  private finalize(): void {
    if (this.finalized) return;
    this.finalized = true;
    this.record().onDismiss?.();
    this.toast.dismiss(this.record().id);
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    // ignore the enter animation and the countdown bar (a child element)
    if (event.target !== this.host.nativeElement) return;
    if ((this.closing() || this.swipe() === "end") && event.animationName.startsWith("bpdm-toast-out")) {
      this.finalize();
    }
  }

  // swipe-to-dismiss (direction depends on the dock position)
  protected onPointerDown(event: PointerEvent): void {
    if (this.closing()) return;
    if (!this.dismissible() && this.sticky()) return; // loading toasts can't be swiped
    if ((event.target as HTMLElement).closest("button")) return; // keep buttons clickable
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.clearTimer();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragStart) return;
    const dir = this.cfg().swipe;
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    let delta: number;
    if (dir === "right") delta = Math.max(0, dx);
    else if (dir === "left") delta = Math.min(0, dx);
    else if (dir === "down") delta = Math.max(0, dy);
    else delta = Math.min(0, dy); // up
    this.dragDelta = delta;
    this.swipe.set("move");
    if (dir === "left" || dir === "right") {
      this.moveX.set(`${delta}px`);
      this.moveY.set("0px");
    } else {
      this.moveY.set(`${delta}px`);
      this.moveX.set("0px");
    }
  }

  protected onPointerUp(_event: PointerEvent): void {
    if (!this.dragStart) return;
    this.dragStart = null;
    const dismissed = Math.abs(this.dragDelta) >= SWIPE_THRESHOLD;
    this.dragDelta = 0;
    this.moveX.set("0px");
    this.moveY.set("0px");
    if (dismissed) {
      this.swipe.set("end"); // triggers the exit animation via [data-swipe="end"]
      this.exitTimer = setTimeout(() => this.finalize(), EXIT_MS);
    } else {
      this.swipe.set("cancel"); // springs back
      setTimeout(() => this.swipe.set("none"), EXIT_MS);
      this.resumeTimer();
    }
  }

  protected onAction(action: ToastAction): void {
    action.onClick();
    this.beginClose();
  }
}

// the viewport: render once near the app root
/**
 * Docks toasts to a corner and renders them. Place once near the app root:
 *
 * ```html
 * <bpdm-toaster position="bottom-right" [duration]="4000" />
 * ```
 *
 * Reads the global `BpdmToast` store, so any `inject(BpdmToast).success(...)`
 * from anywhere shows up here. Portals to the CDK overlay container so a
 * transformed ancestor can't clip or offset the fixed viewport.
 */
@Component({
  selector: "bpdm-toaster",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmToastItem],
  template: `
    <ng-template #viewport>
      <!-- region landmark wraps the list; role="region" cannot sit on the <ol> itself
           (it would override the list role and orphan the <li> children). -->
      <div role="region" [attr.aria-label]="msg().regionLabel">
        <ol [class]="viewportClass()">
          @for (t of toasts(); track t.id) {
            <li class="contents">
              <bpdm-toast-item
                [record]="t"
                [cfg]="cfg()"
                [fallbackDuration]="duration()"
                [dismissLabel]="msg().dismiss"
              />
            </li>
          }
        </ol>
      </div>
    </ng-template>
  `,
})
export class BpdmToaster {
  /** Corner the toasts dock to. Default "bottom-right". */
  readonly position = input<ToastPosition>("bottom-right");
  /** Default auto-dismiss in ms; per-toast `duration` overrides. Default 4000. */
  readonly duration = input(4000);
  /** Localizable strings (currently just the close button aria-label). */
  readonly messages = input<Partial<ToastMessages>>({});

  private readonly service = inject(BpdmToast);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tokenMsgs = inject(BPDM_TOAST_MESSAGES, { optional: true }) ?? {};
  private readonly viewportTpl = viewChild.required<TemplateRef<unknown>>("viewport");

  protected readonly toasts = this.service.toasts;
  // DEFAULT ◁ provideBpdmToastMessages() / token ◁ [messages] input.
  protected readonly msg = computed<ToastMessages>(() => ({
    ...DEFAULT_TOAST_MESSAGES,
    ...this.tokenMsgs,
    ...this.messages(),
  }));
  protected readonly cfg = computed(() => POSITIONS[this.position()]);
  protected readonly viewportClass = computed(() =>
    cn(
      "pointer-events-none fixed z-[100] m-0 flex w-[min(24rem,calc(100vw-2rem))] list-none flex-col gap-3 p-4 outline-none",
      this.cfg().viewport,
      this.cfg().col,
    ),
  );

  constructor() {
    afterNextRender(() => {
      const overlayRef = this.overlay.create({
        positionStrategy: this.overlay.position().global(),
        hasBackdrop: false,
        panelClass: "bpdm-toaster-pane",
      });
      overlayRef.attach(new TemplatePortal(this.viewportTpl(), this.vcr));
      this.destroyRef.onDestroy(() => overlayRef.dispose());
    });
  }
}
