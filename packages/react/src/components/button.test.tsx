import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

afterEach(() => vi.restoreAllMocks());

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Nope" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variant, appearance, size and shape classes", () => {
    render(
      <Button variant="destructive" appearance="outline" size="lg" shape="round">
        Delete
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.className).toContain("border-destructive"); // outline colour
    expect(btn.className).toContain("border"); // outline appearance
    expect(btn.className).toContain("h-12"); // lg
    expect(btn.className).toContain("rounded-full"); // round
  });

  it("lets a passed className win over the variant via tailwind-merge", () => {
    render(<Button className="bg-red-500">X</Button>);
    const tokens = screen.getByRole("button", { name: "X" }).className.split(/\s+/);
    expect(tokens).toContain("bg-red-500");
    expect(tokens).not.toContain("bg-primary"); // base fill dropped in our favour
  });

  it("defaults type to button, but respects an explicit type", () => {
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole("button", { name: "Default" })).toHaveAttribute("type", "button");
    rerender(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
  });

  it("forwards the ref to the button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("renders as a link with asChild", () => {
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/x");
  });

  it("marks a disabled asChild link aria-disabled + untabbable", () => {
    render(
      <Button asChild disabled>
        <a href="/x">Go</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
  });

  describe("loading", () => {
    it("marks the button busy, shows a labelled spinner, and blocks clicks", async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      const btn = screen.getByRole("button", { name: /Save/ });
      expect(btn).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Loading")).toBeInTheDocument(); // sr-only status
      expect(btn.querySelector("svg")).toBeInTheDocument(); // spinner
      await userEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("uses a translatable loadingLabel", () => {
      render(
        <Button loading loadingLabel="Wird geladen">
          Speichern
        </Button>,
      );
      expect(screen.getByText("Wird geladen")).toBeInTheDocument();
    });
  });

  describe("dev accessibility guard", () => {
    it("warns on an icon-only button with no accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Button size="icon">
          <svg />
        </Button>,
      );
      expect(warn).toHaveBeenCalled();
    });

    it("does not warn when an icon-only button has an aria-label", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Button size="icon" aria-label="Search">
          <svg />
        </Button>,
      );
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
