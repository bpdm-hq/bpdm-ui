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

@Component({
  imports: [BpdmMultiSelect],
  template: `<bpdm-multi-select
    [options]="opts"
    aria-label="Fruit"
    [messages]="{ remove: rm, selectAll: 'Tout' }"
    [defaultValue]="dv" />`,
})
class LabelledHost {
  opts: SelectItems = [
    { value: "a", label: "Apple" },
    { value: "b", label: "Banana" },
  ];
  dv = ["a"];
  rm = (label: string) => `Enlever ${label}`;
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

  it("translates the chip remove label and wires listbox a11y", async () => {
    const fixture = TestBed.createComponent(LabelledHost);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    // translated remove label on the chip
    expect(fixture.nativeElement.querySelector('[aria-label="Enlever Apple"]')).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-label")).toBe("Fruit");

    trigger.click();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();

    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(trigger.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox.getAttribute("aria-label")).toBe("Fruit");
    // translated "Select all" tri-state checkbox
    const all = document.querySelector('[role="checkbox"]') as HTMLElement;
    expect(all.getAttribute("aria-label")).toBe("Tout");
  });
});
