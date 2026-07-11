import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("composes header / title / description / content / footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Weekly report</CardTitle>
          <CardDescription>This week</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Weekly report" })).toBeTruthy(); // CardTitle is an <h3>
    expect(screen.getByText("This week")).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });

  it("renders the header action slot", () => {
    render(
      <Card>
        <CardHeader action={<span data-testid="action">Live</span>}>
          <CardTitle>Release</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByTestId("action")).toBeTruthy();
  });

  it("becomes a single link with asChild", () => {
    render(
      <Card asChild>
        <a href="/dashboard">
          <CardContent>Open</CardContent>
        </a>
      </Card>,
    );
    expect(screen.getByRole("link").getAttribute("href")).toBe("/dashboard");
  });

  it("applies the outlined variant", () => {
    const { container } = render(<Card variant="outlined">x</Card>);
    expect((container.firstElementChild as HTMLElement).className).toContain("border-border");
  });

  it("adds a hover-lift when hoverable", () => {
    const { container } = render(<Card hoverable>x</Card>);
    expect((container.firstElementChild as HTMLElement).className).toContain("hover:-translate-y");
  });

  it("renders the title as an <h3> by default", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Report" })).toBeTruthy();
  });

  it("sets the title heading level via `as` (document outline)", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle as="h2">Report</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Report" })).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });

  it("keeps the title self-contained — resets ambient heading margin (m-0)", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Report" }).className).toContain("m-0");
  });

  it("keeps a clickable/link card free of a host link underline", () => {
    const { container } = render(<Card interactive>x</Card>);
    expect((container.firstElementChild as HTMLElement).className).toContain("no-underline");
  });
});
