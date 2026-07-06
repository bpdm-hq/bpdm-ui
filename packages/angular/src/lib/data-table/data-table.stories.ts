import { Component, computed, input, signal, TemplateRef, viewChild } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmDataTable } from "./data-table";
import type { CellContext, DataTableColumn, DataTablePagination, DataTableSort } from "./data-table-types";

const usage = `
Data-driven table. Describe \`columns\` once and pass an array of \`data\` — the
table renders the rest. Density (\`sm\`/\`md\`/\`lg\`), \`striped\`, \`bordered\`,
\`hoverable\`, \`frame\`, \`divided\`, \`rowSpacing\`, \`stickyHeader\` + \`maxHeight\`,
empty state, and \`onRowClick\` are all inputs. Opt into sorting, selection,
pagination, expandable rows, frozen columns, a column toggle, global search, and
per-column filters. The wrapper scrolls horizontally, so it is responsive by default.

\`\`\`html
<bpdm-data-table [columns]="columns()" [data]="rows" [rowKey]="rowKey" selectable searchable />
\`\`\`

Custom cells use an \`<ng-template>\` referenced from a column's \`cell\` (with
\`sortAccessor\` so sort/search/filter still have a value); plain columns use
\`accessor\`. See the Playground's source for a complete setup. Each example below
focuses on one feature; combine the inputs freely.
`;

// full copy-paste setup shown under the Playground demo's "Show code"
const PLAYGROUND_SOURCE = `import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { BpdmDataTable, type CellContext, type DataTableColumn } from "@bpdm/ng";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "disabled";
  tasks: number;
};

@Component({
  selector: "app-members",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="members"
      [rowKey]="rowKey"
      selectable
      searchable
      columnToggle
      stickyHeader
      [pagination]="{ pageSize: 10, pageSizeOptions: [10, 25, 50] }"
      (selectionChange)="onSelection($event)"
    />
    <!-- custom node cell — give sortAccessor so sort + search/filter have a value -->
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row><span class="text-xs capitalize">{{ row.status }}</span></ng-template>
  \`,
})
export class MembersComponent {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly rowKey = (r: Member) => r.id; // stable key → selection/expansion survive sorting
  members: Member[] = [];

  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
    { id: "status", header: "Status", align: "center", filterable: true, filterType: "select", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
  ]);

  onSelection(e: { keys: (string | number)[]; rows: Member[] }) {
    console.log(e.keys, e.rows);
  }
}`;

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
  { id: "m_01", name: "Milo Lindberg", email: "milo@example.com", role: "Owner", team: "Engineering", status: "active", joined: "2025-02-14", tasks: 128 },
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

/* ------------------------------------------------------------------ *
 * Host components — Angular custom cells live in <ng-template>s grabbed
 * with viewChild, then assigned into a computed() columns array.
 * ------------------------------------------------------------------ */

/**
 * Flexible host used by the simpler stories. Every feature flag is a signal
 * input so a story can flip it on via `props`. The standard 6-column member
 * table (Name / Email / Role / Team / Status / Tasks) with the custom email +
 * status cells lives here once.
 */
@Component({
  selector: "dt-members",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="data()"
      [rowKey]="rowKey"
      [size]="size()"
      [striped]="striped()"
      [bordered]="bordered()"
      [frame]="frame()"
      [divided]="divided()"
      [hoverable]="hoverable()"
      [stickyHeader]="stickyHeader()"
      [maxHeight]="maxHeight()"
      [multiSort]="multiSort()"
      [defaultSort]="defaultSort()"
      [selectable]="selectable()"
      [selectionMode]="selectionMode()"
      [defaultSelectedKeys]="defaultSelectedKeys()"
      [pinnable]="pinnable()"
      [columnToggle]="columnToggle()"
      [searchable]="searchable()"
      [responsive]="responsive()"
      [reorderableColumns]="reorderableColumns()"
      [reorderableRows]="reorderableRows()"
      [pagination]="pagination()"
      [onRowClick]="onRowClick()"
      [emptyContent]="emptyContent()"
      (selectionChange)="onSelectionChange($event)"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtMembersHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly rowKey = (r: Member) => r.id;

  readonly data = input<Member[]>(MEMBERS);
  readonly size = input<"sm" | "md" | "lg">("md");
  readonly striped = input(false);
  readonly bordered = input(false);
  readonly frame = input(true);
  readonly divided = input(true);
  readonly hoverable = input(true);
  readonly stickyHeader = input(false);
  readonly maxHeight = input<number | string | undefined>(undefined);
  readonly multiSort = input(false);
  readonly defaultSort = input<DataTableSort[]>([]);
  readonly selectable = input(false);
  readonly selectionMode = input<"multiple" | "single">("multiple");
  readonly defaultSelectedKeys = input<(string | number)[]>([]);
  readonly pinnable = input(false);
  readonly columnToggle = input(false);
  readonly searchable = input(false);
  readonly responsive = input(false);
  readonly reorderableColumns = input(false);
  readonly reorderableRows = input(false);
  readonly pagination = input<DataTablePagination | undefined>(undefined);
  readonly onRowClick = input<((row: Member, index: number) => void) | undefined>(undefined);
  readonly emptyContent = input<string>("No data");
  readonly hideName = input(false);

  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, hideable: !this.hideName(), accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);

  onSelectionChange(e: { keys: (string | number)[]; rows: Member[] }) {
    console.log(e.keys, e.rows);
  }
}

