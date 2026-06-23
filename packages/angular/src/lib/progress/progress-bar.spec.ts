import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmProgressBar } from "./progress-bar";

@Component({
  imports: [BpdmProgressBar],
  template: `<bpdm-progress-bar [value]="50" variant="success" showValue label="Uploading" />`,
})
class DeterminateHost {}

@Component({
  imports: [BpdmProgressBar],
  template: `<bpdm-progress-bar indeterminate />`,
})
class IndeterminateHost {}

describe("BpdmProgressBar", () => {
  it("exposes accessible determinate progress with the fill color + width", () => {
    const fixture = TestBed.createComponent(DeterminateHost);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    const fill = bar.querySelector("span.block") as HTMLElement;
    expect(fill.className).toContain("bg-success");
    expect(fill.style.width).toBe("50%");
    expect(fixture.nativeElement.textContent).toContain("Uploading"); // header label
  });

  it("drops the value attributes when indeterminate", () => {
    const fixture = TestBed.createComponent(IndeterminateHost);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    expect(bar.getAttribute("aria-valuetext")).toBe("Loading");
  });
});
