'use client';

import { Tabs, type TabItem } from '@bpdm/ui/tabs';

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-fd-muted-foreground">{children}</p>
);

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview', content: <P>Key metrics and recent activity for your workspace.</P> },
  { value: 'activity', label: 'Activity', content: <P>A chronological feed of deploys, comments, and reviews.</P> },
  { value: 'settings', label: 'Settings', content: <P>Manage members, roles, and integrations.</P> },
];

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-md self-start">{children}</div>;
}

// ── demos ─────────────────────────────────────────────────────────────────────
export function TabsUsageDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" />
    </Box>
  );
}

export function TabsPillDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" variant="pill" />
    </Box>
  );
}

export function TabsFullWidthDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" fullWidth />
    </Box>
  );
}

export function TabsBaselineDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" baseline="content" />
    </Box>
  );
}

const cls = 'size-4';
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Gauge = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="m12 14 4-4M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);
const Activity = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const Cog = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export function TabsIconsDemo() {
  const items: TabItem[] = [
    { value: 'overview', label: 'Overview', icon: <Gauge />, content: <P>Key metrics for your workspace.</P> },
    { value: 'activity', label: 'Activity', icon: <Activity />, content: <P>Deploys, comments, and reviews.</P> },
    { value: 'settings', label: 'Settings', icon: <Cog />, content: <P>Members, roles, and integrations.</P> },
  ];
  return (
    <Box>
      <Tabs items={items} defaultValue="overview" />
    </Box>
  );
}

export function TabsDisabledDemo() {
  const items: TabItem[] = [
    { value: 'overview', label: 'Overview', content: <P>Key metrics for your workspace.</P> },
    { value: 'activity', label: 'Activity', content: <P>Deploys, comments, and reviews.</P> },
    { value: 'settings', label: 'Settings', disabled: true, content: <P>Settings (disabled).</P> },
  ];
  return (
    <Box>
      <Tabs items={items} defaultValue="overview" />
    </Box>
  );
}
