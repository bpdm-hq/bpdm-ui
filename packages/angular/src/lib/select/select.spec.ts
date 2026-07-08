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

@Component({
  imports: [BpdmSelect],
  template: `<bpdm-select [options]="opts" aria-label="Fruit" aria-describedby="hint" />`,
})
class LabelledHost {
  opts: SelectItems = [
    { value: "a", label: "Apple" },
    { value: "b", label: "Banana" },
  ];
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

  it("wires trigger → listbox → options for assistive tech", async () => {
    const fixture = TestBed.createComponent(LabelledHost);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-label")).toBe("Fruit");
    expect(trigger.getAttribute("aria-describedby")).toBe("hint");

    trigger.click();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();

    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(trigger.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox.getAttribute("aria-label")).toBe("Fruit");
    // active option is exposed via aria-activedescendant → a real option id
    const activeId = listbox.getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId as string)?.getAttribute("role")).toBe("option");
  });
});
