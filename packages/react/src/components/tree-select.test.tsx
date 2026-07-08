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
});
