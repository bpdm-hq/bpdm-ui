# @bpdm/ng-scheduler

An Angular scheduler/calendar for the [bpdm](https://ui.bpdm.dev) design system — day, week and month
views over one shared, framework-agnostic core ([`@bpdm/scheduler-core`](https://www.npmjs.com/package/@bpdm/scheduler-core)).
The Angular twin of [`@bpdm/scheduler`](https://www.npmjs.com/package/@bpdm/scheduler) (React): same
model, same views, same options, same responsive behaviour.

Typed, themeable (via `@bpdm/tokens` CSS variables), accessible (WCAG 2.1 AA), fully internationalizable
and RTL-ready, responsive down to a phone, and dependency-free at the core.

## Install

```bash
pnpm add @bpdm/ng-scheduler
```

Add the stylesheet once (it reads the `@bpdm/tokens` CSS variables, so the four themes and RTL come for
free) — e.g. in `angular.json`:

```json
{
  "styles": ["@bpdm/ng-scheduler/styles.css", "src/styles.css"]
}
```

## Usage

```ts
import { Component } from '@angular/core';
import { BpdmScheduler, type CalendarEvent } from '@bpdm/ng-scheduler';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [BpdmScheduler],
  template: `<bpdm-scheduler [events]="events" defaultView="week" />`,
})
export class CalendarComponent {
  events: CalendarEvent[] = [];
}
```

See the full docs at [ui.bpdm.dev/docs/scheduler](https://docs.ui.bpdm.dev/docs/scheduler).

## License

MIT