/** Sizes — renders the table three times (sm / md / lg). */
@Component({
  selector: "dt-sizes",
  imports: [BpdmDataTable],
  template: `
    <div class="flex flex-col gap-6">
      @for (s of sizes; track s) {
        <div>
          <p class="mb-1.5 font-mono text-xs text-muted-foreground">size="{{ s }}"</p>
          <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" [size]="s" />
        </div>
      }
    </div>
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtSizesHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly sizes = ["sm", "md", "lg"] as const;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** SelectionToolbar — controlled selection driving a bulk-action toolbar. */
@Component({
  selector: "dt-selection-toolbar",
  imports: [BpdmDataTable],
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex h-9 items-center gap-3">
        @if (selected().length > 0) {
          <span class="text-sm font-medium">{{ selected().length }} selected</span>
          <button type="button" (click)="selected.set([])" class="rounded-lg border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground">Clear</button>
          <button type="button" class="rounded-lg bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">Remove</button>
        } @else {
          <span class="text-sm text-muted-foreground">Select rows to act on them.</span>
        }
      </div>
      <bpdm-data-table
        [columns]="columns()"
        [data]="data"
        [rowKey]="rowKey"
        selectable
        [selectedKeys]="selected()"
        (selectionChange)="selected.set($event.keys)"
      />
    </div>
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtSelectionToolbarHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly selected = signal<(string | number)[]>([]);
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** ServerSidePaging — the parent owns the page and slices MANY itself. */
@Component({
  selector: "dt-server-paging",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="rows()"
      [rowKey]="rowKey"
      [pagination]="{ mode: 'server', page: page(), pageSize: pageSize, total: total, onPageChange: setPage }"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtServerPagingHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly rowKey = (r: Member) => r.id;
  readonly pageSize = 5;
  readonly total = MANY.length;
  readonly page = signal(1);
  readonly rows = computed(() => MANY.slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  readonly setPage = (p: number) => this.page.set(p);
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** CursorPaging — Prev / Next only, driven by a start offset signal. */
@Component({
  selector: "dt-cursor-paging",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="rows()"
      [rowKey]="rowKey"
      [pagination]="pagination()"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtCursorPagingHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly rowKey = (r: Member) => r.id;
  readonly pageSize = 5;
  readonly start = signal(0);
  readonly rows = computed(() => MANY.slice(this.start(), this.start() + this.pageSize));
  readonly pagination = computed<DataTablePagination>(() => ({
    mode: "cursor",
    hasPreviousPage: this.start() > 0,
    hasNextPage: this.start() + this.pageSize < MANY.length,
    onPreviousPage: () => this.start.set(Math.max(0, this.start() - this.pageSize)),
    onNextPage: () => this.start.set(this.start() + this.pageSize),
    rangeLabel: `Showing ${this.start() + 1}–${Math.min(this.start() + this.pageSize, MANY.length)}`,
  }));
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** Borderless — cursor paging, no frame / no hover, taller rows, centered footer. */
@Component({
  selector: "dt-borderless",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="rows()"
      [rowKey]="rowKey"
      [frame]="false"
      [hoverable]="false"
      [rowSpacing]="4"
      cellClassName="py-4"
      [pagination]="pagination()"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtBorderlessHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly rowKey = (r: Member) => r.id;
  readonly start = signal(0);
  readonly size = signal(10);
  readonly rows = computed(() => MANY.slice(this.start(), this.start() + this.size()));
  readonly pagination = computed<DataTablePagination>(() => ({
    mode: "cursor",
    align: "center",
    hasPreviousPage: this.start() > 0,
    hasNextPage: this.start() + this.size() < MANY.length,
    onPreviousPage: () => this.start.set(Math.max(0, this.start() - this.size())),
    onNextPage: () => this.start.set(this.start() + this.size()),
    pageSize: this.size(),
    pageSizeOptions: [10, 25, 50],
    onPageSizeChange: (s: number) => {
      this.size.set(s);
      this.start.set(0);
    },
  }));
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** ExpandableRows — expandedTemplate renders a member-details panel. */
@Component({
  selector: "dt-expandable",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      [expandedTemplate]="details"
      [defaultExpandedKeys]="['m_03']"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
    <ng-template #details let-row>
      <div class="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section class="rounded-lg border border-border bg-card p-4">
          <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Task activity</p>
          <dl class="space-y-2 text-sm tabular-nums">
            <div class="flex items-center justify-between"><dt class="text-muted-foreground">Assigned</dt><dd>{{ row.tasks }}</dd></div>
            <div class="flex items-center justify-between"><dt class="text-muted-foreground">Completed</dt><dd class="text-success">{{ completed(row.tasks) }}</dd></div>
            <div class="mt-1 flex items-center justify-between border-t border-border pt-2 text-base font-semibold"><dt>Open</dt><dd>{{ row.tasks - completed(row.tasks) }}</dd></div>
          </dl>
        </section>
        <section class="rounded-lg border border-border bg-card p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>
            <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
          </div>
          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div class="flex flex-col gap-0.5"><dt class="text-xs uppercase tracking-wide text-muted-foreground">Email</dt><dd class="font-mono text-xs">{{ row.email }}</dd></div>
            <div class="flex flex-col gap-0.5"><dt class="text-xs uppercase tracking-wide text-muted-foreground">Role</dt><dd>{{ row.role }}</dd></div>
            <div class="flex flex-col gap-0.5"><dt class="text-xs uppercase tracking-wide text-muted-foreground">Team</dt><dd>{{ row.team }}</dd></div>
            <div class="flex flex-col gap-0.5"><dt class="text-xs uppercase tracking-wide text-muted-foreground">Joined</dt><dd>{{ row.joined }}</dd></div>
          </dl>
        </section>
      </div>
    </ng-template>
  `,
})
class DtExpandableHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly completed = (tasks: number) => Math.round(tasks * 0.7);
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** FrozenColumns — Name + Role pinned left, Actions pinned right; selectable. */
@Component({
  selector: "dt-frozen",
  imports: [BpdmDataTable, BpdmButton],
  template: `
    <div class="max-w-3xl">
      <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" selectable />
    </div>
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
    <ng-template #actions>
      <button bpdmButton size="sm" variant="secondary" appearance="ghost" (click)="$event.stopPropagation()">View</button>
    </ng-template>
  `,
})
class DtFrozenHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly actionsTpl = viewChild<TemplateRef<CellContext<Member>>>("actions");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", pin: "left", width: 180, sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", pin: "left", width: 120, sortable: true, accessor: (r) => r.role },
    { id: "email", header: "Email", width: 220, cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
    { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
    { id: "status", header: "Status", width: 120, align: "center", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", width: 100, numeric: true, sortable: true, accessor: (r) => r.tasks },
    { id: "actions", header: "", pin: "right", width: 120, align: "right", cell: this.actionsTpl() },
  ]);
}

