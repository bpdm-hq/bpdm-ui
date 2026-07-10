'use client';

import { type Key, type ReactNode, useState } from 'react';
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
  type ColumnFilter,
  type FilterOperator,
} from '@bpdm/ui/data-table';
import { Button } from '@bpdm/ui/button';
import { Avatar, AvatarGroup } from '@bpdm/ui/avatar';
import { Badge } from '@bpdm/ui/badge';
import { Input } from '@bpdm/ui/input';
import { ProgressBar } from '@bpdm/ui/progress';
import { Tabs } from '@bpdm/ui/tabs';

// ── shared data + helpers (neutral team dataset — no money/PII) ───────────────
type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  team: 'Engineering' | 'Design' | 'Marketing' | 'Support';
  status: 'active' | 'invited' | 'disabled';
  tasks: number;
  /** Location — shown with a flag emoji in some demos. */
  country: string;
  flag: string;
  /** A neutral "amount" (licensed seats) — no money/PII anywhere in these demos. */
  seats: number;
};

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Milo Lindberg', email: 'milo@bpdm.dev', role: 'Owner', team: 'Engineering', status: 'active', tasks: 128, country: 'Sweden', flag: '🇸🇪', seats: 24 },
  { id: 'm2', name: 'Leo Martins', email: 'leo@bpdm.dev', role: 'Admin', team: 'Design', status: 'invited', tasks: 0, country: 'Brazil', flag: '🇧🇷', seats: 8 },
  { id: 'm3', name: 'Sara Kovac', email: 'sara@bpdm.dev', role: 'Editor', team: 'Engineering', status: 'active', tasks: 86, country: 'Croatia', flag: '🇭🇷', seats: 16 },
  { id: 'm4', name: 'Noah Bauer', email: 'noah@bpdm.dev', role: 'Viewer', team: 'Support', status: 'disabled', tasks: 12, country: 'Germany', flag: '🇩🇪', seats: 4 },
  { id: 'm5', name: 'Ava Nguyen', email: 'ava@bpdm.dev', role: 'Editor', team: 'Marketing', status: 'active', tasks: 54, country: 'Vietnam', flag: '🇻🇳', seats: 12 },
  { id: 'm6', name: 'Ivan Petrov', email: 'ivan@bpdm.dev', role: 'Admin', team: 'Engineering', status: 'active', tasks: 203, country: 'Bulgaria', flag: '🇧🇬', seats: 40 },
];

/** A larger, generated set for pagination / virtualization demos. */
const BIG: Member[] = Array.from({ length: 60 }, (_, i) => {
  const base = MEMBERS[i % MEMBERS.length];
  return { ...base, id: `b${i}`, name: `${base.name.split(' ')[0]} ${i + 1}`, tasks: (i * 7) % 240 };
});

// dogfood our Badge — soft tone + status dot, tinted to the variant
const STATUS_VARIANT = {
  active: 'success',
  invited: 'warning',
  disabled: 'neutral',
} as const;

function StatusBadge({ status }: { status: Member['status'] }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} appearance="soft" dot className="capitalize">
      {status}
    </Badge>
  );
}

/**
 * Plain base columns — no feature flags. Each demo adds ONLY the one feature it
 * documents (sorting, filtering, …) so every example shows just that one thing.
 */
const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, accessor: (r) => r.tasks },
];

/** Base + `sortable` — used only by the Sorting / Multi-column sort demos. */
const sortableColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', sortable: true, accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, sortable: true, accessor: (r) => r.tasks },
];

/** Base + `filterable` — used only by the Column filters demo. */
const filterableColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', filterable: true, cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', filterable: true, filterType: 'select', accessor: (r) => r.role },
  { id: 'team', header: 'Team', filterable: true, filterType: 'select', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, filterable: true, accessor: (r) => r.tasks },
];

/** Custom-styling demo — a key column is accented via its `className`. */
const customizeColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  // a className on a column applies to its header + every cell — here a subtle accent
  { id: 'tasks', header: 'Tasks', numeric: true, accessor: (r) => r.tasks, className: 'bg-primary/[0.04]' },
];

