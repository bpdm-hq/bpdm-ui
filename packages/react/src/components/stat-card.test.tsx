import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Active users" value="8,420" />);
    expect(screen.getByText("Active users")).toBeTruthy();
    expect(screen.getByText("8,420")).toBeTruthy();
  });

  it("shows a positive delta as good (green) with its value", () => {
    const { container } = render(<StatCard label="Signups" value="1,294" delta={12.5} deltaLabel="vs last month" />);
    const delta = container.querySelector(".text-success");
    expect(delta?.textContent).toContain("12.5%");
    expect(screen.getByText("vs last month")).toBeTruthy();
  });

  it("shows a negative delta as bad (red)", () => {
    const { container } = render(<StatCard label="Session" value="4m" delta={-1.8} />);
    expect(container.querySelector(".text-destructive")?.textContent).toContain("1.8%");
    expect(container.querySelector(".text-success")).toBeNull();
  });

  it("flips colour with positiveIsGood=false — a rise is bad (red)", () => {
    const { container } = render(<StatCard label="Bounce" value="2.4%" delta={0.6} positiveIsGood={false} />);
    expect(container.querySelector(".text-destructive")?.textContent).toContain("0.6%");
    expect(container.querySelector(".text-success")).toBeNull();
  });

  it("treats a zero delta as neutral (no good/bad colour)", () => {
    const { container } = render(<StatCard label="Flat" value="100" delta={0} />);
    expect(container.querySelector(".text-success")).toBeNull();
    expect(container.querySelector(".text-destructive")).toBeNull();
    expect(container.textContent).toContain("0%");
  });

  it("renders no delta when omitted", () => {
    const { container } = render(<StatCard label="Open tickets" value="37" />);
    expect(container.textContent).not.toContain("%");
  });

  it("tints the card with an accent colour", () => {
    const { container } = render(<StatCard label="Views" value="1.24M" accent="#2563eb" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.style.backgroundColor).toContain("color-mix");
    expect(card.style.backgroundColor).toContain("#2563eb");
  });

  it("renders the icon", () => {
    render(<StatCard label="Users" value="10" icon={<svg data-testid="ico" />} />);
    expect(screen.getByTestId("ico")).toBeTruthy();
  });

  it("shows a skeleton (aria-busy) and hides the value while loading", () => {
    const { container } = render(<StatCard label="Active users" value="8,420" loading />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(container.textContent).not.toContain("8,420");
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
