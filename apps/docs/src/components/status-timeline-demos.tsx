'use client';

import { StatusTimeline, type TimelineItem } from '@bpdm/ui/status-timeline';
import { Tabs, type TabItem } from '@bpdm/ui/tabs';
import { Badge } from '@bpdm/ui/badge';
import { Button } from '@bpdm/ui/button';

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-sm">{children}</div>;
}

// Stable-width shell so the Tabs bar doesn't resize as the content changes.
function WideBox({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl">{children}</div>;
}

// Centres the timeline compactly (to its own width) inside a full-width panel.
function Center({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-fit py-1">{children}</div>;
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
  { value: 'left', label: 'Left', content: <Center><StatusTimeline items={DEPLOY} align="left" /></Center> },
  { value: 'right', label: 'Right', content: <Center><StatusTimeline items={DEPLOY} align="right" /></Center> },
  { value: 'alternate', label: 'Alternate', content: <Center><StatusTimeline items={DEPLOY} align="alternate" /></Center> },
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
      <Center>
        <StatusTimeline items={DATED} />
      </Center>
    </WideBox>
  );
}

// Custom markers (icon + colour) + clickable steps
function Rocket() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4.5 16.5 3 21l4.5-1.5M9 15l6-6M14 4c3 0 6 3 6 6-3 4-8 6-8 6l-4-4s2-5 6-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Target() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
const RELEASES: TimelineItem[] = [
  { id: 'plan', title: 'Planned', color: '#8b5cf6', icon: <Target />, timestamp: 'Q1' },
  { id: 'build', title: 'In development', status: 'current', timestamp: 'now' },
  { id: 'beta', title: 'Beta launched', color: '#0ea5e9', icon: <Rocket />, timestamp: 'Q2' },
  { id: 'ga', title: 'General availability', status: 'pending', timestamp: 'soon' },
];

export function StatusTimelineCustomDemo() {
  return (
    <Box>
      <StatusTimeline items={RELEASES} onItemClick={(item) => console.log('clicked', item.id)} />
    </Box>
  );
}

// Horizontal orientation (align top / bottom / alternate) via our own Tabs
const ROADMAP: TimelineItem[] = [
  { id: 'discovery', title: 'Discovery', status: 'complete', timestamp: 'Q1' },
  { id: 'design', title: 'Design', status: 'complete', timestamp: 'Q2' },
  { id: 'build', title: 'Build', status: 'current', timestamp: 'Q3' },
  { id: 'launch', title: 'Launch', status: 'pending', timestamp: 'Q4' },
];

const HORIZONTAL_TABS: TabItem[] = [
  { value: 'top', label: 'Top', content: <StatusTimeline layout="horizontal" align="top" items={ROADMAP} /> },
  { value: 'bottom', label: 'Bottom', content: <StatusTimeline layout="horizontal" align="bottom" items={ROADMAP} /> },
  { value: 'alternate', label: 'Alternate', content: <StatusTimeline layout="horizontal" align="alternate" items={ROADMAP} /> },
];

export function StatusTimelineHorizontalDemo() {
  return (
    <div className="w-full">
      <Tabs items={HORIZONTAL_TABS} defaultValue="top" className="w-full self-start" listClassName="mb-3" />
    </div>
  );
}

// Fully custom shell — renderMarker + renderContent + renderOpposite (neutral dev workflow)
function GitBranch() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="6" cy="18" r="2" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="7" r="2" />
      <path d="M6 8v8M18 9a9 9 0 0 1-9 9" strokeLinecap="round" />
    </svg>
  );
}
function Search() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Event = {
  id: string;
  user: string;
  title: string;
  status: TimelineItem['status'];
  date: string;
  time: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  details?: string[];
  link?: string;
};

const EVENTS: Event[] = [
  {
    id: 'repo', user: 'JD', title: 'Repository created', status: 'complete', date: 'Oct 15', time: '10:30',
    color: '#3b82f6', icon: <GitBranch />,
    description: 'Initialised the monorepo and CI pipeline.',
    details: ['README + license', 'CI workflow', 'Lint & format config'],
  },
  {
    id: 'deploy', user: 'SY', title: 'Deployed to staging', status: 'complete', date: 'Oct 15', time: '10:32',
    color: '#22c55e', icon: <Rocket />,
    description: 'First build shipped to the staging environment.',
  },
  {
    id: 'qa', user: 'MK', title: 'QA review', status: 'current', date: 'Oct 16', time: '14:15',
    color: '#f97316', icon: <Search />,
    description: 'Running the acceptance checklist before release.',
    link: 'PR #482',
  },
  {
    id: 'ga', user: 'JD', title: 'Production release', status: 'pending', date: 'Oct 18', time: '11:20',
    color: '#84cc16', icon: <CheckIcon />,
    description: 'Awaiting final sign-off from the release owner.',
  },
];

export function StatusTimelineRichDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <StatusTimeline
        items={EVENTS}
        align="alternate"
        renderOpposite={(e) => (
          <div>
            <p className="font-medium text-fd-foreground">{(e as Event).date}</p>
            <p className="text-xs text-fd-muted-foreground">{(e as Event).time}</p>
          </div>
        )}
        renderMarker={(e) => (
          <span
            className="flex size-11 items-center justify-center rounded-full text-white shadow-lg"
            style={{ backgroundColor: (e as Event).color }}
          >
            {(e as Event).icon}
          </span>
        )}
        renderContent={(item) => {
          const e = item as Event;
          return (
            <div className="rounded-xl border border-fd-border bg-fd-card p-4 text-left shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {e.user}
                </span>
                <span className="font-semibold text-fd-foreground">{e.title}</span>
                {e.status === 'current' && <Badge variant="warning" appearance="soft" dot>In progress</Badge>}
              </div>
              <p className="text-sm leading-relaxed text-fd-muted-foreground">{e.description}</p>
              {e.details && (
                <ul className="mt-2 space-y-1">
                  {e.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-fd-muted-foreground">
                      <span className="size-1.5 rounded-full bg-fd-muted-foreground/50" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              {e.link && (
                <div className="mt-3">
                  <Button variant="secondary" appearance="outline" size="sm">
                    {e.link}
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
