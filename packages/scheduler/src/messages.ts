/** Every user-facing string — override any subset for i18n via the `messages` prop. */
export interface SchedulerMessages {
  today: string;
  previous: string;
  next: string;
  day: string;
  week: string;
  month: string;
  agenda: string;
  noEvents: string;
  close: string;
  back: string;
  createTitle: string;
  /** aria-roledescription for an event that can be moved/resized. */
  eventAdjustable: string;
  /** Screen-reader announcement prefix after a move (followed by the new time range). */
  movedTo: string;
  /** Screen-reader announcement prefix after a resize (followed by the new end time). */
  resizedTo: string;
  /** Announced when an event is picked up for keyboard move (Space). */
  grabbed: string;
  /** Announced when a grabbed event is dropped / released. */
  dropped: string;
  /** Accessible label for the view switcher (Day/Week/Month tablist). */
  viewLabel: string;
  /** Accessible label for the day/week time grid. */
  gridLabel: string;
  /** Accessible label for the month grid. */
  monthLabel: string;
  /** Shown for an all-day event's time. */
  allDay: string;
  /** Suffix on the "+N more" affordance in a month cell (e.g. "3 more"). */
  more: string;
  /** Accessible label for the "+N more" button; `{count}` is replaced with the total. */
  showAll: string;
}

export const defaultMessages: SchedulerMessages = {
  today: "Today",
  previous: "Previous",
  next: "Next",
  day: "Day",
  week: "Week",
  month: "Month",
  agenda: "Agenda",
  noEvents: "No events",
  close: "Close",
  back: "Back",
  createTitle: "New event",
  eventAdjustable: "adjustable event",
  movedTo: "Moved to",
  resizedTo: "Resized, now ends at",
  grabbed: "Grabbed. Use arrow keys to move, Space to drop, Escape to cancel.",
  dropped: "Dropped.",
  viewLabel: "View",
  gridLabel: "Schedule",
  monthLabel: "Month",
  allDay: "All day",
  more: "more",
  showAll: "Show all {count} events",
};
