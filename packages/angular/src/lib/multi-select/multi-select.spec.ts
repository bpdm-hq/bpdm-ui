import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmMultiSelect } from "./multi-select";
import type { SelectItems } from "../select/select";

@Component({
  imports: [BpdmMultiSelect],
  template: `<bpdm-multi-select [options]="opts" [defaultValue]="dv" />`,
})
class Host {
  opts: SelectItems = [
    { value: "a", label: "Apple" },
    { value: "b", label: "Banana" },
    { value: "c", label: "Cherry" },
  ];
  dv = ["a", "b"];
}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));

describe("BpdmMultiSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("renders a chip per selected value", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    expect(trigger.textContent).toContain("Apple");
    expect(trigger.textContent).toContain("Banana");
  });

  it("opens a multiselectable listbox on click", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[role="listbox"][aria-multiselectable="true"]')).toBeTruthy();
  });
});
