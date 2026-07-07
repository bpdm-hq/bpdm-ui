import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmMoneyInput } from "./money-input";

@Component({
  imports: [BpdmMoneyInput],
  template: `<bpdm-money-input currency="USD" locale="en-US" defaultValue="100000" />`,
})
class UsdHost {}

@Component({
  imports: [BpdmMoneyInput],
  template: `<bpdm-money-input currency="JPY" locale="ja-JP" defaultValue="5000" />`,
})
class JpyHost {}

@Component({
  imports: [BpdmMoneyInput],
  template: `
    <bpdm-money-input
      name="price"
      aria-label="Total"
      aria-describedby="hint"
      defaultValue="10" />
  `,
})
class PassthroughHost {}

describe("BpdmMoneyInput", () => {
  const input = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector("input") as HTMLInputElement;
  const symbol = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector("span") as HTMLSpanElement;

  it("groups the value and shows the currency symbol at rest", () => {
    const fixture = TestBed.createComponent(UsdHost);
    fixture.detectChanges();
    expect(symbol(fixture).textContent).toBe("$");
    expect(input(fixture).value).toBe("100,000");
  });

  it("uses zero fraction digits for JPY", () => {
    const fixture = TestBed.createComponent(JpyHost);
    fixture.detectChanges();
    // ja-JP renders the fullwidth yen sign (U+FFE5)
    expect(symbol(fixture).textContent).toContain("￥");
    expect(input(fixture).value).toBe("5,000");
  });

  it("shows the raw value on focus and reformats on blur", () => {
    const fixture = TestBed.createComponent(UsdHost);
    fixture.detectChanges();
    const el = input(fixture);
    el.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    expect(el.value).toBe("100000");
    el.value = "2500.5";
    el.dispatchEvent(new Event("input"));
    el.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    // stored value is rounded to 2dp ("2500.50"); the grouped display uses
    // minimumFractionDigits: 0, so a trailing zero is dropped → "2,500.5"
    expect(input(fixture).value).toBe("2,500.5");
  });

  it("forwards name / aria-label / aria-describedby to the input and hides the symbol", () => {
    const fixture = TestBed.createComponent(PassthroughHost);
    fixture.detectChanges();
    const el = input(fixture);
    expect(el.getAttribute("name")).toBe("price");
    expect(el.getAttribute("aria-label")).toBe("Total");
    expect(el.getAttribute("aria-describedby")).toBe("hint");
    expect(symbol(fixture).getAttribute("aria-hidden")).toBe("true");
  });
});
