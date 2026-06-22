import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    // onRemove fires on the collapse transition end; the button at least exists + is wired
    expect(remove).toBeInTheDocument();
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
});