// ── per-demo variations so each example looks a little different ───────────────
/** Selection — an AvatarGroup of collaborators. */
const teamColumns: DataTableColumn<Member>[] = [
  { id: 'member', header: 'Member', cell: (r) => <NameCell member={r} /> },
  { id: 'team', header: 'Collaborators', cell: (r) => <TeamGroup member={r} /> },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, accessor: (r) => r.tasks },
];

/** Clickable / Search — a flag + country. */
const flagColumns: DataTableColumn<Member>[] = [
  { id: 'member', header: 'Member', cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'location', header: 'Location', cell: (r) => <FlagCell member={r} />, sortAccessor: (r) => r.country },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
];

/** Pagination — a flag + a neutral "amount" (seats). */
const meteredColumns: DataTableColumn<Member>[] = [
  { id: 'member', header: 'Member', cell: (r) => <NameCell member={r} /> },
  { id: 'location', header: 'Location', cell: (r) => <FlagCell member={r} /> },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'seats', header: 'Seats', numeric: true, accessor: (r) => r.seats },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
];

/** Column toggle — an always-on icon-button actions column. */
const actionsColumns: DataTableColumn<Member>[] = [
  { id: 'member', header: 'Member', cell: (r) => <NameCell member={r} /> },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'actions', header: '', align: 'right', hideable: false, cell: (r) => <RowActions member={r} /> },
];

const key = (r: Member) => r.id;

function Box({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

// rich identity cell: dogfoods our own Avatar (auto initials + auto tint from name)
function MemberCell({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={member.name} size="sm" />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-medium text-fd-foreground">{member.name}</div>
        <div className="truncate text-xs text-fd-muted-foreground">{member.email}</div>
      </div>
    </div>
  );
}

// compact identity cell for the shared columns — avatar + name on one line
function NameCell({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={member.name} size="sm" />
      <span className="font-medium text-fd-foreground">{member.name}</span>
    </div>
  );
}

// flag + country label
function FlagCell({ member }: { member: Member }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-base leading-none">{member.flag}</span>
      <span>{member.country}</span>
    </span>
  );
}

// a stacked AvatarGroup standing in for a member's collaborators
const TEAMMATES = MEMBERS.map((m) => m.name);
function TeamGroup({ member }: { member: Member }) {
  const i = MEMBERS.findIndex((m) => m.id === member.id);
  const names = [member.name, ...TEAMMATES.filter((_, j) => j !== i)].slice(0, 4);
  return (
    <AvatarGroup max={3} size="sm">
      {names.map((n) => (
        <Avatar key={n} name={n} />
      ))}
    </AvatarGroup>
  );
}

// dogfooded icon-button row actions — edit, configure, delete
function IconGlyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RowActions({ member }: { member: Member }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button variant="secondary" appearance="ghost" size="iconSm" aria-label={`Edit ${member.name}`}>
        <IconGlyph d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3L11 2.5Z" />
      </Button>
      <Button variant="secondary" appearance="ghost" size="iconSm" aria-label={`Configure ${member.name}`}>
        <IconGlyph d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 2v1.5M8 12.5V14M3.5 3.5l1 1M11.5 11.5l1 1M2 8h1.5M12.5 8H14M3.5 12.5l1-1M11.5 4.5l1-1" />
      </Button>
      <Button variant="destructive" appearance="ghost" size="iconSm" aria-label={`Remove ${member.name}`}>
        <IconGlyph d="M3 4.5h10M6.5 4.5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M5 4.5l.5 8a1 1 0 0 0 1 .9h3a1 1 0 0 0 1-.9l.5-8" />
      </Button>
    </div>
  );
}

// rich expanded-row detail panel — reused by the Expandable + Responsive demos
function MemberDetail({ member: r }: { member: Member }) {
  return (
    <div className="flex max-w-2xl flex-col gap-5 px-2 py-2 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size="lg" />
        <div className="leading-tight">
          <div className="font-medium text-fd-foreground">{r.name}</div>
          <div className="text-xs text-fd-muted-foreground">{r.email}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral" appearance="soft">{r.role}</Badge>
            <Badge variant="secondary" appearance="soft">{r.team}</Badge>
            <StatusBadge status={r.status} />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-56">
        <ProgressBar value={r.tasks} max={240} variant="primary" showValue label="Tasks completed" format={(v, m) => `${v}/${m}`} />
        <div className="flex gap-2">
          <Button variant="secondary" appearance="outline" size="sm">View profile</Button>
          <Button variant="secondary" appearance="ghost" size="sm">Message</Button>
        </div>
      </div>
    </div>
  );
}

