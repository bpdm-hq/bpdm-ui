export { Scheduler } from "./scheduler";
export type { SchedulerProps } from "./scheduler";
export type { SlotSelection, CreateEventInput, CreateFormArgs } from "./types";

export { defaultMessages } from "./messages";
export type { SchedulerMessages } from "./messages";

// Re-export the core building blocks consumers most often need.
export { InMemoryDataSource } from "@bpdm/scheduler-core";
export type { CalendarEvent, Resource, ViewType, DataSource } from "@bpdm/scheduler-core";
