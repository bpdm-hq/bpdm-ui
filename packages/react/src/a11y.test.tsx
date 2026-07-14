import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { axe } from "vitest-axe";

import { Accordion } from "./components/accordion";
import { Alert } from "./components/alert";
import { Avatar, AvatarGroup } from "./components/avatar";
import { Badge, NotificationBadge } from "./components/badge";
import { Button } from "./components/button";
import { Calendar, DatePicker } from "./components/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/card";
import { Checkbox } from "./components/checkbox";
import { ConfirmProvider, useConfirm } from "./components/confirm-dialog";
import { DataTable, type DataTableColumn } from "./components/data-table";
import { Dialog } from "./components/dialog";
import { Drawer } from "./components/drawer";
import { DialogProvider, useDialog } from "./components/dynamic-dialog";
import { FloatLabel } from "./components/float-label";
import { Input } from "./components/input";
import { InputOtp } from "./components/input-otp";
import { MoneyInput } from "./components/money-input";
import { MultiSelect } from "./components/multi-select";
import { NumberInput } from "./components/number-input";
import { OrderList } from "./components/order-list";
import { PickList } from "./components/pick-list";
import { PasswordInput } from "./components/password-input";
import { Popover, PopoverClose } from "./components/popover";
import { ProgressBar } from "./components/progress";
import { RadioGroup, RadioGroupItem } from "./components/radio-group";
import { SecureField } from "./components/secure-field";
import { Select, type SelectItems } from "./components/select";
import { Spinner } from "./components/spinner";
import { StatCard } from "./components/stat-card";
import { StatusTimeline } from "./components/status-timeline";
import { StepDialog, type StepDialogStep } from "./components/step-dialog";
import { Stepper, StepList, Step, StepPanels, StepPanel } from "./components/stepper";
import { Switch } from "./components/switch";
import { Tabs } from "./components/tabs";
import { Textarea } from "./components/textarea";
import { Toaster, toast } from "./components/toast";
import { Tooltip } from "./components/tooltip";
import { TreeSelect, type TreeNode } from "./components/tree-select";

// ---------------------------------------------------------------------------
// Automated accessibility audit (axe-core) over EVERY jsdom-renderable component.
//
// Scope note — what this jsdom gate covers and what it deliberately does NOT:
//   • color-contrast is DISABLED below. jsdom has no layout/paint, so axe cannot
//     compute real contrast ratios — leaving it on produces meaningless passes or
//     false negatives. Contrast (and reflow/zoom) are verified in a later real-browser
//     pass, not here.
//   • Portal/overlay components (dialog, drawer, popover, tooltip, step-dialog,
//     confirm/dynamic dialog, toast) render into document.body, so we audit the whole
//     document, and open them (defaultOpen / imperative API) where jsdom allows so the
//     panel content is audited too.
//   • A few dropdowns (select, multi-select, tree-select, date-picker) have no
//     declarative open prop — their open panel is exercised in the browser pass; here
//     we audit the trigger/closed state.
// ---------------------------------------------------------------------------

// Rules disabled for this component-level jsdom gate:
//   • color-contrast — needs real layout/paint jsdom can't provide (browser pass).
//   • region — a best-practice PAGE rule ("all content in landmarks"); a component
//     rendered in isolation (and portal panels appended to <body>) are not responsible
//     for the host page's landmark structure, so it's noise here, not a component defect.
const axeOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
} as const;

const SELECT_OPTIONS: SelectItems = [
  { value: "us", label: "United States" },
  { value: "in", label: "India" },
];