// inline-edit cell — click to edit, Enter/blur commits, Esc cancels (dogfoods Input)
function EditableCell({
  value,
  onCommit,
  numeric = false,
}: {
  value: string | number;
  onCommit: (next: string) => void;
  numeric?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  if (editing) {
    return (
      <Input
        size="sm"
        autoFocus
        type={numeric ? 'number' : 'text'}
        value={draft}
        className={numeric ? 'text-right tabular-nums' : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onCommit(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onCommit(draft);
            setEditing(false);
          } else if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <button
      type="button"
      title="Click to edit"
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`group/edit flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-fd-muted ${numeric ? 'justify-end tabular-nums' : ''}`}
    >
      {/* persistent dashed underline marks the cell as editable, even without hover */}
      <span className="border-b border-dashed border-fd-muted-foreground/40 transition-colors group-hover/edit:border-fd-muted-foreground">
        {value}
      </span>
      <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-70" fill="none" aria-hidden>
        <path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3L11 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// Usage demo columns — a plain table (no sorting/filtering), with a rich first cell.
const usageColumns: DataTableColumn<Member>[] = [
  { id: 'member', header: 'Member', cell: (r) => <MemberCell member={r} /> },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, accessor: (r) => r.tasks },
];

// ── demos ─────────────────────────────────────────────────────────────────────
export function DataTableUsageDemo() {
  return (
    <Box>
      <DataTable columns={usageColumns} data={MEMBERS} rowKey={key} />
    </Box>
  );
}

export function DataTableSizesDemo() {
  const data = MEMBERS.slice(0, 4);
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="md"
      items={[
        { value: 'sm', label: 'Small', content: <DataTable columns={columns} data={data} rowKey={key} size="sm" /> },
        { value: 'md', label: 'Medium', content: <DataTable columns={columns} data={data} rowKey={key} size="md" /> },
        { value: 'lg', label: 'Large', content: <DataTable columns={columns} data={data} rowKey={key} size="lg" /> },
      ]}
    />
  );
}

export function DataTableStripedDemo() {
  const data = MEMBERS.slice(0, 4);
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="borderless"
      items={[
        { value: 'borderless', label: 'Borderless', content: <DataTable columns={columns} data={data} rowKey={key} /> },
        { value: 'striped', label: 'Striped', content: <DataTable columns={columns} data={data} rowKey={key} striped /> },
        { value: 'outlined', label: 'Outlined', content: <DataTable columns={columns} data={data} rowKey={key} frame bordered /> },
      ]}
    />
  );
}

export function DataTableCustomizeDemo() {
  return (
    <Box>
      <DataTable
        columns={customizeColumns}
        data={MEMBERS}
        rowKey={key}
        headerClassName="bg-muted/60"
        rowClassName={(r) => (r.status === 'disabled' ? 'bg-destructive/[0.06] text-muted-foreground' : '')}
      />
    </Box>
  );
}

export function DataTableEditableDemo() {
  const [rows, setRows] = useState(MEMBERS);
  const patch = (id: string, field: 'name' | 'role' | 'tasks', next: string) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? ({ ...r, [field]: field === 'tasks' ? Number(next) || 0 : next } as Member) : r)),
    );

  const editColumns: DataTableColumn<Member>[] = [
    { id: 'name', header: 'Name', cell: (r) => <EditableCell value={r.name} onCommit={(v) => patch(r.id, 'name', v)} /> },
    { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
    { id: 'role', header: 'Role', cell: (r) => <EditableCell value={r.role} onCommit={(v) => patch(r.id, 'role', v)} /> },
    { id: 'team', header: 'Team', accessor: (r) => r.team },
    { id: 'tasks', header: 'Tasks', numeric: true, cell: (r) => <EditableCell value={r.tasks} numeric onCommit={(v) => patch(r.id, 'tasks', v)} /> },
  ];

  return (
    <Box>
      <DataTable columns={editColumns} data={rows} rowKey={key} />
    </Box>
  );
}


export function DataTableStickyDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={BIG} rowKey={key} stickyHeader maxHeight={260} />
    </Box>
  );
}

