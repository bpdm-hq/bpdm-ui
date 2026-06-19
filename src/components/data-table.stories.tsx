import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { DataTable, type DataTableColumn } from "./data-table";
import { Button } from "./button";

const usage = `
Data-driven table. Describe \`columns\` once and pass an array of \`data\` — the
table renders the rest. Density (\`sm\`/\`md\`/\`lg\`), \`striped\`, \`bordered\`,
\`hoverable\`, \`frame\`, \`divided\`, \`rowSpacing\`, \`stickyHeader\` + \`maxHeight\`,
empty state, and \`onRowClick\` are all props. Opt into sorting, selection,
pagination, expandable rows, frozen columns, a column toggle, global search, and
per-column filters. The wrapper scrolls horizontally, so it is responsive by default.

A complete, copy-paste setup:

\`\`\`tsx
import { DataTable, type DataTableColumn } from "@bpdm/ui";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "disabled";
  tasks: number;
};

const columns: DataTableColumn<Member>[] = [
  // text cell from a row field
  { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
  // custom node cell — give sortAccessor so sort + search/filter have a value
  { id: "email", header: "Email",
    accessor: (r) => <span className="font-mono text-xs">{r.email}</span>,
    sortAccessor: (r) => r.email },
  // "select" filter → pick from the column's distinct values
  { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
  // centered badge cell
  { id: "status", header: "Status", align: "center", filterable: true, filterType: "select",
    cell: (r) => <StatusBadge status={r.status} />, sortAccessor: (r) => r.status },
  // numeric → right-aligned, tabular figures, numeric filter ops
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
];

<DataTable
  columns={columns}
  data={members}
  rowKey={(r) => r.id}          // stable key → selection/expansion survive sorting
  selectable                     // checkbox column + select-all
  searchable                     // global search box in the toolbar
  columnToggle                   // "Columns" show/hide control
  stickyHeader
  pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
  onSelectionChange={(keys, rows) => console.log(keys, rows)}
/>
\`\`\`

Each example below focuses on one feature; combine the props freely.
`;

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  team: "Engineering" | "Design" | "Marketing" | "Support";
  status: "active" | "invited" | "disabled";
  joined: string;
  tasks: number;
};

const MEMBERS: Member[] = [
  { id: "m_01", name: "Hugo Lindberg", email: "hugo@example.com", role: "Owner", team: "Engineering", status: "active", joined: "2025-02-14", tasks: 128 },
  { id: "m_02", name: "Leo Martins", email: "leo@example.com", role: "Admin", team: "Design", status: "invited", joined: "2025-03-02", tasks: 0 },
  { id: "m_03", name: "Sara Kovač", email: "sara@example.com", role: "Editor", team: "Engineering", status: "active", joined: "2025-03-19", tasks: 86 },
  { id: "m_04", name: "Noah Bauer", email: "noah@example.com", role: "Viewer", team: "Support", status: "disabled", joined: "2025-04-08", tasks: 12 },
  { id: "m_05", name: "Ava Nguyen", email: "ava@example.com", role: "Editor", team: "Marketing", status: "active", joined: "2025-04-21", tasks: 54 },
  { id: "m_06", name: "Ivan Petrov", email: "ivan@example.com", role: "Admin", team: "Engineering", status: "active", joined: "2025-05-05", tasks: 203 },
  { id: "m_07", name: "Emma Rossi", email: "emma@example.com", role: "Editor", team: "Design", status: "invited", joined: "2025-05-12", tasks: 0 },
  { id: "m_08", name: "Omar Haddad", email: "omar@example.com", role: "Viewer", team: "Support", status: "active", joined: "2025-05-20", tasks: 31 },
  { id: "m_09", name: "Lucy Chen", email: "lucy@example.com", role: "Editor", team: "Marketing", status: "disabled", joined: "2025-06-01", tasks: 47 },
  { id: "m_10", name: "Finn O'Brien", email: "finn@example.com", role: "Admin", team: "Engineering", status: "active", joined: "2025-06-09", tasks: 165 },
  { id: "m_11", name: "Nora Schmidt", email: "nora@example.com", role: "Viewer", team: "Design", status: "active", joined: "2025-06-15", tasks: 9 },
  { id: "m_12", name: "Diego Silva", email: "diego@example.com", role: "Editor", team: "Support", status: "invited", joined: "2025-06-22", tasks: 0 },
];

