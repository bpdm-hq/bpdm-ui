'use client';

import { useEffect, useState } from 'react';
import { Scheduler, type CalendarEvent, type CreateFormArgs } from '@bpdm/scheduler';
import '@bpdm/scheduler/styles.css';
// The create form below is built entirely from @bpdm/ui — the scheduler itself
// has no UI dependencies; this just shows how you'd wire your own fields in.
import { Input } from '@bpdm/ui/input';
import { Select } from '@bpdm/ui/select';
import { Switch } from '@bpdm/ui/switch';
import { Textarea } from '@bpdm/ui/textarea';
import { Button } from '@bpdm/ui/button';

// A realistic, recurring work calendar generated around the *real* current week,
// so the demo always shows today as today and the visible week is fully populated.
// The date is read on the client after mount (never during SSR) so there's no
// hydration mismatch between the build-time server render and the browser.

function addDays(base: Date, days: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  return x;
}

// Monday of the week containing `d` (weeks start Monday).
function mondayOf(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun … 6 Sat
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  x.setHours(0, 0, 0, 0);
  return x;
}

function at(monday: Date, dayOffset: number, hour: number, minute = 0): Date {
  const x = addDays(monday, dayOffset);
  x.setHours(hour, minute, 0, 0);
  return x;
}

// One realistic week relative to its Monday.
function buildWeek(monday: Date, weekIndex: number): CalendarEvent[] {
  const mon = addDays(monday, weekIndex * 7);
  const wk = `w${weekIndex}`;
  const events: CalendarEvent[] = [];

  // daily rituals, Mon–Fri
  for (let day = 0; day < 5; day++) {
    events.push({ id: `${wk}-su${day}`, title: 'Standup', start: at(mon, day, 9, 30), end: at(mon, day, 9, 45), category: 'blue' });
    events.push({ id: `${wk}-lunch${day}`, title: 'Lunch', start: at(mon, day, 12, 30), end: at(mon, day, 13, 30), category: 'teal' });
  }

  // weekly ceremonies + meetings (with one overlap to show the cascade)
  events.push({ id: `${wk}-plan`, title: 'Sprint planning', start: at(mon, 0, 10), end: at(mon, 0, 11, 30), category: 'amber', location: 'Room Aster', description: 'Plan the sprint backlog and lock the two-week goal.' });
  events.push({ id: `${wk}-1o1`, title: '1:1 · Sofia', start: at(mon, 0, 14), end: at(mon, 0, 14, 45), category: 'violet', location: 'Room Iris', description: 'Weekly check-in and career chat.' });
  events.push({ id: `${wk}-review`, title: 'Design review', start: at(mon, 1, 11), end: at(mon, 1, 12, 30), category: 'teal', location: 'Room Aster', description: 'Walk through the new scheduler UI and gather feedback.' });
  events.push({ id: `${wk}-triage`, title: 'Bug triage', start: at(mon, 1, 11, 15), end: at(mon, 1, 12), category: 'blue' });
  events.push({ id: `${wk}-roadmap`, title: 'Roadmap sync', start: at(mon, 1, 11, 30), end: at(mon, 1, 12, 15), category: 'rose' });
  events.push({ id: `${wk}-focus`, title: 'Focus · deep work', start: at(mon, 2, 14), end: at(mon, 2, 16), category: 'violet' });
  events.push({ id: `${wk}-interview`, title: 'Interview · Frontend', start: at(mon, 2, 10, 30), end: at(mon, 2, 11, 30), category: 'amber' });
  events.push({ id: `${wk}-deploy`, title: 'Deploy window', start: at(mon, 3, 10), end: at(mon, 3, 11, 30), category: 'teal' });
  events.push({ id: `${wk}-analytics`, title: 'Analytics review', start: at(mon, 3, 15), end: at(mon, 3, 16), category: 'amber' });
  events.push({ id: `${wk}-demo`, title: 'Demo', start: at(mon, 4, 11), end: at(mon, 4, 12), category: 'violet' });
  events.push({ id: `${wk}-retro`, title: 'Retro', start: at(mon, 4, 15), end: at(mon, 4, 16), category: 'rose' });

  // a deliberately busy Monday afternoon — so the month "+N more" peek overflows
  // and demonstrates its own internal scroll
  events.push({ id: `${wk}-review2`, title: 'Code review', start: at(mon, 0, 15), end: at(mon, 0, 15, 30), category: 'blue' });
  events.push({ id: `${wk}-vendor`, title: 'Vendor sync', start: at(mon, 0, 16), end: at(mon, 0, 16, 45), category: 'teal' });
  events.push({ id: `${wk}-wrap`, title: 'Day wrap-up', start: at(mon, 0, 17, 15), end: at(mon, 0, 17, 45), category: 'rose' });

  // early and evening items — the grid holds the full day, scroll to reach them
  events.push({ id: `${wk}-early`, title: 'Early review', start: at(mon, 0, 6, 45), end: at(mon, 0, 7, 30), category: 'blue' });
  events.push({ id: `${wk}-oncall`, title: 'On-call handoff', start: at(mon, 3, 20), end: at(mon, 3, 20, 30), category: 'rose' });
  events.push({ id: `${wk}-dinner`, title: 'Team dinner', start: at(mon, 4, 18, 30), end: at(mon, 4, 20), category: 'violet' });

  return events;
}

type ViewType = 'day' | 'week' | 'month';

/**
 * Renders the Scheduler around the real current week. The clock is read after
 * mount (client-only) so the server render and first client paint agree; until
 * then a fixed-height placeholder holds the space to avoid a layout shift.
 */