/** PinnableColumns — runtime pin menu (⋮) on every header; nothing pinned to start. */
@Component({
  selector: "dt-pinnable",
  imports: [BpdmDataTable],
  template: `
    <div class="max-w-3xl">
      <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" pinnable selectable />
    </div>
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtPinnableHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", width: 180, sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", width: 220, cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", width: 120, sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
    { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
    { id: "status", header: "Status", width: 120, align: "center", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", width: 110, numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/** ColumnFilters — filterable columns (text / number / select); searchable; data=MANY. */
@Component({
  selector: "dt-column-filters",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      searchable
      [pagination]="{ pageSize: 5 }"
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtColumnFiltersHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MANY;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", filterable: true, cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", filterable: true, filterType: "select", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
  ]);
}

/** FooterSummary — footer functions: Total / "N active" / sum. */
@Component({
  selector: "dt-footer-summary",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" [pagination]="{ pageSize: 6 }" />
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtFooterSummaryHost {
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = MEMBERS;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name, footer: "Total" },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    {
      id: "status",
      header: "Status",
      align: "center",
      cell: this.statusTpl(),
      sortAccessor: (r) => r.status,
      footer: (rows: Member[]) => `${rows.filter((r) => r.status === "active").length} active`,
    },
    {
      id: "tasks",
      header: "Tasks",
      numeric: true,
      sortable: true,
      accessor: (r) => r.tasks,
      footer: (rows: Member[]) => rows.reduce((s, r) => s + r.tasks, 0).toLocaleString(),
    },
  ]);
}

/** Virtualized — 10,000 rows, virtualized window; selectable + searchable. */
@Component({
  selector: "dt-virtualized",
  imports: [BpdmDataTable],
  template: `
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      virtualized
      [maxHeight]="440"
      selectable
      searchable
    />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row>
      <span [class]="'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ' + statusStyle[row.status]">{{ row.status }}</span>
    </ng-template>
  `,
})
class DtVirtualizedHost {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly statusStyle = STATUS_STYLE;
  readonly data = HUGE;
  readonly rowKey = (r: Member) => r.id;
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", sortable: true, cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}

/* ------------------------------------------------------------------ */

const meta: Meta = {
  title: "Data Display/DataTable",
  component: BpdmDataTable,
  decorators: [
    moduleMetadata({
      imports: [
        DtMembersHost,
        DtSizesHost,
        DtSelectionToolbarHost,
        DtServerPagingHost,
        DtCursorPagingHost,
        DtBorderlessHost,
        DtExpandableHost,
        DtFrozenHost,
        DtPinnableHost,
        DtColumnFiltersHost,
        DtFooterSummaryHost,
        DtVirtualizedHost,
      ],
    }),
  ],
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: { description: { component: usage } },
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
    expandedTemplate: { table: { disable: true } },
    // outputs are real API but kept out of the args table so the autodocs reads
    // like React's single props table (no separate "Outputs" section)
    sortChange: { table: { disable: true } },
    selectionChange: { table: { disable: true } },
    expandedChange: { table: { disable: true } },
    columnPinChange: { table: { disable: true } },
    columnOrderChange: { table: { disable: true } },
    rowReorder: { table: { disable: true } },
  },
  args: { size: "md" },
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<dt-members [size]="size" [striped]="striped" [bordered]="bordered" [frame]="frame" [divided]="divided" [hoverable]="hoverable" [stickyHeader]="stickyHeader" [multiSort]="multiSort" [selectable]="selectable" [selectionMode]="selectionMode" [pinnable]="pinnable" />`,
  }),
  parameters: { docs: { source: { code: PLAYGROUND_SOURCE } } },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-sizes />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-sizes",
  imports: [BpdmDataTable],
  template: \`
    <div class="flex flex-col gap-6">
      @for (s of sizes; track s) {
        <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" [size]="s" />
      }
    </div>
  \`,
})
export class TableSizesComponent {
  readonly sizes = ["sm", "md", "lg"] as const;
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

export const StripedAndBordered: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [striped]="true" [bordered]="true" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-striped",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table striped bordered [columns]="columns()" [data]="data" [rowKey]="rowKey" />\`,
})
export class TableStripedComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// cap the height → header stays put while rows scroll
export const StickyHeaderScroll: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { data: [...MEMBERS, ...MEMBERS, ...MEMBERS].map((m, i) => ({ ...m, id: `${m.id}_${i}` })) },
    template: `<dt-members [stickyHeader]="true" [maxHeight]="240" [data]="data" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-sticky",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table stickyHeader [maxHeight]="240" [columns]="columns()" [data]="data" [rowKey]="rowKey" />\`,
})
export class TableStickyComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

