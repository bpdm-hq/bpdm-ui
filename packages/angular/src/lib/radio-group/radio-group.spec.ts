import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmRadio, BpdmRadioGroup } from "./radio-group";

@Component({
  imports: [BpdmRadioGroup, BpdmRadio],
  template: `<bpdm-radio-group [value]="'a'">
    <bpdm-radio value="a" aria-label="A" />
    <bpdm-radio value="b" aria-label="B" />
    <bpdm-radio value="c" aria-label="C" disabled />
  </bpdm-radio-group>`,
})
class HostComponent {}

@Component({
  imports: [BpdmRadioGroup, BpdmRadio],
  template: `<div dir="rtl">
    <bpdm-radio-group orientation="horizontal" [value]="'a'">
      <bpdm-radio value="a" aria-label="A" />
      <bpdm-radio value="b" aria-label="B" />
      <bpdm-radio value="c" aria-label="C" />
    </bpdm-radio-group>
  </div>`,
})
class RtlHost {}

describe("BpdmRadioGroup", () => {
  const radios = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll('[role="radio"]')) as HTMLButtonElement[];
  const key = (el: HTMLElement, k: string) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

  it("checks the selected item and switches selection on click", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const r = radios(fixture);
    expect(r[0].getAttribute("data-state")).toBe("checked");
    expect(r[1].getAttribute("data-state")).toBe("unchecked");
    r[1].click();
    fixture.detectChanges();
    expect(r[1].getAttribute("data-state")).toBe("checked");
  });

  it("exposes a single tab stop (roving tabindex on the selected item)", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const r = radios(fixture);
    const tabbable = r.filter((x) => x.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("aria-checked")).toBe("true"); // the selected one
  });

  it("moves and selects with arrow keys, wrapping and skipping disabled", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const r = radios(fixture); // a (checked), b, c (disabled)
    key(r[0], "ArrowDown");
    fixture.detectChanges();
    expect(r[1].getAttribute("aria-checked")).toBe("true"); // → b
    key(r[1], "ArrowDown");
    fixture.detectChanges();
    expect(r[0].getAttribute("aria-checked")).toBe("true"); // wraps past disabled c → a
  });

  it("forwards id / accessible-name attributes and disables a single item", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const r = radios(fixture);
    expect(r[0].getAttribute("aria-label")).toBe("A");
    expect(r[2].hasAttribute("disabled")).toBe(true); // per-item disabled
  });

  it("flips horizontal arrow direction inside dir='rtl'", () => {
    const fixture = TestBed.createComponent(RtlHost);
    fixture.detectChanges();
    const r = radios(fixture); // a (selected), b, c
    key(r[0], "ArrowLeft"); // visual-left = forward in RTL → b (in LTR it would wrap to c)
    fixture.detectChanges();
    expect(r[1].getAttribute("aria-checked")).toBe("true");
  });
});
