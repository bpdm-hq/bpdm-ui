import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTreeSelect, type TreeNode } from "./tree-select";

@Component({
  imports: [BpdmTreeSelect],
  template: `<bpdm-tree-select [options]="tree" />`,
})
class Host {
  tree: TreeNode[] = [
    {
      value: "p",
      label: "Parent",
      children: [
        { value: "c1", label: "Child 1" },
        { value: "c2", label: "Child 2" },
      ],
    },
  ];
}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));
const tick = () => TestBed.inject(ApplicationRef).tick();

describe("BpdmTreeSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("checking a parent selects all its leaves", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    tick();
    await macrotask();

    // first checkbox in the panel is the parent
    const parent = document.querySelector('[role="checkbox"]') as HTMLElement;
    expect(parent).toBeTruthy();
    parent.click();
    tick();

    // both leaf labels now show as chips in the trigger
    expect(trigger.textContent).toContain("Child 1");
    expect(trigger.textContent).toContain("Child 2");
  });
});