export const Clickable: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { onRowClick: (row: Member) => window.alert(`Opened ${row.name}`) },
    template: `<dt-members [onRowClick]="onRowClick" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-clickable",
  imports: [BpdmDataTable],
  // onRowClick is a function input, not an output: [onRowClick]="open"
  template: \`<bpdm-data-table [onRowClick]="open" [columns]="columns()" [data]="data" [rowKey]="rowKey" />\`,
})
export class TableClickableComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly open = (row: Member) => console.log("Opened", row.id);
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// Single-column: starts unsorted. Click a header to cycle asc → desc → off.
export const Sorting: Story = {
  render: () => ({
    template: `<div class="flex flex-col gap-2">
  <p class="font-mono text-xs text-muted-foreground">Click any sortable header (Name / Role / Team / Status / Tasks). Only one column sorts at a time.</p>
  <dt-members />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-sorting",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" />\`,
})
export class TableSortingComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  // columns marked { sortable: true } — click a header to sort
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// Multi-column: pre-sorted by Status, then Tasks — note the numbered badges.
export const MultiColumnSort: Story = {
  tags: ["!dev"],
  render: () => ({
    props: {
      defaultSort: [
        { id: "status", dir: "asc" },
        { id: "tasks", dir: "desc" },
      ] as DataTableSort[],
    },
    template: `<div class="flex flex-col gap-2">
  <p class="max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">Sorted by Status ➊, then Tasks ➋ — rows group by status, and Tasks orders the rows within each status block. Shift+click a header to add a column; click without Shift to reset to one.</p>
  <dt-members [multiSort]="true" [bordered]="true" [defaultSort]="defaultSort" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn, type DataTableSort } from "@bpdm/ng";

