import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmProgressBar, type ProgressMessages } from "./progress-bar";

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

@Component({
  imports: [BpdmProgressBar],
  template: `<bpdm-progress-bar
    [value]="value()"
    [max]="max()"
    [indeterminate]="indeterminate()"
    [label]="label()"
    [format]="format()"
    [messages]="messages()"
  />`,
})
class ConfigurableHost {
  readonly value = signal(50);
  readonly max = signal(100);
  readonly indeterminate = signal(false);
  readonly label = signal<string | undefined>(undefined);
  readonly format = signal<((v: number, m: number) => string) | undefined>(undefined);
  readonly messages = signal<Partial<ProgressMessages>>({});
}

describe("BpdmProgressBar", () => {
  it("exposes accessible determinate progress with the fill color + width", () => {
    const fixture = TestBed.createComponent(DeterminateHost);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("50%");
    const fill = bar.querySelector("span.block") as HTMLElement;
    expect(fill.className).toContain("bg-success");
    expect(fill.style.width).toBe("50%");
    expect(fixture.nativeElement.textContent).toContain("Uploading"); // header label
  });

  it("drops the value attributes when indeterminate and marks aria-busy", () => {
    const fixture = TestBed.createComponent(IndeterminateHost);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    expect(bar.getAttribute("aria-valuemax")).toBeNull();
    expect(bar.getAttribute("aria-valuetext")).toBe("Loading");
    expect(bar.getAttribute("aria-busy")).toBe("true");
  });

  it("uses max for the value text and a string label as the accessible name", () => {
    const fixture = TestBed.createComponent(ConfigurableHost);
    fixture.componentInstance.value.set(25);
    fixture.componentInstance.max.set(50);
    fixture.componentInstance.label.set("Uploading");
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuetext")).toBe("50%");
    expect(bar.getAttribute("aria-label")).toBe("Uploading");
  });

  it("format drives the valuetext + header", () => {
    const fixture = TestBed.createComponent(ConfigurableHost);
    fixture.componentInstance.value.set(3);
    fixture.componentInstance.max.set(10);
    fixture.componentInstance.format.set((v, m) => `${v}/${m}`);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuetext")).toBe("3/10");
    expect(fixture.nativeElement.textContent).toContain("3/10");
  });

  it("falls back to the default accessible name, overridable via messages", () => {
    const fixture = TestBed.createComponent(ConfigurableHost);
    fixture.detectChanges();
    let bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-label")).toBe("Progress");

    fixture.componentInstance.messages.set({ label: "Fortschritt" });
    fixture.detectChanges();
    bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-label")).toBe("Fortschritt");
  });

  it("overrides the indeterminate loading text via messages", () => {
    const fixture = TestBed.createComponent(ConfigurableHost);
    fixture.componentInstance.indeterminate.set(true);
    fixture.componentInstance.messages.set({ loading: "Wird geladen" });
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute("aria-valuetext")).toBe("Wird geladen");
  });
});