// a larger dataset for the paging demos
const MANY: Member[] = Array.from({ length: 23 }, (_, i) => {
  const base = MEMBERS[i % MEMBERS.length];
  return {
    ...base,
    id: `m_p${(i + 1).toString().padStart(2, "0")}`,
    tasks: (base.tasks + i * 7) % 240,
  };
});

// 10,000 rows for the virtualization demo
const HUGE: Member[] = Array.from({ length: 10000 }, (_, i) => {
  const base = MEMBERS[i % MEMBERS.length];
  return {
    ...base,
    id: `v_${i}`,
    name: `${base.name.split(" ")[0]} #${i + 1}`,
    tasks: (base.tasks + i * 3) % 300,
  };
});

const STATUS_STYLE: Record<Member["status"], string> = {
  active: "bg-success/15 text-success",
  invited: "bg-primary/15 text-primary",
  disabled: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: Member["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

// a richer expanded panel: task activity + member details
function MemberDetails({ member }: { member: Member }) {
  const assigned = member.tasks;
  const completed = Math.round(assigned * 0.7);
  const open = assigned - completed;
  const detail: [string, React.ReactNode][] = [
    ["Email", <span className="font-mono text-xs">{member.email}</span>],
    ["Role", member.role],
    ["Team", member.team],
    ["Joined", member.joined],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Task activity
        </p>
        <dl className="space-y-2 text-sm tabular-nums">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Assigned</dt>
            <dd>{assigned}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Completed</dt>
            <dd className="text-success">{completed}</dd>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Open</dt>
            <dd>{open}</dd>
          </div>
        </dl>
      </section>
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Details
          </p>
          <StatusBadge status={member.status} />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {detail.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
  { id: "email", header: "Email", accessor: (r) => <span className="font-mono text-xs">{r.email}</span>, sortAccessor: (r) => r.email },
  { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
  { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
  { id: "status", header: "Status", align: "center", sortable: true, cell: (r) => <StatusBadge status={r.status} />, sortAccessor: (r) => r.status },
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks, sortAccessor: (r) => r.tasks },
];

const meta: Meta<typeof DataTable<Member>> = {
  title: "Data Display/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Playground</h2>
          <Primary />
          <Controls />
          <h2>Examples</h2>
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    striped: { control: "boolean" },
    bordered: { control: "boolean" },
    frame: { control: "boolean" },
    divided: { control: "boolean" },
    hoverable: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    multiSort: { control: "boolean" },
    selectable: { control: "boolean" },
    selectionMode: { control: "inline-radio", options: ["multiple", "single"] },
    expandMode: { control: "inline-radio", options: ["single", "multiple"] },
    pinnable: { control: "boolean" },
    columns: { table: { disable: true } },
    data: { table: { disable: true } },
    rowKey: { table: { disable: true } },
    pagination: { table: { disable: true } },
    renderExpanded: { table: { disable: true } },
  },
  // rowKey keeps selection stable across re-sorts (keyed by id, not row position)
  args: { columns, data: MEMBERS, size: "md", rowKey: (r: Member) => r.id },
};
export default meta;

type Story = StoryObj<typeof DataTable<Member>>;

export const Playground: Story = {};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: { source: { code: `<DataTable size="sm" columns={columns} data={data} />` } },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s}>
          <p className="mb-1.5 font-mono text-xs text-muted-foreground">size=&quot;{s}&quot;</p>
          <DataTable {...args} size={s} />
        </div>
      ))}
    </div>
  ),
};

export const StripedAndBordered: Story = {
  tags: ["!dev"],
  args: { striped: true, bordered: true },
  parameters: {
    docs: { source: { code: `<DataTable striped bordered columns={columns} data={data} />` } },
  },
};

// cap the height → header stays put while rows scroll
export const StickyHeaderScroll: Story = {
  tags: ["!dev"],
  args: { stickyHeader: true, maxHeight: 240 },
  parameters: {
    docs: {
      source: { code: `<DataTable stickyHeader maxHeight={240} columns={columns} data={data} />` },
    },
  },
  render: (args) => (
    <DataTable
      {...args}
      data={[...MEMBERS, ...MEMBERS, ...MEMBERS].map((m, i) => ({ ...m, id: `${m.id}_${i}` }))}
    />
  ),
};

export const Clickable: Story = {
  tags: ["!dev"],
  parameters: {
    docs: { source: { code: `<DataTable onRowClick={(row) => openMember(row.id)} columns={columns} data={data} />` } },
  },
  render: (args) => (
    <DataTable {...args} onRowClick={(row) => window.alert(`Opened ${row.name}`)} />
  ),
};