type Member = { id: string; name: string; status: string; tasks: number };

@Component({
  selector: "app-table-multisort",
  imports: [BpdmDataTable],
  // Shift+click another header to add it to the sort
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      multiSort
      [defaultSort]="defaultSort"
    />
  \`,
})
export class TableMultiSortComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly defaultSort: DataTableSort[] = [{ id: "status", dir: "asc" }, { id: "tasks", dir: "desc" }];
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", status: "active", tasks: 128 },
    { id: "m_02", name: "Leo Martins", status: "invited", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", status: "active", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "status", header: "Status", sortable: true, accessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// checkbox column + header select-all; selection is keyed by rowKey.
export const RowSelection: Story = {
  render: () => ({ template: `<dt-members [selectable]="true" [defaultSelectedKeys]="['m_03', 'm_06']" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-selection",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      selectable
      [defaultSelectedKeys]="['m_03', 'm_06']"
      (selectionChange)="onSelection($event)"
    />
  \`,
})
export class TableSelectionComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
    { id: "m_06", name: "Ivan Petrov", role: "Admin", tasks: 203 },
    { id: "m_10", name: "Finn O'Brien", role: "Admin", tasks: 165 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
  onSelection(e: { keys: (string | number)[]; rows: Member[] }) {
    console.log(e.keys, e.rows);
  }
}`,
      },
    },
  },
};

