import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTreeSelect, type TreeNode } from "./tree-select";

const TREE: TreeNode[] = [
  {
    value: "p",
    label: "Parent",
    children: [
      { value: "c1", label: "Child 1" },
      { value: "c2", label: "Child 2" },
    ],
  },
];

@Component({
  imports: [BpdmTreeSelect],
  template: `<bpdm-tree-select [options]="tree" selectAll="false" />`,
})
class Host {
  tree = TREE;
}

@Component({
  imports: [BpdmTreeSelect],
  template: `<bpdm-tree-select [options]="tree" aria-label="Food" [messages]="{ selectAll: 'Tout' }" />`,
})
class LabelledHost {
  tree = TREE;
}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));
const tick = () => TestBed.inject(ApplicationRef).tick();
const open = async (fixture: { nativeElement: HTMLElement; detectChanges: () => void }) => {
  fixture.detectChanges();
  const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
  trigger.click();
  tick();
  await macrotask();
  return trigger;
};
const btnByText = (text: string) =>
  Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim() === text)!;

describe("BpdmTreeSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens a labelled tree with levelled treeitems + aria-controls", async () => {
    const fixture = TestBed.createComponent(Host);
    const trigger = await open(fixture);
    const tree = document.querySelector('[role="tree"]') as HTMLElement;
    expect(tree.getAttribute("aria-multiselectable")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("tree");
    expect(trigger.getAttribute("aria-controls")).toBe(tree.id);

    const parent = document.querySelector('[role="treeitem"]') as HTMLElement;
    expect(parent.getAttribute("aria-level")).toBe("1");
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    expect(parent.getAttribute("aria-checked")).toBe("false");
  });

  it("checking a parent selects all its leaves", async () => {
    const fixture = TestBed.createComponent(Host);
    const trigger = await open(fixture);
    btnByText("Parent").click();
    tick();
    expect(trigger.textContent).toContain("Child 1");
    expect(trigger.textContent).toContain("Child 2");
  });

  it("expands a branch to reveal levelled child treeitems", async () => {
    const fixture = TestBed.createComponent(Host);
    await open(fixture);
    (document.querySelector('button[aria-label="Expand"]') as HTMLElement).click();
    tick();
    const parent = document.querySelector('[role="treeitem"]') as HTMLElement;
    expect(parent.getAttribute("aria-expanded")).toBe("true");
    const child = document.querySelector('[role="group"] [role="treeitem"]') as HTMLElement;
    expect(child.getAttribute("aria-level")).toBe("2");
  });

  it("names the tree + translates the Select all label", async () => {
    const fixture = TestBed.createComponent(LabelledHost);
    const trigger = await open(fixture);
    expect(trigger.getAttribute("aria-label")).toBe("Food");
    expect((document.querySelector('[role="tree"]') as HTMLElement).getAttribute("aria-label")).toBe("Food");
    expect((document.querySelector('[role="checkbox"]') as HTMLElement).getAttribute("aria-label")).toBe("Tout");
  });

  describe("keyboard (WAI-ARIA tree)", () => {
    const key = (tree: HTMLElement, k: string) => {
      tree.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
      tick();
    };

    it("focuses the tree on open (non-searchable) and seeds aria-activedescendant", async () => {
      const fixture = TestBed.createComponent(Host);
      await open(fixture);
      const tree = document.querySelector('[role="tree"]') as HTMLElement;
      expect(document.activeElement).toBe(tree);
      const parent = document.querySelector('[role="treeitem"]') as HTMLElement;
      expect(tree.getAttribute("aria-activedescendant")).toBe(parent.id);
    });

    it("expands/collapses branches, steps in, and moves the active treeitem via arrows", async () => {
      const fixture = TestBed.createComponent(Host);
      await open(fixture);
      const tree = document.querySelector('[role="tree"]') as HTMLElement;

      key(tree, "ArrowRight"); // expand collapsed parent
      expect((document.querySelector('[role="treeitem"]') as HTMLElement).getAttribute("aria-expanded")).toBe("true");

      key(tree, "ArrowRight"); // step into first child
      const child1 = document.querySelector('[role="group"] [role="treeitem"]') as HTMLElement;
      expect(tree.getAttribute("aria-activedescendant")).toBe(child1.id);

      key(tree, "ArrowDown"); // move to second child
      const children = document.querySelectorAll('[role="group"] [role="treeitem"]');
      expect(tree.getAttribute("aria-activedescendant")).toBe((children[1] as HTMLElement).id);

      key(tree, "ArrowLeft"); // leaf → move back to parent
      const parent = document.querySelector('[role="treeitem"]') as HTMLElement;
      expect(tree.getAttribute("aria-activedescendant")).toBe(parent.id);

      key(tree, "ArrowLeft"); // expanded parent → collapse
      expect((document.querySelector('[role="treeitem"]') as HTMLElement).getAttribute("aria-expanded")).toBe("false");
    });

    it("marks the active treeitem row with the accessible amber indicator", async () => {
      const fixture = TestBed.createComponent(Host);
      await open(fixture);
      const tree = document.querySelector('[role="tree"]') as HTMLElement;
      const active = document.getElementById(
        tree.getAttribute("aria-activedescendant")!,
      ) as HTMLElement;
      const row = active.firstElementChild as HTMLElement;
      expect(row.className).toContain("bg-[var(--bpdm-option-active-bg)]");
      expect(row.className).toContain("shadow-[inset_2px_0_0_0_var(--bpdm-option-active-bar)]");
      expect(row.className).toContain("rtl:shadow-[inset_-2px_0_0_0_var(--bpdm-option-active-bar)]");
    });

    it("pointer move sets the hovered treeitem active, so the single highlight follows the cursor", async () => {
      const fixture = TestBed.createComponent(Host);
      await open(fixture);
      const tree = document.querySelector('[role="tree"]') as HTMLElement;
      key(tree, "ArrowRight"); // expand Parent so its children are visible
      const child2 = Array.from(document.querySelectorAll('[role="treeitem"]')).find(
        (i) => i.textContent?.includes("Child 2"),
      ) as HTMLElement;
      const row = child2.firstElementChild as HTMLElement;
      row.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
      tick();
      expect(tree.getAttribute("aria-activedescendant")).toBe(child2.id); // amber moved to hovered row
    });

    it("toggles selection of the active treeitem with Space/Enter", async () => {
      const fixture = TestBed.createComponent(Host);
      await open(fixture);
      const tree = document.querySelector('[role="tree"]') as HTMLElement;
      key(tree, "ArrowRight"); // expand
      key(tree, "ArrowRight"); // active = Child 1
      key(tree, " "); // select
      const child1 = document.querySelector('[role="group"] [role="treeitem"]') as HTMLElement;
      expect(child1.getAttribute("aria-checked")).toBe("true");
    });
  });
});