export function DataTableClickableDemo() {
  const [last, setLast] = useState('');
  return (
    <div className="flex w-full flex-col gap-3">
      <DataTable columns={flagColumns} data={MEMBERS} rowKey={key} onRowClick={(r) => setLast(r.name)} />
      {last && (
        <p className="text-sm text-fd-muted-foreground">
          Clicked: <span className="font-medium text-fd-foreground">{last}</span>
        </p>
      )}
    </div>
  );
}

// simulate a backend returning rows already sorted in the requested order
function sortServer(rows: Member[], sort: DataTableSort[]): Member[] {
  if (!sort.length) return rows;
  const { id, dir } = sort[0];
  const get = (m: Member) => (id === 'tasks' ? m.tasks : String((m as Record<string, unknown>)[id] ?? ''));
  return [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return dir === 'asc' ? c : -c;
  });
}

function ServerSortTable() {
  // controlled sort — the parent (a real app: the server) owns the row order
  const [sort, setSort] = useState<DataTableSort[]>([{ id: 'name', dir: 'asc' }]);
  return <DataTable columns={sortableColumns} data={sortServer(MEMBERS, sort)} rowKey={key} sort={sort} onSortChange={setSort} />;
}

export function DataTableSortDemo() {
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="single"
      items={[
        {
          value: 'single',
          label: 'Single sort',
          content: <DataTable columns={sortableColumns} data={MEMBERS} rowKey={key} defaultSort={[{ id: 'tasks', dir: 'desc' }]} />,
        },
        {
          value: 'multi',
          label: 'Multi sort',
          content: (
            <DataTable
              columns={sortableColumns}
              data={MEMBERS}
              rowKey={key}
              multiSort
              defaultSort={[
                { id: 'role', dir: 'asc' },
                { id: 'tasks', dir: 'desc' },
              ]}
            />
          ),
        },
        {
          value: 'server',
          label: 'Server',
          content: <ServerSortTable />,
        },
      ]}
    />
  );
}

export function DataTableSelectionDemo() {
  const [multi, setMulti] = useState<Key[]>([]);
  const [single, setSingle] = useState<Key[]>([]);
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="multiple"
      items={[
        {
          value: 'multiple',
          label: 'Multiple',
          content: (
            <div className="flex flex-col gap-3">
              {multi.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm">
                  <span className="text-fd-foreground">{multi.length} selected</span>
                  <Button size="sm" variant="secondary" appearance="outline" onClick={() => setMulti([])}>
                    Clear
                  </Button>
                </div>
              )}
              <DataTable columns={teamColumns} data={MEMBERS} rowKey={key} selectable selectedKeys={multi} onSelectionChange={setMulti} />
            </div>
          ),
        },
        {
          value: 'single',
          label: 'Single',
          content: (
            <div className="flex flex-col gap-3">
              {single.length > 0 && (
                <div className="rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm text-fd-foreground">
                  Selected: <span className="font-medium">{MEMBERS.find((m) => m.id === single[0])?.name}</span>
                </div>
              )}
              <DataTable
                columns={teamColumns}
                data={MEMBERS}
                rowKey={key}
                selectable
                selectionMode="single"
                selectedKeys={single}
                onSelectionChange={setSingle}
              />
            </div>
          ),
        },
      ]}
    />
  );
}

export function DataTablePaginationDemo() {
  const size = 8;
  // server-side: a controlled page; here we slice BIG to stand in for a backend
  const [page, setPage] = useState(1);
  // cursor-based: a controlled prev/next offset
  const [start, setStart] = useState(0);

  const serverData = BIG.slice((page - 1) * size, page * size);
  const cursorData = BIG.slice(start, start + size);

  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="client"
      items={[
        {
          value: 'client',
          label: 'Client',
          content: (
            <DataTable columns={meteredColumns} data={BIG} rowKey={key} pagination={{ pageSize: size, pageSizeOptions: [8, 16, 32] }} />
          ),
        },
        {
          value: 'server',
          label: 'Server',
          content: (
            <DataTable
              columns={meteredColumns}
              data={serverData}
              rowKey={key}
              pagination={{ mode: 'server', page, pageSize: size, total: BIG.length, onPageChange: setPage }}
            />
          ),
        },
        {
          value: 'cursor',
          label: 'Cursor',
          content: (
            <DataTable
              columns={meteredColumns}
              data={cursorData}
              rowKey={key}
              pagination={{
                mode: 'cursor',
                hasPreviousPage: start > 0,
                hasNextPage: start + size < BIG.length,
                onPreviousPage: () => setStart((s) => Math.max(0, s - size)),
                onNextPage: () => setStart((s) => s + size),
                rangeLabel: `Showing ${start + 1}–${Math.min(start + size, BIG.length)} of ${BIG.length}`,
              }}
            />
          ),
        },
      ]}
    />
  );
}

