import { describe, it, expect } from "vitest";
import { BpdmButton } from "./bpdm-button";

function mount(markup = "<bpdm-button>Go</bpdm-button>"): BpdmButton {
  document.body.innerHTML = markup;
  return document.querySelector("bpdm-button") as BpdmButton;
}

describe("<bpdm-button>", () => {
  it("is registered as a custom element", () => {
    expect(customElements.get("bpdm-button")).toBeTruthy();
  });

  it("applies default variants and reflects them to attributes", async () => {
    const el = mount();
    await el.updateComplete;
    expect(el.variant).toBe("primary");
    expect(el.appearance).toBe("solid");
    expect(el.size).toBe("md");
    expect(el.shape).toBe("default");
    expect(el.type).toBe("button");
    expect(el.getAttribute("variant")).toBe("primary");
    expect(el.getAttribute("appearance")).toBe("solid");
  });

  it("renders an inner button carrying the slotted label", async () => {
    const el = mount("<bpdm-button>Save</bpdm-button>");
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("button")).toBeTruthy();
    expect(el.textContent).toContain("Save");
  });

  it("marks loading with aria-busy and shows a spinner", async () => {
    const el = mount("<bpdm-button loading>Go</bpdm-button>");
    await el.updateComplete;
    const inner = el.shadowRoot?.querySelector("button");
    expect(inner?.getAttribute("aria-busy")).toBe("true");
    expect(el.shadowRoot?.querySelector(".spinner")).toBeTruthy();
  });

  it("disables the inner control and exposes aria-disabled", async () => {
    const el = mount("<bpdm-button disabled>Go</bpdm-button>");
    await el.updateComplete;
    const inner = el.shadowRoot?.querySelector("button");
    expect(inner?.hasAttribute("disabled")).toBe(true);
    expect(inner?.getAttribute("aria-disabled")).toBe("true");
  });

  it("is a form-associated custom element", () => {
    // enables native <form> submit/reset in real browsers (jsdom can't e2e this —
    // the real form-submit path is covered by the browser test layer)
    expect((BpdmButton as unknown as { formAssociated?: boolean }).formAssociated).toBe(true);
  });

  it("swallows activation while loading", async () => {
    const el = mount("<bpdm-button loading>Go</bpdm-button>");
    await el.updateComplete;
    let reached = 0;
    el.addEventListener("click", () => {
      reached += 1;
    });
    (el.shadowRoot?.querySelector("button") as HTMLButtonElement).click();
    expect(reached).toBe(0);
  });
});