// Single-column: starts unsorted. Click a header to cycle asc → desc → off.
// Clicking a different header REPLACES the sort — only one arrow is ever active.
export const Sorting: Story = {
  parameters: {
    docs: {
      source: {
        code: `<DataTable columns={columns} data={data} />
// columns marked { sortable: true } — click a header to sort`,
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs text-muted-foreground">
        Click any sortable header (Name / Role / Team / Status / Tasks). Only one
        column sorts at a time.
      </p>
      <DataTable {...args} />
    </div>
  ),
};

// Multi-column: pre-sorted by Status, then Tasks — note the numbered badges
// (1, 2) showing the order. Shift+click another header to add it to the sort.
export const MultiColumnSort: Story = {
  tags: ["!dev"],
  args: {
    multiSort: true,
    bordered: true,
    defaultSort: [
      { id: "status", dir: "asc" },
      { id: "tasks", dir: "desc" },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  multiSort
  defaultSort={[{ id: "status", dir: "asc" }, { id: "tasks", dir: "desc" }]}
/>
// Shift+click another header to add it to the sort`,
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
        Sorted by Status ➊, then Tasks ➋ — rows group by status, and Tasks
        orders the rows <em>within</em> each status block (that is what a
        secondary sort does). Shift+click a header to add a column; click without
        Shift to reset to one.
      </p>
      <DataTable {...args} />
    </div>
  ),
};

// checkbox column + header select-all (indeterminate when only some are picked).
// Selection is keyed by `rowKey`, so it survives sorting.
export const RowSelection: Story = {
  args: { selectable: true, defaultSelectedKeys: ["m_03", "m_06"] },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  selectable
  defaultSelectedKeys={["m_03", "m_06"]}
  onSelectionChange={(keys, rows) => console.log(keys, rows)}
/>`,
      },
    },
  },
};

// single-select: radios instead of checkboxes, no select-all
export const SingleSelection: Story = {
  tags: ["!dev"],
  args: { selectable: true, selectionMode: "single", defaultSelectedKeys: ["m_03"] },
  parameters: {
    docs: {
      source: {
        code: `<DataTable columns={columns} data={data} rowKey={(r) => r.id} selectable selectionMode="single" />`,
      },
    },
  },
};

// controlled selection driving a bulk-action toolbar
export const SelectionToolbar: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `const [selected, setSelected] = useState<React.Key[]>([]);

<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  selectable
  selectedKeys={selected}
  onSelectionChange={(keys) => setSelected(keys)}
/>`,
      },
    },
  },
  render: (args) => {
    const Demo = () => {
      const [selected, setSelected] = useState<React.Key[]>([]);
      return (
        <div className="flex flex-col gap-3">
          <div className="flex h-9 items-center gap-3">
            {selected.length > 0 ? (
              <>
                <span className="text-sm font-medium">{selected.length} selected</span>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="rounded-lg border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground"
                >
                  Remove
                </button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Select rows to act on them.
              </span>
            )}
          </div>
          <DataTable
            {...args}
            selectable
            selectedKeys={selected}
            onSelectionChange={(keys) => setSelected(keys)}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

// client-side: the table slices the data itself — numbered pages, a range
// summary, and a page-size selector
export const ClientSidePaging: Story = {
  args: {
    data: MANY,
    pagination: { pageSize: 5, pageSizeOptions: [5, 10, 25] },
  },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 25] }}
/>`,
      },
    },
  },
};

// server-side offset paging: the parent owns the page and passes only that
// page's rows; total drives the page count
export const ServerSidePaging: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `const pageSize = 5;
const [page, setPage] = useState(1);
const rows = await fetchPage(page, pageSize); // your server call

<DataTable
  columns={columns}
  data={rows}
  rowKey={(r) => r.id}
  pagination={{ mode: "server", page, pageSize, total, onPageChange: setPage }}
/>`,
      },
    },
  },
  render: (args) => {
    const Demo = () => {
      const pageSize = 5;
      const [page, setPage] = useState(1);
      const rows = MANY.slice((page - 1) * pageSize, page * pageSize);
      return (
        <DataTable
          {...args}
          data={rows}
          rowKey={(r) => r.id}
          pagination={{ mode: "server", page, pageSize, total: MANY.length, onPageChange: setPage }}
        />
      );
    };
    return <Demo />;
  },
};

