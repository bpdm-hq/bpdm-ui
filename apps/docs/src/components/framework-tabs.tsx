'use client';

import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Tab as FdTab,
  Tabs as FdTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import { frameworkLabel, useFramework } from './framework';

// Re-export the extras so MDX files that pull them from this module still work.
export { TabsContent, TabsList, TabsTrigger };

interface TabLike {
  value?: string;
  children?: ReactNode;
}

/**
 * Drop-in for Fumadocs `Tabs`. When `groupId="framework"`, the visible example
 * is driven by the global framework picker (see `./framework`), so one control
 * switches every code block on the page and the reader always knows which
 * framework they are seeing. Any other `groupId` (e.g. the Web Components page's
 * multi-stack tabs) falls through to the normal Fumadocs tabs untouched.
 */
export function Tabs({
  groupId,
  items,
  children,
  ...props
}: {
  groupId?: string;
  items?: string[];
  children?: ReactNode;
  [key: string]: unknown;
}) {
  if (groupId === 'framework') {
    return <FrameworkTabs items={items}>{children}</FrameworkTabs>;
  }
  return (
    <FdTabs items={items} {...props}>
      {children}
    </FdTabs>
  );
}

export function Tab(props: ComponentProps<typeof FdTab>) {
  return <FdTab {...props} />;
}

function FrameworkTabs({ items, children }: { items?: string[]; children?: ReactNode }) {
  const { framework } = useFramework();
  const label = frameworkLabel(framework);

  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabLike>[];

  // Match the tab by its `value`, else by the framework's position in `items`.
  let active = tabs.find((t) => t.props.value === label);
  if (!active && items) {
    const idx = items.indexOf(label);
    if (idx >= 0 && tabs[idx]) active = tabs[idx];
  }
  // Graceful fallback: a framework without an example yet shows the first one.
  if (!active) active = tabs[0];

  return <div className="my-4">{active ? active.props.children : null}</div>;
}
