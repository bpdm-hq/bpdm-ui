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

@Component({
  imports: [BpdmSelect],
  template: `<bpdm-select [options]="opts" aria-label="Country" />`,
})
class KeyboardHost {
  opts: SelectItems = [
    { value: "us", label: "United States" },
    { value: "in", label: "India" },
    { value: "jp", label: "Japan" },
  ];
}

// jsdom has no Element.prototype.scrollTo — CDK's virtual viewport calls it when
// keyboard nav scrolls the active option into view. Stub it so nav doesn't throw.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
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

  describe("listbox keyboard (APG)", () => {
    const openKeyboardHost = async () => {
      const fixture = TestBed.createComponent(KeyboardHost);
      fixture.detectChanges();
      const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      TestBed.inject(ApplicationRef).tick();
      await macrotask();
      return document.querySelector('[role="listbox"]') as HTMLElement;
    };

    const press = async (listbox: HTMLElement, key: string) => {
      listbox.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      TestBed.inject(ApplicationRef).tick();
      await macrotask();
    };

    const activeText = (listbox: HTMLElement) => {
      const id = listbox.getAttribute("aria-activedescendant");
      return id ? (document.getElementById(id)?.textContent ?? "").trim() : "";
    };

    it("type-ahead jumps to the first option starting with the typed character", async () => {
      const listbox = await openKeyboardHost();
      expect(activeText(listbox)).toContain("United States");
      await press(listbox, "j");
      expect(activeText(listbox)).toContain("Japan");
    });

    it("Home / End jump to the first and last option", async () => {
      const listbox = await openKeyboardHost();
      await press(listbox, "End");
      expect(activeText(listbox)).toContain("Japan");
      await press(listbox, "Home");
      expect(activeText(listbox)).toContain("United States");
    });

    it("preserves ArrowDown / ArrowUp navigation", async () => {
      const listbox = await openKeyboardHost();
      await press(listbox, "ArrowDown");
      expect(activeText(listbox)).toContain("India");
      await press(listbox, "ArrowUp");
      expect(activeText(listbox)).toContain("United States");
    });
  });

  it("exposes the full label via title on the trigger value and the options", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const triggerValue = fixture.nativeElement.querySelector(
      '[role="combobox"] span.truncate',
    ) as HTMLElement;
    expect(triggerValue.getAttribute("title")).toBe("Banana");

    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();
    const option = document.querySelector('[role="option"] span.truncate') as HTMLElement;
    expect(option.getAttribute("title")).toBeTruthy();
  });
});
