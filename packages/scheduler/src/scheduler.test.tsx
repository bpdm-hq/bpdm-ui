// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

afterEach(cleanup);
import { Scheduler } from "./scheduler";
import type { CalendarEvent } from "@bpdm/scheduler-core";

const now = new Date(2026, 6, 20, 11, 20); // Mon 20 Jul 2026
const events: CalendarEvent[] = [
  {
    id: "a",
    title: "Sprint planning",
    start: new Date(2026, 6, 20, 9, 0),
    end: new Date(2026, 6, 20, 10, 30),
    category: "amber",
  },
  {
    id: "b",
    title: "Design review",
    start: new Date(2026, 6, 21, 11, 0),
    end: new Date(2026, 6, 21, 12, 30),
    category: "teal",
  },
];

describe("Scheduler", () => {
  it("renders the week view with its events", async () => {
    render(<Scheduler events={events} defaultDate={now} now={now} />);
    expect(await screen.findByText("Sprint planning")).toBeInTheDocument();
    expect(screen.getByText("Design review")).toBeInTheDocument();
  });

  it("switches to the day view and shows only that day", async () => {
    render(<Scheduler events={events} defaultDate={now} now={now} views={["day", "week"]} />);
    await userEvent.click(screen.getByRole("tab", { name: "Day" }));
    expect(screen.getByRole("tab", { name: "Day" })).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByText("Sprint planning")).toBeInTheDocument();
    expect(screen.queryByText("Design review")).not.toBeInTheDocument(); // Tuesday, out of a Monday day-view
  });

  it("navigates forward a week with Next", async () => {
    render(<Scheduler events={events} defaultDate={now} now={now} />);
    expect(await screen.findByText("Sprint planning")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByText("Sprint planning")).not.toBeInTheDocument(); // moved to next week
  });

  it("calls onEventClick with the clicked event", async () => {
    const onEventClick = vi.fn();
    render(<Scheduler events={events} defaultDate={now} now={now} onEventClick={onEventClick} />);
    await userEvent.click(await screen.findByText("Sprint planning"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
  });

  it("fires onSelectSlot when an empty grid slot is clicked", async () => {
    const onSelectSlot = vi.fn();
    render(<Scheduler events={events} defaultDate={now} now={now} views={["day"]} onSelectSlot={onSelectSlot} />);
    // the single day column is a gridcell; clicking its background picks a slot
    const cols = screen.getAllByRole("gridcell");
    await userEvent.click(cols[cols.length - 1]!);
    expect(onSelectSlot).toHaveBeenCalledTimes(1);
    const slot = onSelectSlot.mock.calls[0]![0];
    expect(slot.start).toBeInstanceOf(Date);
    expect(slot.end.getTime()).toBeGreaterThan(slot.start.getTime());
  });

  it("opens the create form on slot click and creates the event on submit", async () => {
    const onCreate = vi.fn();
    render(
      <Scheduler
        events={events}
        defaultDate={now}
        now={now}
        views={["day"]}
        onCreate={onCreate}
        renderCreateForm={({ submit, cancel }) => (
          <div>
            <button type="button" onClick={() => submit({ title: "Kickoff", category: "blue" })}>
              Save
            </button>
            <button type="button" onClick={cancel}>
              Dismiss
            </button>
          </div>
        )}
      />,
    );

    const cols = screen.getAllByRole("gridcell");
    await userEvent.click(cols[cols.length - 1]!);
    // popup opened
    const save = await screen.findByRole("button", { name: "Save" });
    await userEvent.click(save);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Kickoff", category: "blue" }),
    );
    // form closes after submit
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("month '+N more' opens a day peek listing every event", async () => {
    const onEventClick = vi.fn();
    // four events on the same Monday → month cell shows 3 chips + "+1 more"
    const many: CalendarEvent[] = [
      { id: "m1", title: "Standup", start: new Date(2026, 6, 20, 9, 0), end: new Date(2026, 6, 20, 9, 30) },
      { id: "m2", title: "Sprint planning", start: new Date(2026, 6, 20, 10, 0), end: new Date(2026, 6, 20, 11, 0) },
      { id: "m3", title: "Lunch", start: new Date(2026, 6, 20, 12, 30), end: new Date(2026, 6, 20, 13, 30) },
      { id: "m4", title: "Retro", start: new Date(2026, 6, 20, 16, 0), end: new Date(2026, 6, 20, 17, 0) },
    ];
    render(
      <Scheduler events={many} defaultDate={now} now={now} defaultView="month" views={["month"]} onEventClick={onEventClick} />,
    );
    const more = await screen.findByRole("button", { name: /show all 4 events/i });
    await userEvent.click(more);
    // peek dialog lists all four, including the one hidden behind "+N more"
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Retro")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByText("Retro"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "m4" }));
  });

  it("an event opened from the day peek can go back to the list", async () => {
    const many: CalendarEvent[] = [
      { id: "m1", title: "Standup", start: new Date(2026, 6, 20, 9, 0), end: new Date(2026, 6, 20, 9, 30) },
      { id: "m2", title: "Sprint planning", start: new Date(2026, 6, 20, 10, 0), end: new Date(2026, 6, 20, 11, 0) },
      { id: "m3", title: "Lunch", start: new Date(2026, 6, 20, 12, 30), end: new Date(2026, 6, 20, 13, 30) },
      { id: "m4", title: "Retro", start: new Date(2026, 6, 20, 16, 0), end: new Date(2026, 6, 20, 17, 0) },
    ];
    // no onEventClick → the built-in detail dialog is used
    render(<Scheduler events={many} defaultDate={now} now={now} defaultView="month" views={["month"]} />);
    await userEvent.click(await screen.findByRole("button", { name: /show all 4 events/i }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByText("Retro"));
    // detail dialog shows a Back control
    const back = await screen.findByRole("button", { name: "Back" });
    await userEvent.click(back);
    // returned to the peek list — Back is gone, the full day's events are listed again
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getByText("Standup")).toBeInTheDocument();
  });

  it("closes the create form on cancel without creating", async () => {
    const onCreate = vi.fn();
    render(
      <Scheduler
        events={events}
        defaultDate={now}
        now={now}
        views={["day"]}
        onCreate={onCreate}
        renderCreateForm={({ cancel }) => (
          <button type="button" onClick={cancel}>
            Dismiss
          </button>
        )}
      />,
    );
    const cols = screen.getAllByRole("gridcell");
    await userEvent.click(cols[cols.length - 1]!);
    await userEvent.click(await screen.findByRole("button", { name: "Dismiss" }));
    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });
});
