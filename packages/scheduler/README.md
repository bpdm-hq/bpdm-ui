# @bpdm/scheduler

A themeable, accessible **React scheduler / calendar** component — day, week, work-week,
month, timeline, agenda and year views, event overlap layout, client- or server-side
data, and full internationalization. Built on the framework-agnostic
[`@bpdm/scheduler-core`](https://www.npmjs.com/package/@bpdm/scheduler-core).

[![npm version](https://img.shields.io/npm/v/@bpdm/scheduler.svg)](https://www.npmjs.com/package/@bpdm/scheduler)
[![license](https://img.shields.io/npm/l/@bpdm/scheduler.svg)](./LICENSE)

> Part of the **bpdm design system** — it reads the same design tokens as the rest of
> [bpdm/ui](https://github.com/bpdm-hq/bpdm-ui), so it themes with your app out of the box.

---

## Features

- **Every view** — `day`, `week`, `workWeek`, `month`, `timeline`, `agenda`, `year`, switchable from the toolbar.
- **Event layout** — overlapping events are packed into side-by-side columns automatically.
- **Client or server data** — pass `events` for in-memory data, or a `dataSource` that fetches only the visible range from your backend.
- **Internationalized** — every string is overridable via `messages`, with `locale`-aware date formatting; RTL-friendly.
- **Configurable grid** — day start/end hours, initial scroll position, week start day, and a scrollable max height.
- **Interaction hooks** — `onEventClick`, slot selection and event creation, or bring your own dialog.
- **Themeable & accessible** — semantic CSS variables, keyboard support, and `prefers-reduced-motion` respected.
- **SSR-friendly** — inject `now` for deterministic server rendering.

## Install

```bash
npm install @bpdm/scheduler
```

`react` and `react-dom` (18 or 19) are peer dependencies.

## Usage

```tsx
import { Scheduler, type CalendarEvent } from "@bpdm/scheduler";
import "@bpdm/scheduler/styles.css";

const events: CalendarEvent[] = [
  { id: "1", title: "Standup", start: new Date("2026-01-05T09:00"), end: new Date("2026-01-05T09:30") },
  { id: "2", title: "Design review", start: new Date("2026-01-05T14:00"), end: new Date("2026-01-05T15:00") },
];

export function App() {
  return <Scheduler events={events} defaultView="week" weekStartsOn={1} />;
}
```

For server data, pass a `dataSource` instead of `events` — the scheduler requests only
the range each view needs.

## License

MIT © [bpdm](https://github.com/bpdm-hq/bpdm-ui)