// single-select: radios instead of checkboxes, no select-all
export const SingleSelection: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [selectable]="true" selectionMode="single" [defaultSelectedKeys]="['m_03']" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-single-select",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      selectable
      selectionMode="single"
    />
  \`,
})
export class TableSingleSelectComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// controlled selection driving a bulk-action toolbar
export const SelectionToolbar: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-selection-toolbar />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, signal } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-toolbar",
  imports: [BpdmDataTable],
  template: \`
    <div class="flex flex-col gap-3">
      <div class="flex h-9 items-center gap-3">
        @if (selected().length > 0) {
          <span class="text-sm font-medium">{{ selected().length }} selected</span>
          <button type="button" (click)="selected.set([])">Clear</button>
          <button type="button">Remove</button>
        } @else {
          <span class="text-sm text-muted-foreground">Select rows to act on them.</span>
        }
      </div>
      <bpdm-data-table
        [columns]="columns()"
        [data]="data"
        [rowKey]="rowKey"
        selectable
        [selectedKeys]="selected()"
        (selectionChange)="selected.set($event.keys)"
      />
    </div>
  \`,
})
export class TableToolbarComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly selected = signal<(string | number)[]>([]);
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// client-side: the table slices the data itself
export const ClientSidePaging: Story = {
  render: () => ({
    props: { data: MANY, pagination: { pageSize: 5, pageSizeOptions: [5, 10, 25] } as DataTablePagination },
    template: `<dt-members [data]="data" [pagination]="pagination" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-client-paging",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      [pagination]="{ pageSize: 5, pageSizeOptions: [5, 10, 25] }"
    />
  \`,
})
export class TableClientPagingComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// server-side offset paging: parent owns the page, passes one page of rows
export const ServerSidePaging: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-server-paging />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, signal } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-server-paging",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="rows()"
      [rowKey]="rowKey"
      [pagination]="{ mode: 'server', page: page(), pageSize: pageSize, total: total(), onPageChange: setPage }"
    />
  \`,
})
export class TableServerPagingComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly pageSize = 5;
  readonly page = signal(1);
  readonly rows = signal<Member[]>([]);
  readonly total = signal(0);
  readonly setPage = (p: number) => {
    this.page.set(p);
    this.fetchPage(p);
  };
  fetchPage(p: number) {
    // load this page's rows from the server, then:
    // this.rows.set(res.rows); this.total.set(res.total);
  }
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// cursor paging: no page numbers — only Prev / Next
export const CursorPaging: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-cursor-paging />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, signal } from "@angular/core";
import { BpdmDataTable, type DataTableColumn, type DataTablePagination } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-cursor-paging",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table [columns]="columns()" [data]="rows()" [rowKey]="rowKey" [pagination]="pagination()" />\`,
})
export class TableCursorPagingComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly rows = signal<Member[]>([]);
  readonly prevCursor = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly pagination = computed<DataTablePagination>(() => ({
    mode: "cursor",
    hasPreviousPage: !!this.prevCursor(),
    hasNextPage: !!this.nextCursor(),
    onPreviousPage: () => this.loadBefore(this.prevCursor()),
    onNextPage: () => this.loadAfter(this.nextCursor()),
    rangeLabel: "Showing 1–5",
  }));
  loadBefore(cursor: string | null) {}
  loadAfter(cursor: string | null) {}
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// each row expands to a detail panel; keyed by rowKey
export const ExpandableRows: Story = {
  render: () => ({ template: `<dt-expandable />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; email: string; tasks: number };

@Component({
  selector: "app-table-expandable",
  imports: [BpdmDataTable],
  // renderExpanded becomes an [expandedTemplate] input pointing at an <ng-template>
  // add expandMode="single" to keep only one row open at a time
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      [expandedTemplate]="details"
      [defaultExpandedKeys]="['m_03']"
    />
    <ng-template #details let-row>
      <div class="grid gap-1 text-sm">
        <span class="font-mono text-xs">{{ row.email }}</span>
        <span>{{ row.tasks }} tasks assigned</span>
      </div>
    </ng-template>
  \`,
})
export class TableExpandableComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", email: "milo@example.com", tasks: 128 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", email: "sara@example.com", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// borderless look: no outer frame, no striping, no hover, taller rows
export const Borderless: Story = {
  render: () => ({ template: `<dt-borderless />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, signal } from "@angular/core";
import { BpdmDataTable, type DataTableColumn, type DataTablePagination } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-borderless",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="rows()"
      [rowKey]="rowKey"
      [frame]="false"
      [hoverable]="false"
      [rowSpacing]="4"
      cellClassName="py-4"
      [pagination]="pagination()"
    />
  \`,
})
export class TableBorderlessComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly size = signal(10);
  readonly rows = signal<Member[]>([
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ]);
  readonly pagination = computed<DataTablePagination>(() => ({
    mode: "cursor",
    align: "center",
    hasPreviousPage: false,
    hasNextPage: false,
    onPreviousPage: () => {},
    onNextPage: () => {},
    pageSize: this.size(),
    pageSizeOptions: [10, 25, 50],
    onPageSizeChange: (s: number) => this.size.set(s),
  }));
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// pin any number of columns to the edges while the middle scrolls horizontally
export const FrozenColumns: Story = {
  render: () => ({ template: `<dt-frozen />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { BpdmButton, BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = {
  id: string; name: string; email: string; role: string; team: string;
  joined: string; status: "active" | "invited" | "disabled"; tasks: number;
};

@Component({
  selector: "app-table-frozen",
  imports: [BpdmDataTable, BpdmButton],
  template: \`
    <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" selectable />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row><span class="text-xs capitalize">{{ row.status }}</span></ng-template>
    <ng-template #actions>
      <button bpdmButton size="sm" variant="secondary" appearance="ghost" (click)="$event.stopPropagation()">View</button>
    </ng-template>
  \`,
})
export class TableFrozenComponent {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly actionsTpl = viewChild<TemplateRef<CellContext<Member>>>("actions");
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", email: "milo@example.com", role: "Owner", team: "Engineering", joined: "2025-02-14", status: "active", tasks: 128 },
    { id: "m_02", name: "Leo Martins", email: "leo@example.com", role: "Admin", team: "Design", joined: "2025-03-02", status: "invited", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", email: "sara@example.com", role: "Editor", team: "Engineering", joined: "2025-03-19", status: "active", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    // left-pinned block (pin as many as you like; give each a numeric width)
    { id: "name", header: "Name", pin: "left", width: 180, sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", pin: "left", width: 120, sortable: true, accessor: (r) => r.role },
    // middle columns — these scroll horizontally
    { id: "email", header: "Email", width: 220, cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "team", header: "Team", width: 150, sortable: true, accessor: (r) => r.team },
    { id: "joined", header: "Joined", width: 130, sortable: true, accessor: (r) => r.joined },
    { id: "status", header: "Status", width: 120, align: "center", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", width: 100, numeric: true, sortable: true, accessor: (r) => r.tasks },
    // right-pinned block (last in the array)
    { id: "actions", header: "", pin: "right", width: 120, align: "right", cell: this.actionsTpl() },
  ]);
}`,
      },
    },
  },
};