export function DataTableExpandableDemo() {
  return (
    <Box>
      <DataTable
        columns={columns}
        data={MEMBERS}
        rowKey={key}
        expandMode="single"
        renderExpanded={(r) => <MemberDetail member={r} />}
      />
    </Box>
  );
}

// enough wide columns to force horizontal scroll — Name stays frozen on the left,
// Tasks frozen on the right, while the middle columns scroll between them
const pinnedColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', pin: 'left', width: 210, cell: (r) => <NameCell member={r} /> },
  { id: 'email', header: 'Email', width: 220, accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', width: 140, accessor: (r) => r.role },
  { id: 'team', header: 'Team', width: 150, accessor: (r) => r.team },
  { id: 'location', header: 'Location', width: 170, cell: (r) => <FlagCell member={r} /> },
  { id: 'seats', header: 'Seats', width: 110, numeric: true, accessor: (r) => r.seats },
  { id: 'status', header: 'Status', width: 150, align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', pin: 'right', width: 120, numeric: true, accessor: (r) => r.tasks },
];

export function DataTableFrozenDemo() {
  return (
    <Box>
      <DataTable columns={pinnedColumns} data={MEMBERS} rowKey={key} frame pinnable maxHeight={300} />
    </Box>
  );
}

// simulate a backend applying the controlled filters (mirrors the table's own eval)
const FILTER_FIELD: Record<string, (m: Member) => string | number> = {
  name: (m) => m.name,
  role: (m) => m.role,
  team: (m) => m.team,
  tasks: (m) => m.tasks,
};
function evalRule(cell: string | number, op: FilterOperator, val: string, numeric: boolean): boolean {
  if (val === '') return true;
  if (numeric) {
    const a = Number(cell);
    const b = Number(val);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (op) {
      case 'equals': return a === b;
      case 'notEquals': return a !== b;
      case 'gt': return a > b;
      case 'gte': return a >= b;
      case 'lt': return a < b;
      case 'lte': return a <= b;
      default: return true;
    }
  }
  const a = String(cell).toLowerCase();
  const b = val.toLowerCase();
  switch (op) {
    case 'startsWith': return a.startsWith(b);
    case 'endsWith': return a.endsWith(b);
    case 'equals': return a === b;
    case 'notEquals': return a !== b;
    default: return a.includes(b);
  }
}
function applyFiltersServer(rows: Member[], filters: Record<string, ColumnFilter>): Member[] {
  const active = Object.entries(filters).filter(([, f]) => f.rules.some((r) => r.value !== ''));
  if (!active.length) return rows;
  return rows.filter((row) =>
    active.every(([id, f]) => {
      const get = FILTER_FIELD[id];
      if (!get) return true;
      const numeric = id === 'tasks';
      const res = f.rules.filter((r) => r.value !== '').map((r) => evalRule(get(row), r.op, r.value, numeric));
      return f.matchMode === 'all' ? res.every(Boolean) : res.some(Boolean);
    }),
  );
}

function ServerFilterTable() {
  // controlled filters — the parent (a real app: the server) owns filtering
  const [filters, setFilters] = useState<Record<string, ColumnFilter>>({});
  return (
    <DataTable
      columns={filterableColumns}
      data={applyFiltersServer(MEMBERS, filters)}
      rowKey={key}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}

export function DataTableFiltersDemo() {
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="client"
      items={[
        {
          value: 'client',
          label: 'Client',
          content: <DataTable columns={filterableColumns} data={MEMBERS} rowKey={key} />,
        },
        {
          value: 'server',
          label: 'Server',
          content: <ServerFilterTable />,
        },
      ]}
    />
  );
}

// simulate a backend searching across fields (mirrors the table's global search)
function searchServer(rows: Member[], q: string): Member[] {
  const query = q.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((m) =>
    [m.name, m.email, m.role, m.team, m.country].some((v) => String(v).toLowerCase().includes(query)),
  );
}

function ServerSearchTable() {
  // controlled search value — the parent (a real app: the server) owns filtering
  const [q, setQ] = useState('');
  return (
    <DataTable
      columns={flagColumns}
      data={searchServer(MEMBERS, q)}
      rowKey={key}
      searchable
      searchPlaceholder="Search members…"
      searchValue={q}
      onSearchChange={setQ}
    />
  );
}

export function DataTableSearchDemo() {
  return (
    <Tabs
      className="w-full self-start"
      listClassName="mb-2"
      defaultValue="client"
      items={[
        {
          value: 'client',
          label: 'Client',
          content: <DataTable columns={flagColumns} data={MEMBERS} rowKey={key} searchable searchPlaceholder="Search members…" />,
        },
        {
          value: 'server',
          label: 'Server',
          content: <ServerSearchTable />,
        },
      ]}
    />
  );
}

export function DataTableColumnToggleDemo() {
  return (
    <Box>
      <DataTable columns={actionsColumns} data={MEMBERS} rowKey={key} columnToggle />
    </Box>
  );
}

const summaryColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, footer: 'Total' },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  {
    id: 'tasks',
    header: 'Tasks',
    numeric: true,
    accessor: (r) => r.tasks,
    footer: (rows) => rows.reduce((sum, r) => sum + r.tasks, 0),
  },
];

