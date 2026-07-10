import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./data-table";

interface Row {
  id: string;
  name: string;
  tasks: number;
}

const DATA: Row[] = [
  { id: "a", name: "Milo", tasks: 30 },
  { id: "b", name: "Ava", tasks: 10 },
  { id: "c", name: "Sara", tasks: 20 },
];

const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
];

const rowKey = (r: Row) => r.id;

// first-column text of every body row (name column when there's no selection)
const firstCol = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("tbody tr")).map((tr) => tr.querySelector("td")?.textContent?.trim());
const bodyRowCount = (c: HTMLElement) => c.querySelectorAll("tbody tr").length;

describe("DataTable", () => {
  it("renders a row per data item with header labels", () => {
    const { container } = render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} />);
    expect(bodyRowCount(container)).toBe(3);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /Tasks/ })).toBeTruthy();
  });

  it("cycles a sortable header asc → desc → off", async () => {
    const { container } = render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} />);
    const nameBtn = screen.getByRole("button", { name: "Name" });

    await userEvent.click(nameBtn);
    expect(firstCol(container)).toEqual(["Ava", "Milo", "Sara"]); // asc

    await userEvent.click(nameBtn);
    expect(firstCol(container)).toEqual(["Sara", "Milo", "Ava"]); // desc

    await userEvent.click(nameBtn);
    expect(firstCol(container)).toEqual(["Milo", "Ava", "Sara"]); // back to source order
  });

  it("sets aria-sort on the active sortable header", async () => {
    render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} />);
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    await userEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  });

  it("selects rows and reports keys; header select-all toggles every row", async () => {
    const onSelectionChange = vi.fn();
    render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} selectable onSelectionChange={onSelectionChange} />);
    const checkboxes = screen.getAllByRole("checkbox"); // [0] = select-all, then one per row
    await userEvent.click(checkboxes[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a"], expect.arrayContaining([expect.objectContaining({ id: "a" })]));

    await userEvent.click(checkboxes[0]);
    const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1]!;
    expect(lastCall[0].slice().sort()).toEqual(["a", "b", "c"]);
  });

  it("global search filters rows across columns", async () => {
    const { container } = render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} searchable />);
    await userEvent.type(screen.getByRole("textbox", { name: "Search" }), "ava");
    expect(firstCol(container)).toEqual(["Ava"]);
  });

  it("client pagination slices to the page size", () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} pagination={{ pageSize: 2 }} />,
    );
    expect(bodyRowCount(container)).toBe(2);
    expect(container.textContent).toContain("Showing 1–2 of 3");
  });

  it("shows the empty state when there is no data", () => {
    const { container } = render(<DataTable columns={COLUMNS} data={[]} rowKey={rowKey} />);
    expect(container.textContent).toContain("No data");
  });

  it("applies a multi-column defaultSort with numbered order badges", () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        rowKey={rowKey}
        multiSort
        defaultSort={[
          { id: "name", dir: "desc" },
          { id: "tasks", dir: "asc" },
        ]}
      />,
    );
    expect(firstCol(container)).toEqual(["Sara", "Milo", "Ava"]); // name desc
    const badges = Array.from(container.querySelectorAll("thead th span")).filter((s) =>
      /^[12]$/.test(s.textContent?.trim() ?? ""),
    );
    expect(badges.length).toBe(2);
  });

  it("auto-expands rows from defaultExpandedKeys and renders the panel", () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        rowKey={rowKey}
        defaultExpandedKeys={["b"]}
        renderExpanded={(r) => <span className="detail">detail for {r.name}</span>}
      />,
    );
    const detail = container.querySelector(".detail");
    expect(detail?.textContent).toContain("detail for Ava"); // key 'b' = Ava
  });

  it("does not filter internally when filters are controlled (server-side)", async () => {
    // controlled filters → the table shows the funnel but leaves `data` untouched
    const onFiltersChange = vi.fn();
    const cols: DataTableColumn<Row>[] = [
      { id: "name", header: "Name", filterable: true, accessor: (r) => r.name },
      { id: "tasks", header: "Tasks", numeric: true, accessor: (r) => r.tasks },
    ];
    const { container } = render(
      <DataTable columns={cols} data={DATA} rowKey={rowKey} filters={{ name: { matchMode: "all", rules: [{ op: "equals", value: "zzz" }] } }} onFiltersChange={onFiltersChange} />,
    );
    // even with a non-matching controlled filter, all rows stay (parent owns filtering)
    expect(bodyRowCount(container)).toBe(3);
  });

  // --- hardening: i18n `messages`, `getRowLabel`, aria-live, pagination <nav> ---

  it("uses `messages` to translate the empty/no-results text and the search label", async () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        rowKey={rowKey}
        searchable
        pagination={{ pageSize: 2 }}
        messages={{ noResults: "Keine Ergebnisse", search: "Suchen" }}
      />,
    );
    // custom search label overrides the built-in "Search"
    const search = screen.getByRole("textbox", { name: "Suchen" });
    // filter everything out → the footer shows the translated no-results string
    await userEvent.type(search, "zzz");
    expect(container.textContent).toContain("Keine Ergebnisse");
  });

  it("names each row's selection checkbox via `getRowLabel`", () => {
    render(
      <DataTable
        columns={COLUMNS}
        data={DATA}
        rowKey={rowKey}
        selectable
        getRowLabel={(r) => r.name}
      />,
    );
    // each row checkbox's accessible name is "Select row: {name}"
    expect(screen.getByRole("checkbox", { name: /Select row: Milo/ })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: /Select row: Ava/ })).toBeTruthy();
  });

  it("renders a polite aria-live status region for announcements", () => {
    render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("wraps client pagination in an accessible <nav> with numbered page buttons", () => {
    render(<DataTable columns={COLUMNS} data={DATA} rowKey={rowKey} pagination={{ pageSize: 2 }} />);
    expect(screen.getByRole("navigation", { name: /pagination/i })).toBeTruthy();
    // 3 rows / pageSize 2 → pages 1 and 2, each a numbered "Go to page N" button
    expect(screen.getByRole("button", { name: /go to page 2/i })).toBeTruthy();
  });

  it("applies a per-column text filter from the header filter menu", async () => {
    const cols: DataTableColumn<Row>[] = [
      { id: "name", header: "Name", filterable: true, accessor: (r) => r.name },
      { id: "tasks", header: "Tasks", numeric: true, accessor: (r) => r.tasks },
    ];
    const { container } = render(<DataTable columns={cols} data={DATA} rowKey={rowKey} />);
    // open the "Filter column" menu on the Name column
    await userEvent.click(screen.getByRole("button", { name: "Filter column" }));
    // default operator is "contains"; type a value and apply
    await userEvent.type(screen.getByPlaceholderText("Value"), "av");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(firstCol(container)).toEqual(["Ava"]);
  });
});
