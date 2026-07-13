import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge, NotificationBadge } from "./badge";

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders a remove button and fires onRemove (after collapse)", async () => {
    const onRemove = vi.fn();
    render(
      <Badge variant="neutral" onRemove={onRemove}>
        Frontend
      </Badge>,
    );
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(remove).toBeInTheDocument();
    await userEvent.click(remove);
    // onRemove has not fired yet — it waits for the collapse transition to end
    expect(onRemove).not.toHaveBeenCalled();
    // fire the collapse transition end on grid-template-columns
    const wrapper = remove.closest("span.inline-grid") as HTMLElement;
    expect(wrapper).toBeTruthy();
    fireEvent.transitionEnd(wrapper, { propertyName: "grid-template-columns" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("defaults the remove aria-label to Remove and can override via messages", () => {
    const { rerender } = render(<Badge onRemove={() => {}}>Frontend</Badge>);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    rerender(
      <Badge onRemove={() => {}} messages={{ remove: "Entfernen" }}>
        Frontend
      </Badge>,
    );
    expect(screen.getByRole("button", { name: "Entfernen" })).toBeInTheDocument();
  });

  it("gives the remove button a pointer cursor", () => {
    render(<Badge onRemove={() => {}}>Frontend</Badge>);
    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass("cursor-pointer");
  });

  it("renders as a link with asChild", () => {
    render(
      <Badge asChild variant="primary">
        <a href="/x">New</a>
      </Badge>,
    );
    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute("href", "/x");
  });
});

describe("NotificationBadge", () => {
  it("shows the count", () => {
    render(
      <NotificationBadge count={3}>
        <button>Bell</button>
      </NotificationBadge>,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("caps the count at max with a +", () => {
    render(
      <NotificationBadge count={128} max={99}>
        <button>Inbox</button>
      </NotificationBadge>,
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("hides at zero unless showZero", () => {
    const { rerender } = render(
      <NotificationBadge count={0}>
        <button>A</button>
      </NotificationBadge>,
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    rerender(
      <NotificationBadge count={0} showZero>
        <button>A</button>
      </NotificationBadge>,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders a dot with no number", () => {
    render(
      <NotificationBadge dot>
        <button>Bell</button>
      </NotificationBadge>,
    );
    // dot indicator renders but carries no textual count
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("Bell")).toBeInTheDocument();
  });

  it("exposes an accessible name via ariaLabel", () => {
    render(
      <NotificationBadge count={5} ariaLabel="5 unread messages">
        <button>Bell</button>
      </NotificationBadge>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "5 unread messages");
    expect(status).toHaveTextContent("5");
  });

  it("keeps the indicator decorative when no ariaLabel is given", () => {
    render(
      <NotificationBadge count={5}>
        <button>Bell</button>
      </NotificationBadge>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