// cursor paging: no page numbers — only Prev / Next, driven by hasNext/hasPrev
export const CursorPaging: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={rows}
  rowKey={(r) => r.id}
  pagination={{
    mode: "cursor",
    hasPreviousPage: !!prevCursor,
    hasNextPage: !!nextCursor,
    onPreviousPage: () => loadBefore(prevCursor),
    onNextPage: () => loadAfter(nextCursor),
    rangeLabel: "Showing 1–5",
  }}
/>`,
      },
    },
  },
  render: (args) => {
    const Demo = () => {
      const pageSize = 5;
      const [start, setStart] = useState(0);
      const rows = MANY.slice(start, start + pageSize);
      return (
        <DataTable
          {...args}
          data={rows}
          rowKey={(r) => r.id}
          pagination={{
            mode: "cursor",
            hasPreviousPage: start > 0,
            hasNextPage: start + pageSize < MANY.length,
            onPreviousPage: () => setStart(Math.max(0, start - pageSize)),
            onNextPage: () => setStart(start + pageSize),
            rangeLabel: `Showing ${start + 1}–${Math.min(start + pageSize, MANY.length)}`,
          }}
        />
      );
    };
    return <Demo />;
  },
};

// each row expands to a detail panel; keyed by rowKey so it survives sorting.
// Use expandMode="single" to keep only one row open at a time.
export const ExpandableRows: Story = {
  args: {
    rowKey: (r: Member) => r.id,
    defaultExpandedKeys: ["m_03"],
    renderExpanded: (row: Member) => <MemberDetails member={row} />,
  },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  renderExpanded={(row) => <MemberDetails member={row} />}
  defaultExpandedKeys={["m_03"]}
  // expandMode="single" to keep only one row open
/>`,
      },
    },
  },
};

