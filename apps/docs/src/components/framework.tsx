'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Select } from '@bpdm/ui/select';

export interface Framework {
  id: string;
  label: string;
}

/**
 * The single source of truth for which frameworks the docs cover. Scales to any
 * number: to add Vue, React Native, Svelte, etc. later, add one entry here and
 * author a matching `<Tab value="...">` in the code examples. Nothing else is
 * hardcoded, so the selector and every synced code block grow automatically.
 */
export const FRAMEWORKS: Framework[] = [
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
];

// Shape the registry once for the @bpdm/ui Select ({ value, label }).
const FRAMEWORK_OPTIONS = FRAMEWORKS.map((f) => ({ value: f.id, label: f.label }));

const DEFAULT = FRAMEWORKS[0].id;
const STORAGE_KEY = 'bpdm-docs-framework';

function normalize(id: string | null | undefined): string {
  return FRAMEWORKS.some((f) => f.id === id) ? (id as string) : DEFAULT;
}

export function frameworkLabel(id: string): string {
  return FRAMEWORKS.find((f) => f.id === id)?.label ?? id;
}

interface FrameworkContextValue {
  framework: string;
  setFramework: (id: string) => void;
}

const FrameworkContext = createContext<FrameworkContextValue | null>(null);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  // SSR and first paint use the default; the stored choice is applied after
  // mount (reads window), which keeps the server and client markup in sync.
  const [framework, setFrameworkState] = useState<string>(DEFAULT);

  useEffect(() => {
    let initial: string | null = null;
    try {
      initial = new URL(window.location.href).searchParams.get('framework');
    } catch {
      /* ignore */
    }
    if (!FRAMEWORKS.some((f) => f.id === initial)) {
      try {
        initial = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    // Client-only hydration from URL/localStorage after mount keeps SSR and the
    // first client render identical, so this one setState in an effect is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrameworkState(normalize(initial));
  }, []);

  const setFramework = useCallback((id: string) => {
    const next = normalize(id);
    setFrameworkState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('framework', next);
      window.history.replaceState(null, '', url.toString());
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <FrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework(): FrameworkContextValue {
  const ctx = useContext(FrameworkContext);
  // Safe fallback if a component renders outside the provider.
  return ctx ?? { framework: DEFAULT, setFramework: () => {} };
}

/**
 * The global framework picker. A native select, so it is fully accessible and
 * scales to any number of frameworks with no extra work. Shown in the docs
 * header, it always tells the reader which framework they are viewing and lets
 * them switch everything (every code example follows) in one place.
 */
export function FrameworkPicker({ className = '' }: { className?: string }) {
  const { framework, setFramework } = useFramework();
  // Dogfood the design system's own Select: fully styled, themeable and
  // accessible (no native-control quirks), and it shows off the component.
  return (
    <Select
      size="sm"
      aria-label="Framework for code examples"
      options={FRAMEWORK_OPTIONS}
      value={framework}
      onValueChange={setFramework}
      className={className}
    />
  );
}
