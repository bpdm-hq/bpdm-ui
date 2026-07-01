import * as React from "react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden>
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
 * (any CSS color) to tint the card + badge.
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
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        aria-label={`${label} loading`}
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
      ? "text-success"
      : "text-destructive";

  // soft tint background, NO coloured border (the tint is the only fill)
  const cardStyle: React.CSSProperties = accent
    ? { backgroundColor: `color-mix(in srgb, ${accent} 8%, var(--card))` }
    : {};
  const badgeStyle: React.CSSProperties = accent
    ? { backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }
    : {};

  return (
    <div
      style={cardStyle}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl border p-5 text-card-foreground shadow-sm transition-[transform,box-shadow] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:-translate-y-0.5 hover:shadow-md",
        accent ? "border-transparent" : "border-border bg-card",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hasDelta && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <span className={cn("inline-flex items-center gap-0.5 font-medium", deltaColor)}>
              {!neutral && <Arrow up={up} />}
              {neutral ? "0" : Math.abs(delta as number)}%
            </span>
            {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
          </div>
        )}
      </div>

      {icon && (
        <span
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
