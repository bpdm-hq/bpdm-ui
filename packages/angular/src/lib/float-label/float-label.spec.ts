import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmFloatLabel } from "./float-label";
import { BpdmInput } from "../input/input";
import { BpdmTextarea } from "../textarea/textarea";

@Component({
  imports: [BpdmFloatLabel, BpdmInput],
  template: `<bpdm-float-label label="Email" htmlFor="email"><input bpdmInput id="email" /></bpdm-float-label>`,
})
class HostComponent {}

@Component({
  imports: [BpdmFloatLabel, BpdmInput],
  template: `<bpdm-float-label label="Name"><input bpdmInput /></bpdm-float-label>`,
})
class NoIdHost {}

@Component({
  imports: [BpdmFloatLabel, BpdmTextarea],
  template: `<bpdm-float-label label="Bio" variant="in"><textarea bpdmTextarea placeholder="Tell us"></textarea></bpdm-float-label>`,
})
class VariantHost {}

describe("BpdmFloatLabel", () => {
  const settle = async (fixture: { detectChanges: () => void; whenStable: () => Promise<unknown> }) => {
    fixture.detectChanges();
    await fixture.whenStable(); // afterNextRender runs the injection
  };

  it("renders the label and injects peer + blank placeholder on the control", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await settle(fixture);

    const host = fixture.nativeElement as HTMLElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    const input = host.querySelector("input") as HTMLInputElement;

    expect(label.textContent).toContain("Email");
    expect(label.getAttribute("for")).toBe("email");
    expect(input.classList.contains("peer")).toBe(true);
    expect(input.getAttribute("placeholder")).toBe(" ");
  });

  it("auto-generates a matching id so the label is never dangling", async () => {
    const fixture = TestBed.createComponent(NoIdHost);
    await settle(fixture);
    const host = fixture.nativeElement as HTMLElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    const input = host.querySelector("input") as HTMLInputElement;

    const forId = label.getAttribute("for");
    expect(forId).toBeTruthy();
    expect(input.getAttribute("id")).toBe(forId);
  });

  it("resolves the label `for` deterministically on first render (before afterNextRender)", () => {
    // No whenStable(): the id must already be resolvable synchronously (SSR-safe,
    // no window, no async gap) so the label never dangles on the first paint.
    const fixture = TestBed.createComponent(NoIdHost);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector("label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBeTruthy();
  });

  it("uses a caller-supplied htmlFor on first render", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector("label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe("email");
  });

  it("adds pt-4 for variant='in' and preserves a caller-supplied placeholder", async () => {
    const fixture = TestBed.createComponent(VariantHost);
    await settle(fixture);
    const control = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    expect(control.classList.contains("pt-4")).toBe(true);
    expect(control.getAttribute("placeholder")).toBe("Tell us"); // not overwritten
  });
});
