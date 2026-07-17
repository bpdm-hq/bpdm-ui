'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Check, Palette } from 'lucide-react';

/** `false` during SSR + the first client render, `true` thereafter — without a
 *  state-in-effect write. Lets us defer theme-dependent UI (the active check) to
 *  the client and avoid a hydration mismatch. */
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

const THEMES = [
  { value: 'paper', label: 'Paper', mode: 'Light' },
  { value: 'mist', label: 'Mist', mode: 'Light' },
  { value: 'charcoal', label: 'Charcoal', mode: 'Dark' },
  { value: 'slate', label: 'Slate', mode: 'Dark' },
] as const;

const DARK = new Set(['charcoal', 'slate']);

/** Persist the coarse light/dark mode to a cookie shared across *.bpdm.dev so the
 *  marketing site and docs stay in sync. Written only on an explicit user choice
 *  (not defaults), scoped to the apex domain in prod and host-only on localhost. */
const writeModeCookie = (theme: string) => {
  try {
    const mode = DARK.has(theme) ? 'dark' : 'light';
    const onBpdm = /(^|\.)bpdm\.dev$/.test(location.hostname);
    document.cookie =
      `bpdm-mode=${mode}; path=/; max-age=31536000; SameSite=Lax` +
      (onBpdm ? '; domain=.bpdm.dev' : '');
  } catch {
    /* cookies unavailable */
  }
};

/**
 * Theme selector — the four @bpdm/ui themes (2 light, 2 dark). next-themes sets
 * `data-theme` on <html> (tokens react to it); we mirror the `.dark` class here
 * so Fumadocs' chrome + Shiki code + Tailwind `dark:` switch with the theme too.
 */
export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);

  // next-themes only sets data-theme — keep the dark-mode class in sync with it.
  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle('dark', DARK.has(theme));
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const current = mounted ? (theme ?? 'paper') : 'paper';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Select theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <Palette className="size-4.5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-fd-border bg-fd-popover p-1 shadow-lg"
        >
          <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-fd-muted-foreground">
            Theme
          </p>
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="menuitemradio"
              aria-checked={current === t.value}
              onClick={() => {
                setTheme(t.value);
                writeModeCookie(t.value);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <span
                aria-hidden
                data-theme={t.value}
                style={{
                  background:
                    'linear-gradient(135deg, var(--background) 50%, var(--muted) 50%)',
                  borderColor: 'color-mix(in oklab, var(--foreground) 22%, transparent)',
                }}
                className="size-4 shrink-0 rounded-full border"
              />
              <span className="flex-1 text-start">{t.label}</span>
              <span className="text-[11px] text-fd-muted-foreground">{t.mode}</span>
              {current === t.value && <Check className="size-3.5 text-fd-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
