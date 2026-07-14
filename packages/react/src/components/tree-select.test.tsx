import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeSelect, type TreeNode } from "./tree-select";

const TREE: TreeNode[] = [
  {
    value: "fruit",
    label: "Fruit",
    children: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  { value: "veg", label: "Vegetable", children: [{ value: "carrot", label: "Carrot" }] },
];

const trigger = (name: string) => screen.getByRole("combobox", { name });

describe("TreeSelect", () => {
  it("renders a combobox trigger with placeholder + haspopup=tree", () => {
    render(<TreeSelect options={TREE} aria-label="Food" placeholder="Pick food" />);
    const t = trigger("Food");
    expect(t).toHaveAttribute("aria-haspopup", "tree");
    expect(t).toHaveAttribute("aria-expanded", "false");
    expect(t).toHaveTextContent("Pick food");
  });

  it("opens a labelled tree linked via aria-controls, with levelled treeitems", async () => {
    render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
    await userEvent.click(trigger("Food"));
    const tree = screen.getByRole("tree");
    expect(tree).toHaveAttribute("aria-label", "Food");
    expect(tree).toHaveAttribute("aria-multiselectable", "true");
    expect(trigger("Food").getAttribute("aria-controls")).toBe(tree.id);

    const fruit = screen.getByRole("treeitem", { name: /Fruit/ });
    expect(fruit).toHaveAttribute("aria-level", "1");
    expect(fruit).toHaveAttribute("aria-expanded", "false"); // collapsed branch
    expect(fruit).toHaveAttribute("aria-checked", "false");
  });

  it("expands a branch to reveal levelled child treeitems", async () => {
    render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
    await userEvent.click(trigger("Food"));
    await userEvent.click(screen.getAllByRole("button", { name: "Expand" })[0]); // Fruit
    expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-expanded", "true");
    const apple = screen.getByRole("treeitem", { name: "Apple" });
    expect(apple).toHaveAttribute("aria-level", "2");
  });

  it("checking a parent selects all its leaves (aria-checked=mixed for partial)", async () => {
    const onValueChange = vi.fn();
    render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} onValueChange={onValueChange} />);
    await userEvent.click(trigger("Food"));
    await userEvent.click(screen.getByRole("button", { name: "Fruit" }));
    expect(onValueChange).toHaveBeenCalledWith(["apple", "banana"]);
  });

  it("shows a translatable count and a tri-state Select all", async () => {
    render(
      <TreeSelect
        options={TREE}
        aria-label="Food"
        maxDisplay={0}
        value={["apple"]}
        messages={{ selected: (n) => `${n} choisis`, selectAll: "Tout" }}
        onValueChange={() => {}}
      />,
    );
    expect(trigger("Food")).toHaveTextContent("1 choisis");
    await userEvent.click(trigger("Food"));
    const all = screen.getByRole("checkbox", { name: "Tout" });
    expect(all).toHaveAttribute("aria-checked", "mixed"); // some (apple) selected
  });

  it("is disabled", () => {
    render(<TreeSelect options={TREE} aria-label="Food" disabled />);
    expect(trigger("Food")).toHaveAttribute("aria-disabled", "true");
  });

  describe("keyboard (WAI-ARIA tree)", () => {
    const activeItem = () => {
      const id = screen.getByRole("tree").getAttribute("aria-activedescendant");
      return id ? document.getElementById(id) : null;
    };

    const openTree = async () => {
      await userEvent.click(trigger("Food"));
      const tree = screen.getByRole("tree");
      tree.focus();
      return tree;
    };

    it("seeds aria-activedescendant on the first treeitem, which carries the tree semantics", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      const active = activeItem();
      expect(active).toHaveTextContent("Fruit");
      expect(active).toHaveAttribute("role", "treeitem");
      expect(active).toHaveAttribute("aria-level", "1");
      expect(active).toHaveAttribute("aria-checked", "false");
    });

    it("ArrowDown / ArrowUp / Home / End move the active treeitem", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      expect(activeItem()).toHaveTextContent("Fruit");
      await userEvent.keyboard("{ArrowDown}");
      expect(activeItem()).toHaveTextContent("Vegetable");
      await userEvent.keyboard("{ArrowUp}");
      expect(activeItem()).toHaveTextContent(/Fruit/);
      await userEvent.keyboard("{End}");
      expect(activeItem()).toHaveTextContent("Vegetable");
      await userEvent.keyboard("{Home}");
      expect(activeItem()).toHaveTextContent(/Fruit/);
    });

    it("ArrowRight expands a collapsed branch then steps in; ArrowLeft collapses / moves to parent", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-expanded", "false");
      await userEvent.keyboard("{ArrowRight}"); // expand Fruit
      expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-expanded", "true");
      await userEvent.keyboard("{ArrowRight}"); // step into first child
      expect(activeItem()).toHaveTextContent("Apple");
      await userEvent.keyboard("{ArrowLeft}"); // leaf → move to parent
      expect(activeItem()).toHaveTextContent(/Fruit/);
      await userEvent.keyboard("{ArrowLeft}"); // expanded parent → collapse
      expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-expanded", "false");
    });

    it("marks the active treeitem row with the accessible amber indicator", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      const row = activeItem()!.firstElementChild as HTMLElement;
      expect(row.className).toContain("bg-[var(--bpdm-option-active-bg)]");
      expect(row.className).toContain("shadow-[inset_2px_0_0_0_var(--bpdm-option-active-bar)]");
      expect(row.className).toContain("rtl:shadow-[inset_-2px_0_0_0_var(--bpdm-option-active-bar)]");
    });

    it("pointer move sets the hovered treeitem active, so the single highlight follows the cursor", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      expect(activeItem()).toHaveTextContent(/Fruit/); // seeded on the first row
      const vegRow = screen.getByRole("treeitem", { name: /Vegetable/ })
        .firstElementChild as HTMLElement;
      await userEvent.hover(vegRow);
      expect(activeItem()).toHaveTextContent("Vegetable"); // amber moved to the hovered row
    });

    it("Enter / Space toggle selection (aria-checked) of the active treeitem", async () => {
      render(<TreeSelect options={TREE} aria-label="Food" selectAll={false} />);
      await openTree();
      await userEvent.keyboard(" "); // select all Fruit leaves
      expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-checked", "true");
      await userEvent.keyboard("{Enter}"); // toggle off
      expect(screen.getByRole("treeitem", { name: /Fruit/ })).toHaveAttribute("aria-checked", "false");
    });
  });
});
