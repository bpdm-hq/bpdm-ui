import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster, toast } from "./toast";

// the toast store is module-level, so clear it between tests
afterEach(() => {
  act(() => {
    toast.dismiss();
  });
});

describe("Toaster / toast", () => {
  it("renders a toast with its title", () => {
    render(<Toaster />);
    act(() => {
      toast("Saved");
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("sets a variant icon for success / error / warning / info", () => {
    const { container } = render(<Toaster />);
    act(() => {
      toast.success("Ok");
      toast.error("Bad");
      toast.warning("Careful");
      toast.info("Note");
    });
    // each variant colours its leading icon with its `fg` class
    expect(container.querySelector(".text-success")).toBeTruthy();
    expect(container.querySelector(".text-destructive")).toBeTruthy();
    expect(container.querySelector(".text-warning")).toBeTruthy();
    expect(container.querySelector(".text-info")).toBeTruthy();
  });

  it("renders description and action; clicking the action fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Deleted", {
        description: "Item removed",
        action: { label: "Undo", onClick },
      });
    });
    expect(screen.getByText("Item removed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("dismisses via the close button (default aria-label 'Dismiss')", async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => {
      toast("Bye");
    });
    const close = screen.getByRole("button", { name: "Dismiss" });
    await user.click(close);
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  });

  it("toast.dismiss(id) removes one and toast.dismiss() removes all", () => {
    render(<Toaster />);
    let id = "";
    act(() => {
      id = toast("First");
      toast("Second");
    });
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();

    act(() => {
      toast.dismiss(id);
    });
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();

    act(() => {
      toast.dismiss();
    });
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
  });

  it("localizes the dismiss aria-label via messages", () => {
    render(<Toaster messages={{ dismiss: "Schließen" }} />);
    act(() => {
      toast("Hallo");
    });
    expect(screen.getByRole("button", { name: "Schließen" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("promise toast shows the loading title, then the success title", async () => {
    render(<Toaster />);
    let resolve!: (value: string) => void;
    const p = new Promise<string>((r) => {
      resolve = r;
    });
    act(() => {
      toast.promise(p, {
        loading: "Saving…",
        success: "Saved!",
        error: "Failed",
      });
    });
    expect(screen.getByText("Saving…")).toBeInTheDocument();

    await act(async () => {
      resolve("done");
      await p;
    });
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
  });

  it("keeps a sticky toast (duration Infinity) after time passes", () => {
    vi.useFakeTimers();
    try {
      render(<Toaster />);
      act(() => {
        toast("Sticky", { duration: Infinity });
      });
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getByText("Sticky")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces error toasts assertively (Toast.Root type='foreground')", async () => {
    render(<Toaster />);
    act(() => {
      toast.error("Boom");
    });
    // Radix mirrors the toast text into a visually-hidden live region whose
    // politeness follows `type`: error → assertive.
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="assertive"]'),
      ).toBeInTheDocument();
    });
    expect(document.querySelector('[aria-live="polite"]')).toBeNull();
  });

  it("announces non-error toasts politely (Toast.Root type='background')", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Yay");
    });
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="polite"]'),
      ).toBeInTheDocument();
    });
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
  });

  it("a normal toast can be dismissed via the close button", () => {
    render(<Toaster />);
    act(() => {
      toast("Closeable");
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Closeable")).not.toBeInTheDocument();
  });
});
