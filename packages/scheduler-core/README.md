# @bpdm/scheduler-core

The **framework-agnostic engine** behind the bpdm Scheduler — date/time math, event
layout, a data-source abstraction, and a state store, with **zero UI and zero
framework dependencies**. Build any calendar/scheduler UI on top of it, or use the
pieces on their own.

[![npm version](https://img.shields.io/npm/v/@bpdm/scheduler-core.svg)](https://www.npmjs.com/package/@bpdm/scheduler-core)
[![license](https://img.shields.io/npm/l/@bpdm/scheduler-core.svg)](./LICENSE)

> The headless core of the **bpdm design system**'s scheduler. The React binding
> [`@bpdm/scheduler`](https://www.npmjs.com/package/@bpdm/scheduler) renders on top of
> it; future framework bindings reuse the same engine. See the
> [monorepo overview](https://github.com/bpdm-hq/bpdm-ui).

---

## Features

- **Framework-agnostic** — pure TypeScript, no React and no DOM. Runs in any framework, a worker, or on the server.
- **Event layout** — overlap packing (`packEvents`, `layoutDay`) that positions colliding events into side-by-side columns.
- **Time utilities** — day/week/month math (`startOfWeek`, `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, …) with a configurable week start.
- **Data-source abstraction** — an `InMemoryDataSource` plus a `DataSource` interface, so a UI can switch from client data to fetching a visible range from a server without changing.
- **State store** — `createSchedulerStore` holds the current view, date and selection; subscribe and render.
- **Typed & tested** — every export is TypeScript-first, covered by unit tests.

## Install

```bash
npm install @bpdm/scheduler-core
```

## Usage

```ts
import { createSchedulerStore, InMemoryDataSource, type CalendarEvent } from "@bpdm/scheduler-core";

const events: CalendarEvent[] = [
  { id: "1", title: "Standup", start: new Date("2026-01-05T09:00"), end: new Date("2026-01-05T09:30") },
];

// A data source the UI reads from (swap for a server-backed DataSource later):
const source = new InMemoryDataSource(events);

// Holds the current view, date and selection — subscribe and render:
const store = createSchedulerStore();
```

Most apps use the ready-made React component in
[`@bpdm/scheduler`](https://www.npmjs.com/package/@bpdm/scheduler) rather than wiring
the core by hand.

## License

MIT © [bpdm](https://github.com/bpdm-hq/bpdm-ui)
