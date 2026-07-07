import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SecureField } from "./secure-field";

const field = () => screen.getByTestId("sf") as HTMLInputElement;
const btn = (name: "Reveal" | "Hide" | "Copy") => screen.getByRole("button", { name });

describe("SecureField", () => {
  it("masks at rest keeping the tail, and reveals the real value on toggle", async () => {
    render(
      <SecureField data-testid="sf" defaultValue="4242424242424242" format="grouped" unmaskedTail={4} />,
    );
    expect(field().value).toBe("•••• •••• •••• 4242");
    expect(btn("Reveal")).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(btn("Reveal"));
    expect(field().value).toBe("4242 4242 4242 4242");
    expect(btn("Hide")).toHaveAttribute("aria-pressed", "true");
  });

  it("reveals while focused and re-masks on blur", async () => {
    render(<SecureField data-testid="sf" defaultValue="secret" unmaskedTail={0} revealable={false} />);
    expect(field().value).toBe("••••••");
    await userEvent.click(field());
    expect(field().value).toBe("secret");
    await userEvent.tab();
    expect(field().value).toBe("••••••");
  });

  it("restricts grouped input to digits and sets inputmode=numeric", async () => {
    const onValueChange = vi.fn();
    render(<SecureField data-testid="sf" format="grouped" revealable={false} onValueChange={onValueChange} />);
    expect(field()).toHaveAttribute("inputmode", "numeric");
    await userEvent.type(field(), "4242");
    expect(onValueChange).toHaveBeenLastCalledWith("4242");
  });

  it("copies the raw value and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<SecureField data-testid="sf" defaultValue="ak_live_secret" copyable revealable={false} />);
    await userEvent.click(btn("Copy"));
    expect(writeText).toHaveBeenCalledWith("ak_live_secret");
    expect(await screen.findByText("Copied to clipboard")).toBeInTheDocument();
  });

  it("disables the copy button when there is nothing to copy", () => {
    render(<SecureField data-testid="sf" defaultValue="" copyable revealable={false} />);
    expect(btn("Copy")).toBeDisabled();
  });

  it("spreads native props onto the input and forwards the ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <SecureField ref={ref} data-testid="sf" name="key" required aria-describedby="hint" revealable={false} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(field()).toHaveAttribute("name", "key");
    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute("aria-describedby", "hint");
  });

  it("hides the reveal toggle when revealable is false", () => {
    render(<SecureField data-testid="sf" revealable={false} />);
    expect(screen.queryByRole("button", { name: "Reveal" })).not.toBeInTheDocument();
  });

  it("disables the field and its controls", () => {
    render(<SecureField data-testid="sf" defaultValue="x" copyable disabled />);
    expect(field()).toBeDisabled();
    expect(btn("Reveal")).toBeDisabled();
    expect(btn("Copy")).toBeDisabled();
  });
});