function LiveInner({ now, view }: { now: Date; view: ViewType }) {
  const monday = mondayOf(now);
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    [-2, -1, 0, 1, 2].flatMap((w) => buildWeek(monday, w)),
  );
  return (
    <div className="not-prose w-full">
      <p className="m-0 mb-2 text-sm text-fd-muted-foreground">
        Drag an event to move or resize it. Keyboard: <kbd>Tab</kbd> to an event, <kbd>Space</kbd> to
        pick it up, arrow keys to move (<kbd>Shift</kbd>+arrows to resize), then <kbd>Space</kbd> to
        drop or <kbd>Esc</kbd> to cancel.
      </p>
      <Scheduler
        events={events}
        defaultDate={now}
        now={now}
        defaultView={view}
        views={['day', 'week', 'month']}
        onEventChange={(changed) =>
          setEvents((prev) => prev.map((e) => (e.id === changed.id ? changed : e)))
        }
      />
    </div>
  );
}

function LiveScheduler({ view, minHeight }: { view: ViewType; minHeight: number }) {
  const [now, setNow] = useState<Date | null>(null);
  // client-only date read after mount — avoids an SSR/first-paint hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);

  if (!now) {
    return <div className="not-prose w-full" style={{ minHeight }} aria-hidden="true" />;
  }
  return <LiveInner now={now} view={view} />;
}

export function SchedulerDemo() {
  return <LiveScheduler view="week" minHeight={680} />;
}

export function SchedulerDayDemo() {
  return <LiveScheduler view="day" minHeight={680} />;
}

export function SchedulerMonthDemo() {
  return <LiveScheduler view="month" minHeight={720} />;
}

// A fully custom create form, built from @bpdm/ui, rendered inside the
// scheduler's own popup. Every field here is the developer's choice — the
// scheduler only supplies the clicked slot + submit/cancel.
const ROOMS = [
  { value: 'Room Aster', label: 'Room Aster' },
  { value: 'Room Iris', label: 'Room Iris' },
  { value: 'Room Lily', label: 'Room Lily' },
  { value: 'Video call', label: 'Video call' },
];

// Start-time dropdown: every 30 minutes across the working day.
const pad2 = (n: number) => String(n).padStart(2, '0');
const TIME_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const mins = 6 * 60 + i * 30; // 06:00 → 20:00
  const value = `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
  const d = new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60);
  return { value, label: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) };
});

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

function CreateForm({ slot, submit, cancel }: CreateFormArgs) {
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('Room Aster');
  const [weekly, setWeekly] = useState(false);
  const [agenda, setAgenda] = useState('');
  // seed the time controls from the clicked slot (day/week clicks carry the exact
  // time; a month click carries the scheduler's createDefaultHour)
  const [start, setStart] = useState(
    () => `${pad2(slot.start.getHours())}:${slot.start.getMinutes() < 30 ? '00' : '30'}`,
  );
  const [duration, setDuration] = useState(
    () => String(Math.max(30, Math.round((slot.end.getTime() - slot.start.getTime()) / 60000))),
  );

  const dayLabel = slot.start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <form
      className="flex min-w-[20rem] flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const [h, m] = start.split(':').map(Number);
        const startAt = new Date(slot.start);
        startAt.setHours(h ?? 9, m ?? 0, 0, 0);
        const endAt = new Date(startAt.getTime() + Number(duration) * 60000);
        submit({
          title: title.trim(),
          start: startAt,
          end: endAt,
          category: 'violet',
          location: room,
          description: `${weekly ? 'Weekly' : 'One-time'}${agenda ? ` · ${agenda}` : ''}`,
          data: { weekly },
        });
      }}
    >
      <p className="m-0 text-sm text-fd-muted-foreground">{dayLabel}</p>
      <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex gap-2">
        <Select options={TIME_OPTIONS} value={start} onValueChange={setStart} placeholder="Start" />
        <Select options={DURATIONS} value={duration} onValueChange={setDuration} placeholder="Length" />
      </div>
      <Select options={ROOMS} value={room} onValueChange={setRoom} placeholder="Room" />
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={weekly} onCheckedChange={setWeekly} />
        Repeat weekly
      </label>
      <Textarea placeholder="Agenda…" value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={3} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" appearance="ghost" size="sm" onClick={cancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Create
        </Button>
      </div>
    </form>
  );
}

function CreateDemoInner({ now }: { now: Date }) {
  const monday = mondayOf(now);
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    [-1, 0, 1].flatMap((w) => buildWeek(monday, w)),
  );

  return (
    <div className="not-prose w-full">
      <Scheduler
        events={events}
        defaultDate={now}
        now={now}
        defaultView="week"
        views={['day', 'week', 'month']}
        onCreate={(event) => {
          // Real recurrence (RRULE) is a core roadmap feature; for the demo we
          // expand a "weekly" event into a few visible occurrences client-side.
          const weekly = (event.data as { weekly?: boolean } | undefined)?.weekly;
          const created = weekly
            ? Array.from({ length: 8 }, (_, k) => ({
                ...event,
                id: `${event.id}-${k}`,
                start: addDays(event.start, k * 7),
                end: addDays(event.end, k * 7),
              }))
            : [event];
          setEvents((prev) => [...prev, ...created]);
        }}
        onEventChange={(changed) =>
          setEvents((prev) => prev.map((e) => (e.id === changed.id ? changed : e)))
        }
        renderCreateForm={(args) => <CreateForm {...args} />}
      />
    </div>
  );
}

export function SchedulerCreateDemo() {
  const [now, setNow] = useState<Date | null>(null);
  // client-only date read after mount — avoids an SSR/first-paint hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNow(new Date()), []);
  if (!now) return <div className="not-prose w-full" style={{ minHeight: 680 }} aria-hidden="true" />;
  return <CreateDemoInner now={now} />;
}
