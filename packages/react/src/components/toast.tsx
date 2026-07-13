import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

// --- i18n ---
export interface ToastMessages {
  /** Dismiss (X) button aria-label. */
  dismiss: string;
}

export const DEFAULT_TOAST_MESSAGES: ToastMessages = { dismiss: "Dismiss" };

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss after N ms. `Infinity` (or 0) keeps it until dismissed. */
  duration?: number;
  action?: ToastAction;
  /** Override the leading icon; pass `null` to hide it. */
  icon?: React.ReactNode | null;
  /** Show the close button. Default true. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Reuse an id to update an existing toast in place. */
  id?: string;
}

interface ToastRecord extends Omit<ToastOptions, "id"> {
  id: string;
  title: React.ReactNode;
  loading?: boolean;
}

// ── store (module-level, so `toast()` works from anywhere — no hook needed) ──
let records: ToastRecord[] = [];
const listeners = new Set<(r: ToastRecord[]) => void>();
let seq = 0;

const emit = () => listeners.forEach((l) => l(records));

function upsert(record: ToastRecord) {
  const exists = records.some((r) => r.id === record.id);
  records = exists
    ? records.map((r) => (r.id === record.id ? { ...r, ...record } : r))
    : [record, ...records]; // newest first; the viewport orders by position
  emit();
}

function dismiss(id?: string) {
  records = id == null ? [] : records.filter((r) => r.id !== id);
  emit();
}

function create(title: React.ReactNode, opts: ToastOptions, variant: ToastVariant) {
  const id = opts.id ?? `bpdm-toast-${++seq}`;
  upsert({ ...opts, id, title, variant: opts.variant ?? variant });
  return id;
}

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
}

/**
 * Fire a toast from anywhere — `toast("Saved")`, `toast.success(...)`,
 * `toast.error(...)`, `toast.promise(p, {...})`. Render `<Toaster />` once near
 * the app root. No provider/context required.
 */
export const toast = Object.assign(
  (title: React.ReactNode, opts: ToastOptions = {}) => create(title, opts, "default"),
  {
    success: (title: React.ReactNode, opts: ToastOptions = {}) =>
      create(title, opts, "success"),
    error: (title: React.ReactNode, opts: ToastOptions = {}) =>
      create(title, opts, "error"),
    warning: (title: React.ReactNode, opts: ToastOptions = {}) =>
      create(title, opts, "warning"),
    info: (title: React.ReactNode, opts: ToastOptions = {}) =>
      create(title, opts, "info"),
    /** Dismiss one toast by id, or all when called with no argument. */
    dismiss,
    /** Show a loading toast, then resolve it to success/error when the promise settles. */
    promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) {
      const id = `bpdm-toast-${++seq}`;
      upsert({
        id,
        title: messages.loading,
        variant: "default",
        loading: true,
        duration: Infinity,
        dismissible: false,
      });
      promise.then(
        (data) =>
          upsert({
            id,
            loading: false,
            variant: "success",
            duration: undefined,
            dismissible: true,
            title:
              typeof messages.success === "function"
                ? messages.success(data)
                : messages.success,
          }),
        (error) =>
          upsert({
            id,
            loading: false,
            variant: "error",
            duration: undefined,
            dismissible: true,
            title:
              typeof messages.error === "function"
                ? messages.error(error)
                : messages.error,
          }),
      );
      return promise;
    },
  },
);

// ── per-variant look (icon + colored left accent + subtle icon tint) ──
const VARIANTS: Record<
  ToastVariant,
  {
    Icon: React.ComponentType<{ className?: string }> | null;
    fg: string;
    accent: string; // faint full-height track (::before)
    bar: string; // bright countdown fill
    tint: string;
  }
