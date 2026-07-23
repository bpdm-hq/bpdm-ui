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
};
