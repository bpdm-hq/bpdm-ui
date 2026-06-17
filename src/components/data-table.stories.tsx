import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { DataTable, type DataTableColumn } from "./data-table";

const usage = `
Data-driven table. Describe \`columns\` once and pass an array of \`data\` — the
table renders the rest. Columns support custom \`cell\` renderers, alignment,
fixed widths, and a \`numeric\` flag (right-aligned, tabular figures) for money and
counts. Density (\`sm\`/\`md\`/\`lg\`), \`striped\`, \`bordered\`, \`hoverable\`,
\`stickyHeader\` + \`maxHeight\`, an empty state, and \`onRowClick\` are all props.
The wrapper scrolls horizontally on narrow screens, so it is responsive by default.

\`\`\`tsx
import { DataTable } from "@bpdm/ui";

<DataTable
  data={transactions}
  columns={[
    { id: "merchant", header: "Merchant", accessor: (r) => r.merchant },
    { id: "amount", header: "Amount", numeric: true, accessor: (r) => r.amount },
  ]}
/>
\`\`\`
`;

type Txn = {
  id: string;
  date: string;
  merchant: string;
  method: string;
  status: "settled" | "pending" | "failed" | "refunded";
  amount: number;
};

const TXNS: Txn[] = [
  { id: "tx_8f2a", date: "2026-06-14", merchant: "Northwind Co.", method: "Visa •4242", status: "settled", amount: 1240.0 },
  { id: "tx_3b9c", date: "2026-06-14", merchant: "Acme Studio", method: "SEPA", status: "pending", amount: 89.5 },
  { id: "tx_a17d", date: "2026-06-13", merchant: "Globex LLC", method: "Mastercard •8123", status: "settled", amount: 4520.75 },
  { id: "tx_5e21", date: "2026-06-13", merchant: "Initech", method: "Visa •1099", status: "failed", amount: 312.0 },
  { id: "tx_c84f", date: "2026-06-12", merchant: "Soylent Corp", method: "ACH", status: "refunded", amount: -57.2 },
  { id: "tx_2da6", date: "2026-06-12", merchant: "Umbrella Inc.", method: "Visa •7781", status: "settled", amount: 980.0 },
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const STATUS_STYLE: Record<Txn["status"], string> = {
  settled: "bg-success/15 text-success",
  pending: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: Txn["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

const columns: DataTableColumn<Txn>[] = [
  { id: "id", header: "Txn ID", accessor: (r) => <span className="font-mono text-xs">{r.id}</span> },
  { id: "date", header: "Date", accessor: (r) => r.date },
  { id: "merchant", header: "Merchant", accessor: (r) => r.merchant },
  { id: "method", header: "Method", accessor: (r) => r.method },
  { id: "status", header: "Status", align: "center", cell: (r) => <StatusBadge status={r.status} /> },
  { id: "amount", header: "Amount", numeric: true, cell: (r) => money(r.amount) },
];

const meta: Meta<typeof DataTable<Txn>> = {
  title: "Components/DataTable",
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
    hoverable: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    columns: { table: { disable: true } },
    data: { table: { disable: true } },
  },
  args: { columns, data: TXNS, size: "md" },
};
export default meta;

type Story = StoryObj<typeof DataTable<Txn>>;

export const Playground: Story = {};

export const Sizes: Story = {
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
  args: { striped: true, bordered: true },
  parameters: {
    docs: { source: { code: `<DataTable striped bordered columns={columns} data={data} />` } },
  },
};

// cap the height → header stays put while rows scroll
export const StickyHeaderScroll: Story = {
  args: { stickyHeader: true, maxHeight: 240 },
  parameters: {
    docs: {
      source: { code: `<DataTable stickyHeader maxHeight={240} columns={columns} data={data} />` },
    },
  },
  render: (args) => (
    <DataTable
      {...args}
      data={[...TXNS, ...TXNS, ...TXNS].map((t, i) => ({ ...t, id: `${t.id}_${i}` }))}
    />
  ),
};

export const Clickable: Story = {
  parameters: {
    docs: { source: { code: `<DataTable onRowClick={(row) => alert(row.id)} columns={columns} data={data} />` } },
  },
  render: (args) => (
    <DataTable {...args} onRowClick={(row) => window.alert(`Opened ${row.id}`)} />
  ),
};

export const Empty: Story = {
  args: { data: [], emptyContent: "No transactions yet." },
  parameters: {
    docs: { source: { code: `<DataTable data={[]} emptyContent="No transactions yet." columns={columns} />` } },
  },
};
