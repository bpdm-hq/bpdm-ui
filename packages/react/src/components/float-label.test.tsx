import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatLabel } from "./float-label";

const input = () => screen.getByRole("textbox") as HTMLInputElement;
const label = (text: string) => screen.getByText(text) as HTMLLabelElement;

describe("FloatLabel", () => {
  it("renders the label and associates it via htmlFor", () => {
    render(
      <FloatLabel label="Email" htmlFor="email">
        <input id="email" />
      </FloatLabel>,
    );
    expect(label("Email").getAttribute("for")).toBe("email");
    expect(input().id).toBe("email");
  });

  it("injects a blank placeholder and the peer class onto the control", () => {
    render(
      <FloatLabel label="Email" htmlFor="email">
        <input id="email" />
      </FloatLabel>,
    );
    expect(input()).toHaveAttribute("placeholder", " ");
    expect(input()).toHaveClass("peer");
  });

  it("auto-generates a matching id so the label is never dangling", () => {
    render(
      <FloatLabel label="Name">
        <input />
      </FloatLabel>,
    );
    const forId = label("Name").getAttribute("for");
    expect(forId).toBeTruthy();
    expect(input().id).toBe(forId);
  });

  it("uses the child's own id when no htmlFor is given", () => {
    render(
      <FloatLabel label="City">
        <input id="city" />
      </FloatLabel>,
    );
    expect(input().id).toBe("city");
    expect(label("City").getAttribute("for")).toBe("city");
  });

  it("htmlFor wins over the child id", () => {
    render(
      <FloatLabel label="X" htmlFor="a">
        <input id="b" />
      </FloatLabel>,
    );
    expect(input().id).toBe("a");
    expect(label("X").getAttribute("for")).toBe("a");
  });

  it("preserves a caller-supplied placeholder", () => {
    render(
      <FloatLabel label="Search">
        <input id="q" placeholder="Type to search" />
      </FloatLabel>,
    );
    expect(input()).toHaveAttribute("placeholder", "Type to search");
  });

  it("merges the child className with peer, and adds pt-4 for variant='in'", () => {
    render(
      <FloatLabel label="X" variant="in">
        <input id="i" className="custom-cls" />
      </FloatLabel>,
    );
    expect(input()).toHaveClass("custom-cls");
    expect(input()).toHaveClass("peer");
    expect(input()).toHaveClass("pt-4");
  });

  it("spreads extra props onto the wrapper", () => {
    render(
      <FloatLabel label="X" htmlFor="i" data-testid="fl">
        <input id="i" />
      </FloatLabel>,
    );
    const wrapper = screen.getByTestId("fl");
    expect(wrapper).toContainElement(input());
    expect(wrapper).toContainElement(label("X"));
  });
});
