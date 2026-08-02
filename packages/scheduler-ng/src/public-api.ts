// @bpdm/ng-scheduler — public API. Every export here is part of the supported surface.

export { BpdmScheduler } from "./lib/scheduler";

export { defaultMessages, type SchedulerMessages } from "./lib/messages";
export type { SlotSelection, CreateEventInput, CreateFormContext } from "./lib/types";

// the core model, re-exported so consumers import a single package
export {
  InMemoryDataSource,
  type CalendarEvent,
  type Resource,
  type ViewType,
  type DataSource,
} from "@bpdm/scheduler-core";
