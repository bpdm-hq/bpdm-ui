import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { DataTable, type DataTableColumn } from "./data-table";
import { Tabs, type TabItem } from "./tabs";
import { Input } from "./input";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Accordion } from "./accordion";

/**
 * SSR guard: server-rendering must not log any React dev warning — the
 * controlled/uncontrolled and hydration-mismatch families in particular. We
 * render the layout-effect users (DataTable, Tabs — which use
 * `useIsomorphicLayoutEffect` defensively) plus a spread of common components
 * through `renderToString` with console.error/warn spied, and assert silence.
 *
 * Note: React 19's `renderToString` does NOT emit the classic "useLayoutEffect
 * does nothing on the server" warning, and this test runs under jsdom (where
 * `window` exists, so the isomorphic hook resolves to useLayoutEffect anyway),
 * so this suite does not by itself exercise that specific path — the isomorphic
 * hook stays as defensive best-practice for older React / non-jsdom SSR. What
 * this suite reliably catches is any controlled/uncontrolled or hydration
 * warning regression on the server render.
 */

interface Row {
  id: string;
  name: string;
  tasks: number;
}
const DATA: Row[] = [
  { id: "a", name: "Milo", tasks: 30 },
  { id: "b", name: "Ava", tasks: 10 },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
];

const TAB_ITEMS: TabItem[] = [
  { value: "a", label: "Overview", content: <p>Overview body</p> },
  { value: "b", label: "Activity", content: <p>Activity body</p> },
];

describe("SSR console cleanliness", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  const cases: Array<[string, () => string]> = [
    ["DataTable (useLayoutEffect user)", () => renderToString(<DataTable columns={COLUMNS} data={DATA} rowKey={(r) => r.id} />)],
    ["Tabs (useLayoutEffect user)", () => renderToString(<Tabs items={TAB_ITEMS} defaultValue="a" />)],
    ["Input", () => renderToString(<Input placeholder="Email" />)],
    [
      "Card",
      () =>
        renderToString(
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent>Body</CardContent>
          </Card>,
        ),
    ],
    [
      "Accordion",
      () =>
        renderToString(
          <Accordion items={[{ value: "1", title: "Q1", content: "A1" }]} defaultValue="1" />,
        ),
    ],
  ];

  it.each(cases)("renders %s on the server without warnings", (_label, render) => {
    const html = render();
    expect(html.length).toBeGreaterThan(0);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
