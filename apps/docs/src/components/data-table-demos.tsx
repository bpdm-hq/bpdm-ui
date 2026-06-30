'use client';

import { type ReactNode, useState } from 'react';
import { DataTable, type DataTableColumn } from '@bpdm/ui/data-table';
import { Button } from '@bpdm/ui/button';
import { Avatar } from '@bpdm/ui/avatar';

// ── shared data + helpers (neutral team dataset — no money/PII) ───────────────
type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  team: 'Engineering' | 'Design' | 'Marketing' | 'Support';
  status: 'active' | 'invited' | 'disabled';
  tasks: number;
};

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Hugo Lindberg', email: 'hugo@acme.dev', role: 'Owner', team: 'Engineering', status: 'active', tasks: 128 },
  { id: 'm2', name: 'Leo Martins', email: 'leo@acme.dev', role: 'Admin', team: 'Design', status: 'invited', tasks: 0 },
  { id: 'm3', name: 'Sara Kovac', email: 'sara@acme.dev', role: 'Editor', team: 'Engineering', status: 'active', tasks: 86 },
  { id: 'm4', name: 'Noah Bauer', email: 'noah@acme.dev', role: 'Viewer', team: 'Support', status: 'disabled', tasks: 12 },
  { id: 'm5', name: 'Ava Nguyen', email: 'ava@acme.dev', role: 'Editor', team: 'Marketing', status: 'active', tasks: 54 },
  { id: 'm6', name: 'Ivan Petrov', email: 'ivan@acme.dev', role: 'Admin', team: 'Engineering', status: 'active', tasks: 203 },
];

/** A larger, generated set for pagination / virtualization demos. */
const BIG: Member[] = Array.from({ length: 60 }, (_, i) => {
  const base = MEMBERS[i % MEMBERS.length];
  return { ...base, id: `b${i}`, name: `${base.name.split(' ')[0]} ${i + 1}`, tasks: (i * 7) % 240 };
});

const STATUS_STYLE: Record<Member['status'], string> = {
  active: 'bg-success/15 text-success',
  invited: 'bg-warning/15 text-warning',
  disabled: 'bg-muted text-muted-foreground',
};

function StatusBadge({ status }: { status: Member['status'] }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

/**
 * Plain base columns — no feature flags. Each demo adds ONLY the one feature it
 * documents (sorting, filtering, …) so every example shows just that one thing.
 */
const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, accessor: (r) => r.tasks },
];

/** Base + `sortable` — used only by the Sorting / Multi-column sort demos. */
const sortableColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, accessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', sortable: true, accessor: (r) => r.role },
  { id: 'team', header: 'Team', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, sortable: true, accessor: (r) => r.tasks },
];

/** Base + `filterable` — used only by the Column filters demo. */
const filterableColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', filterable: true, accessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', filterable: true, filterType: 'select', accessor: (r) => r.role },
  { id: 'team', header: 'Team', filterable: true, filterType: 'select', accessor: (r) => r.team },
  { id: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', numeric: true, filterable: true, accessor: (r) => r.tasks },
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
  return (
    <Box>
      <DataTable columns={columns} data={MEMBERS.slice(0, 3)} rowKey={key} size="sm" />
    </Box>
  );
}

export function DataTableStripedDemo() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-fd-muted-foreground">Default — borderless</p>
        <DataTable columns={columns} data={MEMBERS.slice(0, 4)} rowKey={key} />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-fd-muted-foreground">striped</p>
        <DataTable columns={columns} data={MEMBERS.slice(0, 4)} rowKey={key} striped />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-fd-muted-foreground">frame bordered — outlined</p>
        <DataTable columns={columns} data={MEMBERS.slice(0, 4)} rowKey={key} frame bordered />
      </div>
    </div>
  );
}

export function DataTableStickyDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={BIG} rowKey={key} frame stickyHeader maxHeight={260} />
    </Box>
  );
}

export function DataTableClickableDemo() {
  const [last, setLast] = useState('');
  return (
    <div className="flex w-full flex-col gap-3">
      <DataTable columns={columns} data={MEMBERS} rowKey={key} onRowClick={(r) => setLast(r.name)} />
      {last && (
        <p className="text-sm text-fd-muted-foreground">
          Clicked: <span className="font-medium text-fd-foreground">{last}</span>
        </p>
      )}
    </div>
  );
}

export function DataTableSortingDemo() {
  return (
    <Box>
      <DataTable columns={sortableColumns} data={MEMBERS} rowKey={key} defaultSort={[{ id: 'tasks', dir: 'desc' }]} />
    </Box>
  );
}

export function DataTableMultiSortDemo() {
  return (
    <Box>
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
    </Box>
  );
}

export function DataTableSelectionDemo() {
  const [keys, setKeys] = useState<React.Key[]>([]);
  return (
    <div className="flex w-full flex-col gap-3">
      {keys.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm">
          <span className="text-fd-foreground">{keys.length} selected</span>
          <Button size="sm" variant="secondary" appearance="outline" onClick={() => setKeys([])}>
            Clear
          </Button>
        </div>
      )}
      <DataTable columns={columns} data={MEMBERS} rowKey={key} selectable selectedKeys={keys} onSelectionChange={setKeys} />
    </div>
  );
}

export function DataTablePaginationDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={BIG} rowKey={key} pagination={{ pageSize: 8, pageSizeOptions: [8, 16, 32] }} />
    </Box>
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
        renderExpanded={(r) => (
          <div className="px-2 py-1 text-sm text-fd-muted-foreground">
            <span className="font-medium text-fd-foreground">{r.name}</span> — {r.role} on the {r.team} team,{' '}
            {r.tasks} tasks.
          </div>
        )}
      />
    </Box>
  );
}

const pinnedColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', pin: 'left', width: 180, accessor: (r) => r.name },
  { id: 'email', header: 'Email', width: 220, accessor: (r) => r.email, className: 'font-mono text-xs' },
  { id: 'role', header: 'Role', width: 140, accessor: (r) => r.role },
  { id: 'team', header: 'Team', width: 160, accessor: (r) => r.team },
  { id: 'status', header: 'Status', width: 140, align: 'center', cell: (r) => <StatusBadge status={r.status} /> },
  { id: 'tasks', header: 'Tasks', width: 120, numeric: true, accessor: (r) => r.tasks },
];

export function DataTableFrozenDemo() {
  return (
    <Box>
      <DataTable columns={pinnedColumns} data={MEMBERS} rowKey={key} frame pinnable maxHeight={300} />
    </Box>
  );
}

export function DataTableFiltersDemo() {
  return (
    <Box>
      <DataTable columns={filterableColumns} data={MEMBERS} rowKey={key} />
    </Box>
  );
}

export function DataTableSearchDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={MEMBERS} rowKey={key} searchable searchPlaceholder="Search members…" />
    </Box>
  );
}

export function DataTableColumnToggleDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={MEMBERS} rowKey={key} columnToggle />
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

export function DataTableResponsiveDemo() {
  return (
    <Box>
      <DataTable columns={columns} data={MEMBERS} rowKey={key} responsive />
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