export function DataTableFooterDemo() {
  return (
    <Box>
      <DataTable columns={summaryColumns} data={MEMBERS} rowKey={key} />
    </Box>
  );
}

// Responsive demo — the kitchen sink: sortable + filterable, frozen edges (Name
// left, Actions right), expandable rows, an avatar group, a flag, a neutral
// amount and row actions — and it still stacks into cards on narrow screens.
const responsiveColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', pin: 'left', width: 210, sortable: true, filterable: true, cell: (r) => <NameCell member={r} />, sortAccessor: (r) => r.name },
  { id: 'team', header: 'Collaborators', width: 170, cell: (r) => <TeamGroup member={r} /> },
  { id: 'location', header: 'Location', width: 180, sortable: true, filterable: true, filterType: 'select', cell: (r) => <FlagCell member={r} />, sortAccessor: (r) => r.country },
  { id: 'role', header: 'Role', width: 150, sortable: true, filterable: true, filterType: 'select', accessor: (r) => r.role },
  { id: 'seats', header: 'Seats', width: 120, numeric: true, sortable: true, accessor: (r) => r.seats },
  { id: 'status', header: 'Status', width: 150, align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'actions', header: 'Actions', pin: 'right', width: 120, align: 'right', hideable: false, cell: (r) => <RowActions member={r} /> },
];

export function DataTableResponsiveDemo() {
  const size = 4;
  const [start, setStart] = useState(0);
  const visible = MEMBERS.slice(start, start + size);
  return (
    <Box>
      <DataTable
        columns={responsiveColumns}
        data={visible}
        rowKey={key}
        responsive
        pinnable
        expandMode="single"
        renderExpanded={(r) => <MemberDetail member={r} />}
        pagination={{
          mode: 'cursor',
          hasPreviousPage: start > 0,
          hasNextPage: start + size < MEMBERS.length,
          onPreviousPage: () => setStart((s) => Math.max(0, s - size)),
          onNextPage: () => setStart((s) => s + size),
          rangeLabel: `Showing ${start + 1}–${Math.min(start + size, MEMBERS.length)} of ${MEMBERS.length}`,
        }}
      />
    </Box>
  );
}

export function DataTableReorderDemo() {
  const [rows, setRows] = useState(MEMBERS);
  return (
    <Box>
      <DataTable columns={columns} data={rows} rowKey={key} reorderableColumns reorderableRows onRowReorder={setRows} />
    </Box>
  );
}

export function DataTableVirtualizedDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={BIG} rowKey={key} frame virtualized maxHeight={320} />
    </Box>
  );
}

export function DataTableEmptyDemo() {
  return (
    <Box>
      <DataTable
        columns={columns}
        data={[]}
        rowKey={key}
        emptyContent={
          <div className="py-8 text-center text-sm text-fd-muted-foreground">No members yet — invite your team.</div>
        }
      />
    </Box>
  );
}