// interactive freezing: with pinnable, every header gets a ⋮ menu
export const PinnableColumns: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-pinnable />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-pinnable",
  imports: [BpdmDataTable],
  // click the ⋮ on any header → Pin left / Pin right / Unpin
  template: \`<bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" pinnable selectable />\`,
})
export class TablePinnableComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// per-column filtering: text / number / select; combines with global search
export const ColumnFilters: Story = {
  render: () => ({ template: `<dt-column-filters />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = {
  id: string; name: string; email: string; role: string; team: string;
  status: "active" | "invited" | "disabled"; tasks: number;
};

@Component({
  selector: "app-table-filters",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" searchable [pagination]="{ pageSize: 5 }" />
    <ng-template #email let-row><span class="font-mono text-xs">{{ row.email }}</span></ng-template>
    <ng-template #status let-row><span class="text-xs capitalize">{{ row.status }}</span></ng-template>
  \`,
})
export class TableFiltersComponent {
  readonly emailTpl = viewChild<TemplateRef<CellContext<Member>>>("email");
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", email: "milo@example.com", role: "Owner", team: "Engineering", status: "active", tasks: 128 },
    { id: "m_02", name: "Leo Martins", email: "leo@example.com", role: "Admin", team: "Design", status: "invited", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", email: "sara@example.com", role: "Editor", team: "Engineering", status: "active", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, filterable: true, accessor: (r) => r.name },
    { id: "email", header: "Email", filterable: true, cell: this.emailTpl(), sortAccessor: (r) => r.email },
    { id: "role", header: "Role", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.role },
    { id: "team", header: "Team", sortable: true, filterable: true, filterType: "select", accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", filterable: true, filterType: "select", cell: this.statusTpl(), sortAccessor: (r) => r.status },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, filterable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// global search + toolbar; pairs with columnToggle
export const Search: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [searchable]="true" [columnToggle]="true" [pagination]="pagination" />`, props: { pagination: { pageSize: 5 } as DataTablePagination } }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-search",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      searchable
      columnToggle
      [pagination]="{ pageSize: 5 }"
    />
  \`,
})
export class TableSearchComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// show/hide columns from a "Columns" control; opt a column out with { hideable: false }
export const ColumnToggle: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [columnToggle]="true" [hideName]="true" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-toggle",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table columnToggle [columns]="columns()" [data]="data" [rowKey]="rowKey" />\`,
})
export class TableToggleComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    // keep a column always visible with { hideable: false }
    { id: "name", header: "Name", hideable: false, sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// a summary row pinned to the bottom; each column's footer is a string / function / template
export const FooterSummary: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-footer-summary />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = {
  id: string; name: string; team: string;
  status: "active" | "invited" | "disabled"; tasks: number;
};

@Component({
  selector: "app-table-footer",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table [columns]="columns()" [data]="data" [rowKey]="rowKey" [pagination]="{ pageSize: 6 }" />
    <ng-template #status let-row><span class="text-xs capitalize">{{ row.status }}</span></ng-template>
  \`,
})
export class TableFooterComponent {
  readonly statusTpl = viewChild<TemplateRef<CellContext<Member>>>("status");
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", team: "Engineering", status: "active", tasks: 128 },
    { id: "m_02", name: "Leo Martins", team: "Design", status: "invited", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", team: "Engineering", status: "active", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", accessor: (r) => r.name, footer: "Total" },
    { id: "team", header: "Team", accessor: (r) => r.team },
    { id: "status", header: "Status", align: "center", cell: this.statusTpl(),
      footer: (rows: Member[]) => \`\${rows.filter((r) => r.status === "active").length} active\` },
    { id: "tasks", header: "Tasks", numeric: true, accessor: (r) => r.tasks,
      footer: (rows: Member[]) => rows.reduce((s, r) => s + r.tasks, 0).toLocaleString() },
  ]);
}`,
      },
    },
  },
};

