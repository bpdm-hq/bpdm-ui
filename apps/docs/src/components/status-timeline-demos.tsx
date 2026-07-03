'use client';

import { useState } from 'react';
import { StatusTimeline, type TimelineItem } from '@bpdm/ui/status-timeline';
import { Tabs, type TabItem } from '@bpdm/ui/tabs';
import { Badge } from '@bpdm/ui/badge';
import { Button } from '@bpdm/ui/button';
import { ProgressBar } from '@bpdm/ui/progress';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

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

// Interactive — step-based onboarding with progress + state (dogfoods our ProgressBar)
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 text-success" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TickIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ONBOARDING = [
  { id: 1, label: 'Account created' },
  { id: 2, label: 'Email verified' },
  { id: 3, label: 'Profile completed' },
  { id: 4, label: 'Team invited' },
  { id: 5, label: 'First project created' },
];

export function StatusTimelineInteractiveDemo() {
  const [completed, setCompleted] = useState<number[]>([1]);
  const [current, setCurrent] = useState(2);
  const total = ONBOARDING.length;
  const done = completed.length === total;

  const statusOf = (id: number) =>
    completed.includes(id) ? 'completed' : id === current ? 'current' : 'pending';
  const complete = (id: number) => {
    if (id !== current) return;
    setCompleted((c) => [...c, id]);
    setCurrent((c) => c + 1);
  };
  const reset = () => {
    setCompleted([1]);
    setCurrent(2);
  };

  const items: TimelineItem[] = ONBOARDING.map((s) => ({
    id: s.id,
    status: statusOf(s.id) === 'completed' ? 'complete' : statusOf(s.id) === 'current' ? 'current' : 'pending',
  }));

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-fd-foreground">Onboarding progress</h3>
          <p className="text-sm text-fd-muted-foreground">
            {completed.length} of {total} steps completed
          </p>
        </div>
        <Button variant="secondary" appearance="outline" size="sm" onClick={reset}>
          <RefreshIcon />
          Reset
        </Button>
      </div>

      <div className="my-4">
        <ProgressBar value={completed.length} max={total} variant="success" />
      </div>

      <StatusTimeline
        items={items}
        renderMarker={(item) => {
          const id = item.id as number;
          const st = statusOf(id);
          if (st === 'completed')
            return (
              <span className="grid size-7 place-items-center rounded-full bg-success text-success-foreground [&_svg]:size-3.5">
                <TickIcon />
              </span>
            );
          if (st === 'current')
            return (
              <button
                type="button"
                onClick={() => complete(id)}
                aria-label={`Complete step ${id}`}
                className="grid size-7 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm ring-4 ring-primary/20 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {id}
              </button>
            );
          return (
            <span className="grid size-7 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {id}
            </span>
          );
        }}
        renderContent={(item) => {
          const id = item.id as number;
          const st = statusOf(id);
          const step = ONBOARDING.find((s) => s.id === id)!;
          return (
            <div
              className={cx(
                'rounded-lg px-3 py-2 transition-colors',
                st === 'completed' && 'bg-success/10',
                st === 'current' && 'bg-primary/10',
                st === 'pending' && 'opacity-60',
              )}
            >
              <p
                className={cx(
                  'text-sm font-medium',
                  st === 'completed' && 'text-success line-through',
                  st === 'current' && 'text-fd-foreground',
                  st === 'pending' && 'text-fd-muted-foreground',
                )}
              >
                {step.label}
              </p>
              {st === 'current' && (
                <p className="mt-0.5 text-xs text-fd-muted-foreground">Click the marker to complete</p>
              )}
            </div>
          );
        }}
      />

      {done && (
        <div className="mt-4 flex flex-col items-center gap-1 rounded-lg border border-success/30 bg-success/10 p-4 text-center">
          <CheckCircleIcon />
          <p className="font-semibold text-success">Onboarding complete!</p>
          <p className="text-sm text-fd-muted-foreground">You&apos;ve finished every step.</p>
        </div>
      )}
    </div>
  );
}
