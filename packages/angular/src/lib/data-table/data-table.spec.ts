import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmDataTable } from "./data-table";
import type { DataTableColumn, DataTablePagination } from "./data-table-types";

interface Row {
  id: string;
  name: string;
  tasks: number;
}

const DATA: Row[] = [
  { id: "a", name: "Hugo", tasks: 30 },
  { id: "b", name: "Ava", tasks: 10 },
  { id: "c", name: "Sara", tasks: 20 },
];

const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
];

@Component({
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns"
      [data]="data()"
      [rowKey]="rowKey"
      [selectable]="selectable"
      [searchable]="searchable"
      [pagination]="pagination"
      (selectionChange)="lastSelection.set($event.keys)"
    />
  `,
})
class Host {
  readonly columns = COLUMNS;
  readonly data = signal<Row[]>(DATA);
  readonly rowKey = (r: Row) => r.id;
  selectable = false;
  searchable = false;
  pagination: DataTablePagination | undefined = undefined;
  readonly lastSelection = signal<(string | number)[]>([]);
}

describe("BpdmDataTable", () => {
  const bodyRows = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll("tbody tr"));
  const cellText = (f: { nativeElement: HTMLElement }) =>
    bodyRows(f).map((tr) => (tr.querySelector("td") as HTMLElement)?.textContent?.trim());

  it("renders a row per data item with header labels", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(bodyRows(fixture).length).toBe(3);
    const heads = Array.from(fixture.nativeElement.querySelectorAll("thead th")).map((th) =>
      (th as HTMLElement).textContent?.trim(),
    );
    expect(heads).toContain("Name");
    expect(heads).toContain("Tasks");
  });

  it("cycles a sortable header asc → desc → off", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const nameSortBtn = (fixture.nativeElement.querySelectorAll("thead th button")[0]) as HTMLButtonElement;

    nameSortBtn.click();
    fixture.detectChanges();
    expect(cellText(fixture)).toEqual(["Ava", "Hugo", "Sara"]); // asc

    nameSortBtn.click();
    fixture.detectChanges();
    expect(cellText(fixture)).toEqual(["Sara", "Hugo", "Ava"]); // desc

    nameSortBtn.click();
    fixture.detectChanges();
    expect(cellText(fixture)).toEqual(["Hugo", "Ava", "Sara"]); // back to source order
  });

  it("selects rows and reports keys; header select-all toggles every row", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.selectable = true;
    fixture.detectChanges();
    const checkboxes = fixture.nativeElement.querySelectorAll('[role="checkbox"]');
    // [0] is the header select-all, then one per row
    (checkboxes[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSelection()).toEqual(["a"]);

    (checkboxes[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSelection().sort()).toEqual(["a", "b", "c"]);
  });

  it("global search filters rows across columns", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.searchable = true;
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('input[aria-label="Search"]') as HTMLInputElement;
    search.value = "ava";
    search.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(cellText(fixture)).toEqual(["Ava"]);
  });

  it("client pagination slices to the page size", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.pagination = { pageSize: 2 };
    fixture.detectChanges();
    expect(bodyRows(fixture).length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain("Showing 1–2 of 3");
  });

  it("shows the empty state when there is no data", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.data.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("No data");
  });
});
