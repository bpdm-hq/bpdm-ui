import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardMessages {
  /** Screen-reader word for a positive delta. Default "Increased". */
  increased: string;
  /** Screen-reader word for a negative delta. Default "Decreased". */
  decreased: string;
  /** Screen-reader text for a zero delta. Default "No change". */
  noChange: string;
  /** Appended to the label while `loading`. Default "loading". */
  loading: string;
}

export const DEFAULT_STAT_CARD_MESSAGES: StatCardMessages = {
  increased: "Increased",
  decreased: "Decreased",
  noChange: "No change",
  loading: "loading",
};

export interface StatCardProps {
  label: string;
  /** Pre-formatted value (e.g. "$124,592" or a node). */
  value: React.ReactNode;
  /** Percent change, e.g. 12.5 or -3.2. */
  delta?: number;
  /** Caption next to the delta, e.g. "vs last month". */
  deltaLabel?: string;
  /** When false, an increase is shown as bad (red) — e.g. churn. Default true. */
  positiveIsGood?: boolean;
  icon?: React.ReactNode;
  /** Any CSS color (hex / token) — tints the card background + icon badge. */
  accent?: string;
  /** Show a shimmering skeleton in place of the content (data still loading). */
  loading?: boolean;
  /** BCP 47 locale for formatting the delta number (decimal separator). */
  locale?: string;
  /** Override screen-reader / loading text for i18n. */
  messages?: Partial<StatCardMessages>;
  className?: string;
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden="true">
      <path
        d={up ? "M6 9.5v-7M3 5.5L6 2.5l3 3" : "M6 2.5v7M3 6.5L6 9.5l3-3"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Dashboard KPI / stat card: label, big value, optional percentage delta
 * (green/red by whether the change is good — set `positiveIsGood={false}` for
 * metrics where up is bad, e.g. churn), and an optional icon badge. Pass `accent`
 * (any CSS color) to tint the card + badge. The card is a labelled `role="group"`
 * and the delta carries a screen-reader text alternative (direction is not colour-only).
 */
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  positiveIsGood = true,
  icon,
  accent,
  loading = false,
  locale,
  messages,
  className,
}: StatCardProps) {
  const t = { ...DEFAULT_STAT_CARD_MESSAGES, ...messages };
  const labelId = React.useId();

  if (loading) {
    return (
      <div
        role="group"
        aria-busy="true"
        aria-live="polite"
        aria-label={`${label} ${t.loading}`}
        className={cn(
          "flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm",
          className,
        )}
      >
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const hasDelta = delta !== undefined && !Number.isNaN(delta);
  const up = (delta ?? 0) > 0;
  const neutral = (delta ?? 0) === 0;
  const good = positiveIsGood ? up : !up;
  const deltaColor = neutral
    ? "text-muted-foreground"
    : good
      ? "text-success-strong"
      : "text-destructive-strong";
  const deltaNum = hasDelta ? new Intl.NumberFormat(locale).format(Math.abs(delta as number)) : "";
  // screen-reader alternative: convey the DIRECTION that the arrow/colour show visually
  const deltaSr = neutral
    ? t.noChange
    : `${up ? t.increased : t.decreased} ${deltaNum}%`;

  // soft tint background, NO coloured border (the tint is the only fill)
  const cardStyle: React.CSSProperties = accent
    ? { backgroundColor: `color-mix(in srgb, ${accent} 8%, var(--card))` }
    : {};
  const badgeStyle: React.CSSProperties = accent
    ? { backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }
    : {};

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      style={cardStyle}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl border p-5 text-card-foreground shadow-sm transition-[transform,box-shadow] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:-translate-y-0.5 hover:shadow-md",
        accent ? "border-transparent" : "border-border bg-card",
        className,
      )}
    >
      <div className="min-w-0">
        <p id={labelId} className="m-0 truncate text-sm text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hasDelta && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <span
              role="img"
              aria-label={deltaSr}
              className={cn("inline-flex items-center gap-0.5 font-medium", deltaColor)}
            >
              {!neutral && <Arrow up={up} />}
              <span aria-hidden="true">{neutral ? "0" : deltaNum}%</span>
            </span>
            {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
          </div>
        )}
      </div>

      {icon && (
        <span
          aria-hidden="true"
          style={badgeStyle}
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)] group-hover:scale-110 [&_svg]:size-5",
            !accent && "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
      )}
    </div>
  );
}