const TREE_OPTIONS: TreeNode[] = [
  {
    value: "fruit",
    label: "Fruit",
    children: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
];

const TABLE_COLUMNS: DataTableColumn<{ id: number; name: string }>[] = [
  { id: "name", header: "Name", accessor: (r) => r.name },
];

const STEP_DIALOG_STEPS: StepDialogStep[] = [
  { title: "Account", description: "Your details", content: <p>Step one body</p> },
  { title: "Confirm", content: <p>Step two body</p> },
];

const cases: Array<[string, React.ReactElement]> = [
  // --- inline / static ---
  [
    "Accordion",
    <Accordion
      defaultValue="a"
      items={[
        { value: "a", title: "Section one", content: "Panel one content." },
        { value: "b", title: "Section two", content: "Panel two content." },
      ]}
    />,
  ],
  ["Alert", <Alert title="Heads up">Your changes have been saved.</Alert>],
  ["Alert (dismissible)", <Alert title="Heads up" onClose={() => {}}>Saved.</Alert>],
  [
    "Avatar + AvatarGroup",
    <div>
      <Avatar name="Ada Lovelace" />
      <AvatarGroup max={2}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Alan Turing" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>
    </div>,
  ],
  [
    "Badge + NotificationBadge",
    <div>
      <Badge variant="success">Active</Badge>
      <NotificationBadge count={5}>
        <button type="button" aria-label="Notifications">
          Bell
        </button>
      </NotificationBadge>
    </div>,
  ],
  ["Button", <Button>Save changes</Button>],
  ["Calendar (inline grid)", <Calendar defaultValue={new Date(2026, 0, 15)} />],
  // open state: browser pass — DatePicker has no declarative open prop
  ["DatePicker (trigger)", <DatePicker defaultValue={new Date(2026, 0, 15)} />],
  [
    "Card",
    <Card>
      <CardHeader>
        <CardTitle>Project Apollo</CardTitle>
        <CardDescription>Updated 2 hours ago</CardDescription>
      </CardHeader>
      <CardContent>Mission overview and status.</CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>,
  ],
  ["Checkbox (labelled)", <Checkbox aria-label="Accept terms" />],
  [
    "DataTable",
    <DataTable
      label="People"
      columns={TABLE_COLUMNS}
      data={[
        { id: 1, name: "Ada Lovelace" },
        { id: 2, name: "Alan Turing" },
      ]}
      rowKey={(r) => r.id}
    />,
  ],
  [
    "FloatLabel",
    <FloatLabel label="Email">
      <Input type="email" />
    </FloatLabel>,
  ],
  [
    "Input (labelled)",
    <label>
      Email
      <Input type="email" />
    </label>,
  ],
  ["InputOtp", <InputOtp length={6} aria-label="One-time code" />],
  ["MoneyInput", <MoneyInput currency="USD" locale="en-US" aria-label="Amount" />],
  // open state: browser pass — MultiSelect has no declarative open prop
  ["MultiSelect (trigger)", <MultiSelect aria-label="Tags" options={SELECT_OPTIONS} />],
  ["NumberInput", <NumberInput defaultValue="0" aria-label="Quantity" />],
  [
    "OrderList",
    <OrderList
      ariaLabel="Priorities"
      defaultValue={[
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ]}
      itemKey={(i) => i.id}
      renderItem={(i) => i.name}
    />,
  ],
  [
    "PickList",
    <PickList
      defaultValue={{ source: ["Alpha", "Beta"], target: ["Gamma"] }}
      itemKey={(w) => w}
      renderItem={(w) => w}
      sourceHeader="Available"
      targetHeader="Chosen"
    />,
  ],
  ["PasswordInput", <PasswordInput aria-label="Password" defaultValue="" />],
  ["ProgressBar", <ProgressBar value={60} label="Upload progress" showValue />],
  [
    "RadioGroup",
    <RadioGroup defaultValue="free" aria-label="Plan">
      <label>
        <RadioGroupItem value="free" /> Free
      </label>
      <label>
        <RadioGroupItem value="pro" /> Pro
      </label>
    </RadioGroup>,
  ],
  ["SecureField", <SecureField aria-label="API key" defaultValue="ak_live_7Hq2abcd" />],
  // open state: browser pass — Select has no declarative open prop
  ["Select (trigger)", <Select options={SELECT_OPTIONS} aria-label="Country" placeholder="Pick one" />],
  ["Spinner", <Spinner label="Loading" />],
  ["StatCard", <StatCard label="Revenue" value="$124,592" delta={12.5} deltaLabel="vs last month" />],
  [
    "StatusTimeline",
    <StatusTimeline
      label="Deployment progress"
      items={[
        { id: 1, title: "Queued", status: "complete", timestamp: "12:01" },
        { id: 2, title: "Building", status: "current", timestamp: "12:03" },
        { id: 3, title: "Deploy", status: "pending" },
      ]}
    />,
  ],
  [
    "Stepper",
    <Stepper defaultValue="one">
      <StepList>
        <Step value="one">Account</Step>
        <Step value="two">Confirm</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="one">Step one content</StepPanel>
        <StepPanel value="two">Step two content</StepPanel>
      </StepPanels>
    </Stepper>,
  ],
  ["Switch (labelled)", <Switch aria-label="Notifications" />],
  [
    "Tabs",
    <Tabs
      ariaLabel="Account sections"
      items={[
        { value: "profile", label: "Profile", content: <p>Profile panel</p> },
        { value: "billing", label: "Billing", content: <p>Billing panel</p> },
      ]}
    />,
  ],
  ["Textarea", <Textarea aria-label="Bio" defaultValue="Hello" />],
  // open state: browser pass — TreeSelect has no declarative open prop
  ["TreeSelect (trigger)", <TreeSelect options={TREE_OPTIONS} aria-label="Food" placeholder="Pick food" />],

  // --- portal/overlay, rendered OPEN (content portals into document.body) ---
  [
    "Dialog (open)",
    <Dialog defaultOpen title="Edit project" description="Update the details.">
      <p>Body content.</p>
    </Dialog>,
  ],
  [
    "Drawer (open)",
    <Drawer defaultOpen side="right" title="Filters" description="Refine results.">
      <p>Body content.</p>
    </Drawer>,
  ],
  ["StepDialog (open)", <StepDialog steps={STEP_DIALOG_STEPS} defaultOpen title="Set up workspace" />],
  [
    "Popover (open)",
    <Popover trigger={<button>Open</button>} ariaLabel="Quick actions" defaultOpen>
      <p>Panel content</p>
      <PopoverClose asChild>
        <button>Done</button>
      </PopoverClose>
    </Popover>,
  ],
  [
    "Tooltip (open)",
    <Tooltip content="Copy address" defaultOpen>
      <button>Copy</button>
    </Tooltip>,
  ],
];

describe("accessibility (axe)", () => {
  // Audit the whole document so portaled/overlay panels are included, not just the
  // render container.
  it.each(cases)("%s has no violations", async (_name, el) => {
    render(el);
    const results = await axe(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });

  // --- imperative overlays: open via their hook/API, then audit the document ---

  it("ConfirmDialog (open) has no violations", async () => {
    function OpenConfirm() {
      const confirm = useConfirm();
      React.useEffect(() => {
        void confirm({ title: "Delete project?", description: "This can't be undone." });
      }, [confirm]);
      return null;
    }
    await act(async () => {
      render(
        <ConfirmProvider>
          <OpenConfirm />
        </ConfirmProvider>,
      );
    });
    const results = await axe(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("DynamicDialog (open) has no violations", async () => {
    function OpenOnMount() {
      const dialog = useDialog();
      React.useEffect(() => {
        dialog.open(<p>Body content.</p>, {
          title: "Edit project",
          description: "Opened imperatively.",
        });
      }, [dialog]);
      return null;
    }
    await act(async () => {
      render(
        <DialogProvider>
          <OpenOnMount />
        </DialogProvider>,
      );
    });
    const results = await axe(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("Toast (visible) has no violations", async () => {
    render(<Toaster />);
    await act(async () => {
      toast.success("Saved", { description: "Your changes are live." });
    });
    const results = await axe(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