// below 640px each row stacks into a label/value card
export const Responsive: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [responsive]="true" [selectable]="true" [pagination]="pagination" />`, props: { pagination: { pageSize: 5 } as DataTablePagination } }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-responsive",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      responsive
      selectable
      [pagination]="{ pageSize: 5 }"
    />
  \`,
})
export class TableResponsiveComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// drag a column header onto another to reorder columns
export const ColumnReorder: Story = {
  render: () => ({ template: `<dt-members [reorderableColumns]="true" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-col-reorder",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      reorderableColumns
      (columnOrderChange)="onOrder($event)"
    />
  \`,
})
export class TableColReorderComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ];
  onOrder(order: string[]) {
    console.log(order);
  }
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// drag the ☰ handle to reorder rows (needs rowKey); rowReorder emits the new order
export const RowReorder: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [reorderableRows]="true" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, signal } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-row-reorder",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data()"
      [rowKey]="rowKey"
      reorderableRows
      (rowReorder)="data.set($event)"
    />
  \`,
})
export class TableRowReorderComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data = signal<Member[]>([
    { id: "m_01", name: "Milo Lindberg", role: "Owner", tasks: 128 },
    { id: "m_02", name: "Leo Martins", role: "Admin", tasks: 0 },
    { id: "m_03", name: "Sara Kovač", role: "Editor", tasks: 86 },
  ]);
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

// 10,000 rows, only the visible ones in the DOM (virtualized)
export const Virtualized: Story = {
  render: () => ({ template: `<dt-virtualized />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-virtualized",
  imports: [BpdmDataTable],
  template: \`
    <bpdm-data-table
      [columns]="columns()"
      [data]="data"
      [rowKey]="rowKey"
      virtualized
      [maxHeight]="440"
      selectable
      searchable
    />
  \`,
})
export class TableVirtualizedComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = Array.from({ length: 10000 }, (_, i) => ({
    id: \`v_\${i}\`,
    name: \`Member #\${i + 1}\`,
    role: "Editor",
    tasks: i % 300,
  }));
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};

export const Empty: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<dt-members [data]="data" emptyContent="No members yet." />`, props: { data: [] as Member[] } }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed } from "@angular/core";
import { BpdmDataTable, type DataTableColumn } from "@bpdm/ng";

type Member = { id: string; name: string; role: string; tasks: number };

@Component({
  selector: "app-table-empty",
  imports: [BpdmDataTable],
  template: \`<bpdm-data-table [data]="data" emptyContent="No members yet." [columns]="columns()" [rowKey]="rowKey" />\`,
})
export class TableEmptyComponent {
  readonly rowKey = (r: Member) => r.id;
  readonly data: Member[] = [];
  readonly columns = computed<DataTableColumn<Member>[]>(() => [
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name },
    { id: "role", header: "Role", sortable: true, accessor: (r) => r.role },
    { id: "tasks", header: "Tasks", numeric: true, sortable: true, accessor: (r) => r.tasks },
  ]);
}`,
      },
    },
  },
};