> = {
  default: { Icon: null, fg: "", accent: "before:bg-border", bar: "bg-border", tint: "" },
  success: {
    Icon: CircleCheck,
    fg: "text-success",
    accent: "before:bg-success",
    bar: "bg-success",
    tint: "bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
  },
  error: {
    Icon: CircleX,
    fg: "text-destructive",
    accent: "before:bg-destructive",
    bar: "bg-destructive",
    tint: "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)]",
  },
  warning: {
    Icon: TriangleAlert,
    fg: "text-warning",
    accent: "before:bg-warning",
    bar: "bg-warning",
    tint: "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  },
  info: {
    Icon: Info,
    fg: "text-info",
    accent: "before:bg-info",
    bar: "bg-info",
    tint: "bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
  },
};

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const POSITIONS: Record<
  ToastPosition,
  {
    viewport: string;
    col: string;
    swipe: "right" | "left" | "up" | "down";
    in: string;
    out: string;
  }
> = {
  "top-left": { viewport: "top-0 left-0 sm:top-4 sm:left-4 items-start", col: "flex-col", swipe: "left", in: "bpdm-toast-in-left", out: "bpdm-toast-out-left" },
  "top-center": { viewport: "top-0 left-1/2 -translate-x-1/2 sm:top-4 items-center", col: "flex-col", swipe: "up", in: "bpdm-toast-in-top", out: "bpdm-toast-out-top" },
  "top-right": { viewport: "top-0 right-0 sm:top-4 sm:right-4 items-end", col: "flex-col", swipe: "right", in: "bpdm-toast-in-right", out: "bpdm-toast-out-right" },
  "bottom-left": { viewport: "bottom-0 left-0 sm:bottom-4 sm:left-4 items-start", col: "flex-col-reverse", swipe: "left", in: "bpdm-toast-in-left", out: "bpdm-toast-out-left" },
  "bottom-center": { viewport: "bottom-0 left-1/2 -translate-x-1/2 sm:bottom-4 items-center", col: "flex-col-reverse", swipe: "down", in: "bpdm-toast-in-bottom", out: "bpdm-toast-out-bottom" },
  "bottom-right": { viewport: "bottom-0 right-0 sm:bottom-4 sm:right-4 items-end", col: "flex-col-reverse", swipe: "right", in: "bpdm-toast-in-right", out: "bpdm-toast-out-right" },
};

export interface ToasterProps {
  /** Corner the toasts dock to. Default "bottom-right". */
  position?: ToastPosition;
  /** Default auto-dismiss in ms. Default 4000. */
  duration?: number;
  /** Override the translatable strings (currently just the dismiss button label). */
  messages?: Partial<ToastMessages>;
  className?: string;
}

/** Render once near the app root. Listens to the global store and renders toasts. */
export function Toaster({
  position = "bottom-right",
  duration = 4000,
  messages,
  className,
}: ToasterProps) {
  const [list, setList] = React.useState<ToastRecord[]>(records);
  React.useEffect(() => {
    listeners.add(setList);
    setList(records);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  const cfg = POSITIONS[position];
  const dismissLabel = messages?.dismiss ?? DEFAULT_TOAST_MESSAGES.dismiss;

  return (
    <ToastPrimitive.Provider duration={duration} swipeDirection={cfg.swipe}>
      {list.map((t) => (
        <ToastItem
          key={t.id}
          record={t}
          cfg={cfg}
          fallbackDuration={duration}
          dismissLabel={dismissLabel}
        />
      ))}
      <ToastPrimitive.Viewport
        className={cn(
          "pointer-events-none fixed z-[100] m-0 flex w-[min(24rem,calc(100vw-2rem))] list-none flex-col gap-3 p-4 outline-none",
          cfg.viewport,
          cfg.col,
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

function ToastItem({
  record,
  cfg,
  fallbackDuration,
  dismissLabel,
}: {
  record: ToastRecord;
  cfg: (typeof POSITIONS)[ToastPosition];
  fallbackDuration: number;
  dismissLabel: string;
}) {
  const v = VARIANTS[record.variant ?? "default"];
  const sticky =
    record.loading || record.duration === Infinity || record.duration === 0;
  const dismissible = record.dismissible ?? !record.loading;
  const dur = record.duration ?? fallbackDuration;

  // a title-only toast centres the icon with the text; once there's a
  // description (or action) the content is multi-line, so the icon top-aligns
  // to the first line instead.
  const compact = record.description == null && !record.action;
  const iconBox = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-lg",
    !compact && "mt-0.5",
  );

  const leading = record.loading ? (
    <span className={cn(iconBox, "bg-muted")}>
      <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
    </span>
  ) : record.icon !== undefined ? (
    record.icon && <span className={cn(iconBox, v.tint)}>{record.icon}</span>
  ) : v.Icon ? (
    <span className={cn(iconBox, v.tint)}>
      <v.Icon className={cn("size-4", v.fg)} />
    </span>
  ) : null;

  return (
    <ToastPrimitive.Root
      data-bpdm-toast=""
      // error → assertive live region (`foreground`); every other variant is
      // polite (`background`) so it announces without stealing focus.
      type={(record.variant ?? "default") === "error" ? "foreground" : "background"}
      duration={sticky ? Infinity : dur}
      onOpenChange={(open) => {
        if (!open) {
          record.onDismiss?.();
          dismiss(record.id);
        }
      }}
      style={
        { "--bpdm-toast-in": cfg.in, "--bpdm-toast-out": cfg.out } as React.CSSProperties
      }
      className={cn(
        "group pointer-events-auto relative flex w-full gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg transition-shadow hover:shadow-xl",
        compact ? "items-center" : "items-start",
        "before:absolute before:inset-y-0 before:start-0 before:w-1 before:content-['']",
        v.accent,
        !sticky && "before:opacity-40",
      )}
    >
      {!sticky && (
        <span
          data-bpdm-countdown=""
          aria-hidden
          style={{ animation: `bpdm-toast-countdown ${dur}ms linear forwards` }}
          className={cn(
            "absolute inset-y-0 start-0 z-[1] w-1 origin-top group-hover:[animation-play-state:paused]",
            v.bar,
          )}
        />
      )}
      {leading}
      <div className="min-w-0 flex-1">
        <ToastPrimitive.Title className="text-sm font-semibold">
          {record.title}
        </ToastPrimitive.Title>
        {record.description != null && (
          <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            {record.description}
          </ToastPrimitive.Description>
        )}
        {record.action && (
          <div className="mt-2.5">
            <ToastPrimitive.Action asChild altText={record.action.label}>
              <button
                onClick={record.action.onClick}
                className="inline-flex h-7 items-center rounded-md border border-border bg-transparent px-2.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {record.action.label}
              </button>
            </ToastPrimitive.Action>
          </div>
        )}
      </div>
      {dismissible && (
        <ToastPrimitive.Close
          aria-label={dismissLabel}
          className="absolute end-2 top-2 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <X className="size-3.5" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}
