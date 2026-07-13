import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Avatar, AvatarGroup } from "./avatar";

// Radix Avatar.Image only mounts the <img> once its internal probe image
// reports a successful load — jsdom never fires that, so stub Image to succeed.
class MockImage {
  complete = false;
  naturalWidth = 0;
  private listeners: Record<string, Array<(e: { currentTarget: MockImage }) => void>> = {};
  addEventListener(type: string, cb: (e: { currentTarget: MockImage }) => void) {
    (this.listeners[type] ||= []).push(cb);
  }
  removeEventListener() {}
  set src(_value: string) {
    setTimeout(() => {
      this.complete = true;
      this.naturalWidth = 100;
      this.listeners["load"]?.forEach((cb) => cb({ currentTarget: this }));
    }, 0);
  }
}

afterEach(() => vi.unstubAllGlobals());

describe("Avatar", () => {
  it("renders an image whose alt comes from `name` when no explicit alt", async () => {
    vi.stubGlobal("Image", MockImage);
    render(<Avatar src="/aria.jpg" name="Aria Lindqvist" />);
    const img = await screen.findByAltText("Aria Lindqvist");
    expect(img.tagName).toBe("IMG");
  });

  it("prefers an explicit alt over the name", async () => {
    vi.stubGlobal("Image", MockImage);
    render(<Avatar src="/aria.jpg" name="Aria Lindqvist" alt="Profile photo" />);
    expect(await screen.findByAltText("Profile photo")).toBeInTheDocument();
  });

  it("falls back to auto-tinted initials from the name", async () => {
    render(<Avatar name="Aria Lindqvist" />);
    // initials of "Aria Lindqvist"
    const fallback = await screen.findByText("AL");
    // auto-tint applies a palette bg/text (not the neutral muted look)
    expect(fallback.className).not.toContain("bg-muted");
    // named avatar exposes its full name to screen readers
    expect(screen.getByRole("img", { name: "Aria Lindqvist" })).toBeInTheDocument();
  });

  it("uses the neutral tint when colorful is false", async () => {
    render(<Avatar name="Aria Lindqvist" colorful={false} />);
    expect((await screen.findByText("AL")).className).toContain("bg-muted");
  });

  it("renders a custom icon when there's no name", async () => {
    render(<Avatar icon={<span data-testid="custom-icon">★</span>} />);
    expect(await screen.findByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders the default user icon with no name and no icon", async () => {
    const { container } = render(<Avatar />);
    await waitFor(() => expect(container.querySelector("svg")).toBeInTheDocument());
  });

  it("shows a status dot with role=img and a localized default aria-label", () => {
    render(<Avatar name="Aria Lindqvist" status="online" />);
    expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
  });

  it("localizes the status dot label via messages", () => {
    render(<Avatar name="Aria Lindqvist" status="online" messages={{ online: "En línea" }} />);
    expect(screen.getByRole("img", { name: "En línea" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Online" })).not.toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  it("shows at most `max` avatars and a +N overflow tile", () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
        <Avatar name="G H" />
      </AvatarGroup>,
    );
    // 2 shown + overflow tile → the tile carries the localized "3 more" label
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 more" })).toBeInTheDocument();
  });

  it("localizes the overflow tile label via messages", () => {
    render(
      <AvatarGroup max={1} messages={{ more: "+{count} personas" }}>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
        <Avatar name="G H" />
      </AvatarGroup>,
    );
    expect(screen.getByRole("img", { name: "+3 personas" })).toBeInTheDocument();
  });

  it("forwards its messages down to child status dots", () => {
    render(
      <AvatarGroup messages={{ online: "En línea" }}>
        <Avatar name="A B" status="online" />
        <Avatar name="C D" status="online" />
      </AvatarGroup>,
    );
    expect(screen.getAllByRole("img", { name: "En línea" })).toHaveLength(2);
  });

  it("lets a child's own messages win over the group's", () => {
    render(
      <AvatarGroup messages={{ online: "En línea" }}>
        <Avatar name="A B" status="online" />
        <Avatar name="C D" status="online" messages={{ online: "Verbunden" }} />
      </AvatarGroup>,
    );
    expect(screen.getByRole("img", { name: "Verbunden" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "En línea" })).toBeInTheDocument();
  });
});