// borderless look: no outer frame, no striping, no hover, taller rows — every
// appearance knob is configurable. Pagination centered + detached below.
export const Borderless: Story = {
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={rows}
  rowKey={(r) => r.id}
  frame={false}          // no outer border / rounding
  hoverable={false}      // no row hover
  rowSpacing={4}         // thin gap between filled row blocks
  cellClassName="py-4"   // taller rows
  // default fill is bg-muted/50 — override with rowClassName
  pagination={{
    mode: "cursor",
    align: "center",
    hasPreviousPage, hasNextPage, onPreviousPage, onNextPage,
    pageSize, pageSizeOptions: [10, 25, 50], onPageSizeChange,
  }}
/>`,
      },
    },
  },
  render: (args) => {
    const Demo = () => {
      const [start, setStart] = useState(0);
      const [size, setSize] = useState(10);
      const rows = MANY.slice(start, start + size);
      return (
        <DataTable
          {...args}
          data={rows}
          rowKey={(r) => r.id}
          frame={false}
          hoverable={false}
          rowSpacing={4}
          cellClassName="py-4"
          pagination={{
            mode: "cursor",
            align: "center",
            hasPreviousPage: start > 0,
            hasNextPage: start + size < MANY.length,
            onPreviousPage: () => setStart(Math.max(0, start - size)),
            onNextPage: () => setStart(start + size),
            pageSize: size,
            pageSizeOptions: [10, 25, 50],
            onPageSizeChange: (s) => {
              setSize(s);
              setStart(0);
            },
          }}
        />
      );
    };
    return <Demo />;
  },
};

// pin any number of columns to the edges while the middle scrolls horizontally.
// Here Name + Role are pinned left and Actions is pinned right (and the selection
// column auto-pins left). Pin more by adding pin + a numeric width to each, with
// left-pinned columns first and right-pinned last in the array.
export const FrozenColumns: Story = {
  args: { selectable: true },
  parameters: {
    docs: {
      source: {
        code: `const columns: DataTableColumn<Member>[] = [
  // left-pinned block (pin as many as you like; give each a numeric width)
  { id: "name", header: "Name", pin: "left", width: 180, sortable: true, accessor: (r) => r.name },
  { id: "role", header: "Role", pin: "left", width: 120, sortable: true, accessor: (r) => r.role },
  // middle columns — these scroll horizontally
  { id: "email", header: "Email", width: 220, accessor: (r) => <span className="font-mono text-xs">{r.email}</span> },
  { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
  { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
  { id: "status", header: "Status", width: 120, align: "center", cell: (r) => <StatusBadge status={r.status} /> },
  { id: "tasks", header: "Tasks", width: 100, numeric: true, sortable: true, accessor: (r) => r.tasks },
  // right-pinned block (last in the array)
  { id: "actions", header: "", pin: "right", width: 120, align: "right",
    cell: () => <Button size="sm" variant="ghost">View</Button> },
];

<DataTable columns={columns} data={data} rowKey={(r) => r.id} selectable />`,
      },
    },
  },
  render: (args) => {
    const frozen: DataTableColumn<Member>[] = [
      { id: "name", header: "Name", pin: "left", width: 180, sortable: true, accessor: (r) => r.name },
      { id: "role", header: "Role", pin: "left", width: 120, sortable: true, accessor: (r) => r.role },
      { id: "email", header: "Email", width: 220, accessor: (r) => <span className="font-mono text-xs">{r.email}</span> },
      { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
      { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
      { id: "status", header: "Status", width: 120, align: "center", cell: (r) => <StatusBadge status={r.status} /> },
      { id: "tasks", header: "Tasks", width: 100, numeric: true, sortable: true, accessor: (r) => r.tasks },
      {
        id: "actions",
        header: "",
        pin: "right",
        width: 120,
        align: "right",
        cell: () => (
          <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
            View
          </Button>
        ),
      },
    ];
    return (
      <div className="max-w-3xl">
        <DataTable {...args} columns={frozen} />
      </div>
    );
  },
};

// interactive freezing: with `pinnable`, every header gets a ⋮ menu —
// Pin left / Pin right / Unpin — so users freeze columns themselves at runtime.
// Nothing is pinned to start; open a menu and pin a column.
export const PinnableColumns: Story = {
  tags: ["!dev"],
  args: { selectable: true, pinnable: true },
  parameters: {
    docs: {
      source: {
        code: `<DataTable columns={columns} data={data} rowKey={(r) => r.id} pinnable selectable />
// click the ⋮ on any header → Pin left / Pin right / Unpin`,
      },
    },
  },
  render: (args) => {
    const cols: DataTableColumn<Member>[] = [
      { id: "name", header: "Name", width: 180, sortable: true, accessor: (r) => r.name },
      { id: "email", header: "Email", width: 220, accessor: (r) => <span className="font-mono text-xs">{r.email}</span> },
      { id: "role", header: "Role", width: 120, sortable: true, accessor: (r) => r.role },
      { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
      { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
      { id: "status", header: "Status", width: 120, align: "center", cell: (r) => <StatusBadge status={r.status} /> },
      { id: "tasks", header: "Tasks", width: 110, numeric: true, sortable: true, accessor: (r) => r.tasks },
    ];
    return (
      <div className="max-w-3xl">
        <DataTable {...args} columns={cols} />
      </div>
    );
  },
};

// per-column filtering: click the funnel on a header. Three filter types —
// text (Contains/Starts with/… + match all/any + add rule), number (=, >, ≥, …),
// and select (pick from the column's distinct values). Combines with global
// search; Clear resets everything.
export const ColumnFilters: Story = {
  args: { searchable: true, pagination: { pageSize: 5 } },
  parameters: {
    docs: {
      source: {
        code: `const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
  { id: "email", header: "Email", filterable: true,
    accessor: (r) => <span className="font-mono text-xs">{r.email}</span>,
    sortAccessor: (r) => r.email },
  { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
  { id: "team", header: "Team", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.team },
  { id: "status", header: "Status", align: "center", filterable: true, filterType: "select",
    cell: (r) => <StatusBadge status={r.status} />, sortAccessor: (r) => r.status },
  { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
];

<DataTable columns={columns} data={data} searchable pagination={{ pageSize: 5 }} />`,
      },
    },
  },
  render: (args) => {
    const cols: DataTableColumn<Member>[] = [
      { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
      { id: "email", header: "Email", filterable: true, accessor: (r) => <span className="font-mono text-xs">{r.email}</span>, sortAccessor: (r) => r.email },
      { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
      { id: "team", header: "Team", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.team },
      { id: "status", header: "Status", align: "center", filterable: true, filterType: "select", cell: (r) => <StatusBadge status={r.status} />, sortAccessor: (r) => r.status },
      { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
    ];
    return <DataTable {...args} data={MANY} columns={cols} />;
  },
};

// global search + toolbar: type to filter rows across all columns; Clear resets.
// Pairs with columnToggle in one toolbar. Pagination/sort reflect the filtered set.
export const Search: Story = {
  tags: ["!dev"],
  args: { searchable: true, columnToggle: true, pagination: { pageSize: 5 } },
  parameters: {
    docs: {
      source: {
        code: `<DataTable columns={columns} data={data} searchable columnToggle pagination={{ pageSize: 5 }} />`,
      },
    },
  },
};

// show/hide columns from a "Columns" control above the table (dogfoods MultiSelect).
// Opt a column out of the toggle with { hideable: false }.
export const ColumnToggle: Story = {
  tags: ["!dev"],
  args: { columnToggle: true },
  parameters: {
    docs: {
      source: {
        code: `<DataTable columnToggle columns={columns} data={data} />
// keep a column always visible: { id: "name", hideable: false, … }`,
      },
    },
  },
};

// a summary row pinned to the bottom. Each column's `footer` is a node or a
// function given the filtered rows (all pages) — compute sums, counts, averages.
export const FooterSummary: Story = {
  tags: ["!dev"],
  args: { pagination: { pageSize: 6 } },
  parameters: {
    docs: {
      source: {
        code: `const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", accessor: (r) => r.name, footer: "Total" },
  { id: "team", header: "Team", accessor: (r) => r.team },
  { id: "status", header: "Status", align: "center",
    cell: (r) => <StatusBadge status={r.status} />,
    footer: (rows) => \`\${rows.filter((r) => r.status === "active").length} active\` },
  { id: "tasks", header: "Tasks", numeric: true, accessor: (r) => r.tasks,
    footer: (rows) => rows.reduce((s, r) => s + r.tasks, 0).toLocaleString() },
];

<DataTable columns={columns} data={data} pagination={{ pageSize: 6 }} />`,
      },
    },
  },
  render: (args) => {
    const cols: DataTableColumn<Member>[] = [
      { id: "name", header: "Name", sortable: true, accessor: (r) => r.name, footer: <span className="text-muted-foreground">Total</span> },
      { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
      { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
      {
        id: "status",
        header: "Status",
        align: "center",
        cell: (r) => <StatusBadge status={r.status} />,
        footer: (rows) => (
          <span className="text-muted-foreground">
            {rows.filter((r) => r.status === "active").length} active
          </span>
        ),
      },
      {
        id: "tasks",
        header: "Tasks",
        numeric: true,
        sortable: true,
        accessor: (r) => r.tasks,
        footer: (rows) => rows.reduce((s, r) => s + r.tasks, 0).toLocaleString(),
      },
    ];
    return <DataTable {...args} columns={cols} />;
  },
};

// below 640px each row stacks into a label/value card (no horizontal scroll).
// Resize the window under ~640px (or pick a mobile viewport) to see it.
export const Responsive: Story = {
  tags: ["!dev"],
  args: { responsive: true, selectable: true, pagination: { pageSize: 5 } },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  responsive          // < 640px → each row becomes a stacked card
  selectable
  pagination={{ pageSize: 5 }}
/>`,
      },
    },
  },
};

// drag a column header onto another to reorder columns (native drag-and-drop).
// Works alongside sorting/filtering; onColumnOrderChange reports the new order.
export const ColumnReorder: Story = {
  args: { reorderableColumns: true },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  reorderableColumns
  onColumnOrderChange={(order) => console.log(order)}
/>`,
      },
    },
  },
};

// drag the ☰ handle to reorder rows (needs rowKey). onRowReorder gives the new
// data order. Best used without an active sort, which would override the order.
export const RowReorder: Story = {
  tags: ["!dev"],
  args: { reorderableRows: true },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={data}
  rowKey={(r) => r.id}
  reorderableRows
  onRowReorder={(rows) => setData(rows)}
/>`,
      },
    },
  },
};

// 10,000 rows, only the visible ones in the DOM (virtualized). Scrolls smoothly;
// sorting/search/selection still work across the whole set. Pagination is ignored.
export const Virtualized: Story = {
  args: { virtualized: true, maxHeight: 440, selectable: true, searchable: true },
  parameters: {
    docs: {
      source: {
        code: `<DataTable
  columns={columns}
  data={tenThousandRows}
  rowKey={(r) => r.id}
  virtualized
  maxHeight={440}
  selectable
  searchable
/>`,
      },
    },
  },
  render: (args) => <DataTable {...args} data={HUGE} />,
};

export const Empty: Story = {
  tags: ["!dev"],
  args: { data: [], emptyContent: "No members yet." },
  parameters: {
    docs: { source: { code: `<DataTable data={[]} emptyContent="No members yet." columns={columns} />` } },
  },
};
