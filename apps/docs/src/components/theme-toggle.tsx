'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * Single-icon theme toggle: shows the Sun in light mode and the Moon in dark
 * mode, swapping (with a soft cross-fade/rotate) on click. Fumadocs' built-in
 * `light-dark` switch keeps BOTH icons in one pill — we want just one.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={[
        'relative inline-flex size-9 items-center justify-center rounded-full',
        'border border-fd-border text-fd-muted-foreground',
        'transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground cursor-pointer',
        className ?? '',
      ].join(' ')}
    >
      <Sun
        className={`size-4.5 transition-all duration-300 ${
          isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
        }`}
        fill="currentColor"
      />
      <Moon
        className={`absolute size-4.5 transition-all duration-300 ${
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
        fill="currentColor"
      />
    </button>
  );
}
