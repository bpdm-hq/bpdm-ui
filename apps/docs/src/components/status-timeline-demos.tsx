'use client';

import { StatusTimeline, type TimelineItem } from '@bpdm/ui/status-timeline';
import { Tabs, type TabItem } from '@bpdm/ui/tabs';

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-sm">{children}</div>;
}

function WideBox({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-lg">{children}</div>;
}

// ── demos (neutral deploy / CI lifecycle) ─────────────────────────────────────
const DEPLOY: TimelineItem[] = [
  { title: 'Pushed to main', status: 'complete', timestamp: '09:41' },
  { title: 'CI checks passed', status: 'complete', timestamp: '09:46' },
  { title: 'Deploying to staging', status: 'current', timestamp: '09:47' },
  { title: 'Promote to production', status: 'pending' },
];

export function StatusTimelineUsageDemo() {
  return (
    <Box>
      <StatusTimeline items={DEPLOY} />
    </Box>
  );
}

const STATUSES: TimelineItem[] = [
  { title: 'Complete', status: 'complete', timestamp: 'done', description: 'A finished step.' },
  { title: 'Current', status: 'current', timestamp: 'now', description: 'In progress (the marker pulses).' },
  { title: 'Pending', status: 'pending', description: 'Not started yet.' },
  { title: 'Failed', status: 'failed', timestamp: 'error', description: 'Something went wrong.' },
];

export function StatusTimelineStatusesDemo() {
  return (
    <Box>
      <StatusTimeline items={STATUSES} />
    </Box>
  );
}

const FAILED: TimelineItem[] = [
  { title: 'Build', status: 'complete', timestamp: '11:02' },
  { title: 'Unit tests', status: 'complete', timestamp: '11:05' },
  { title: 'E2E tests', status: 'failed', timestamp: '11:09', description: '2 specs failed — pipeline stopped.' },
  { title: 'Deploy', status: 'pending' },
];

export function StatusTimelineFailureDemo() {
  return (
    <Box>
      <StatusTimeline items={FAILED} />
    </Box>
  );
}

// Alignment — dogfood our own Tabs to switch between left / right / alternate
const ALIGN_TABS: TabItem[] = [
  { value: 'left', label: 'Left', content: <StatusTimeline items={DEPLOY} align="left" /> },
  { value: 'right', label: 'Right', content: <StatusTimeline items={DEPLOY} align="right" /> },
  { value: 'alternate', label: 'Alternate', content: <StatusTimeline items={DEPLOY} align="alternate" /> },
];

export function StatusTimelineAlignDemo() {
  return (
    <WideBox>
      <Tabs items={ALIGN_TABS} defaultValue="alternate" className="w-full self-start" listClassName="mb-2" />
    </WideBox>
  );
}

// Opposite — a date across the line from each step
const DATED: TimelineItem[] = [
  { title: 'Ordered', status: 'complete', opposite: '15 Oct, 10:30' },
  { title: 'Processing', status: 'complete', opposite: '15 Oct, 14:00' },
  { title: 'Shipped', status: 'current', opposite: '15 Oct, 16:15' },
  { title: 'Delivered', status: 'pending', opposite: '16 Oct, 10:00' },
];

export function StatusTimelineOppositeDemo() {
  return (
    <WideBox>
      <StatusTimeline items={DATED} />
    </WideBox>
  );
}
