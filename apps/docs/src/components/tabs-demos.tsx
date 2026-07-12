'use client';

import { useState } from 'react';
import { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent, type TabItem } from '@bpdm/ui/tabs';

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-fd-muted-foreground">{children}</p>
);

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview', content: <P>Key metrics and recent activity for your workspace.</P> },
  { value: 'activity', label: 'Activity', content: <P>A chronological feed of deploys, comments, and reviews.</P> },
  { value: 'settings', label: 'Settings', content: <P>Manage members, roles, and integrations.</P> },
];

function Box({ children }: { children: React.ReactNode }) {
  // fill the preview width (tabs are a full-width container — left-aligned tabs,
  // full-width underline + panel), rather than a narrow centered block
  return <div className="w-full self-start">{children}</div>;
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

const MANY: TabItem[] = [
  'Overview', 'Activity', 'Deployments', 'Analytics', 'Members', 'Billing', 'Integrations',
  'Security', 'Notifications', 'Automations', 'Webhooks', 'API Keys', 'Audit Log', 'Advanced',
].map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  content: <P>{label} — settings and details for this section.</P>,
}));

export function TabsScrollableDemo() {
  return (
    <Box>
      <Tabs items={MANY} defaultValue="overview" scrollable ariaLabel="Workspace sections" />
    </Box>
  );
}

export function TabsOrientationDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" orientation="vertical" ariaLabel="Workspace sections" />
    </Box>
  );
}

export function TabsManualDemo() {
  return (
    <Box>
      <Tabs items={ITEMS} defaultValue="overview" activationMode="manual" ariaLabel="Workspace sections" />
    </Box>
  );
}

export function TabsControlledDemo() {
  const [value, setValue] = useState('overview');
  return (
    <Box>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-fd-muted-foreground">Active tab:</span>
        <code className="rounded bg-fd-muted px-1.5 py-0.5 text-xs">{value}</code>
      </div>
      <Tabs items={ITEMS} value={value} onValueChange={setValue} />
    </Box>
  );
}

export function TabsCompositionDemo() {
  return (
    <Box>
      <TabsRoot defaultValue="overview">
        <TabsList aria-label="Workspace sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <P>Key metrics and recent activity for your workspace.</P>
        </TabsContent>
        <TabsContent value="activity">
          <P>A chronological feed of deploys, comments, and reviews.</P>
        </TabsContent>
        <TabsContent value="settings">
          <P>Manage members, roles, and integrations.</P>
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
