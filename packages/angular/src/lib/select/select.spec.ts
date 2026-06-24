import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmSelect, type SelectItems } from "./select";

@Component({
  imports: [BpdmSelect],
  template: `<bpdm-select [options]="opts" [value]="val" />`,
})
class Host {
  opts: SelectItems = [
    { value: "a", label: "Apple" },
    { value: "b", label: "Banana" },
  ];
  val = "b";
}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));

describe("BpdmSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("renders the selected option's label in the trigger", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    expect(trigger.textContent).toContain("Banana");
  });

  it("opens the listbox panel on click", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[role="listbox"]')).toBeTruthy();
  });
});
