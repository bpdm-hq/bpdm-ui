import { Component, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { axe } from "vitest-axe";

import { BpdmAccordion } from "./lib/accordion/accordion";
import { BpdmAlert } from "./lib/alert/alert";
import { BpdmAvatar, BpdmAvatarGroup, type AvatarGroupUser } from "./lib/avatar/avatar";
import { BpdmBadge, BpdmNotificationBadge } from "./lib/badge/badge";
import { BpdmButton } from "./lib/button/button";
import { BpdmCalendar } from "./lib/calendar/calendar";
import { BpdmDatePicker } from "./lib/calendar/date-picker";
import {
  BpdmCard,
  BpdmCardHeader,
  BpdmCardTitle,
  BpdmCardDescription,
  BpdmCardContent,
  BpdmCardFooter,
} from "./lib/card/card";
import { BpdmCheckbox } from "./lib/checkbox/checkbox";
import { BpdmConfirm } from "./lib/confirm-dialog/confirm-dialog";
import { BpdmDataTable } from "./lib/data-table/data-table";
import type { DataTableColumn } from "./lib/data-table/data-table-types";
import { BpdmDialog, BpdmDialogBody } from "./lib/dialog/dialog";
import { BpdmDrawer, BpdmDrawerBody } from "./lib/drawer/drawer";
import { BpdmDialogService } from "./lib/dynamic-dialog/dynamic-dialog";
import { BpdmFloatLabel } from "./lib/float-label/float-label";
import { BpdmInput } from "./lib/input/input";
import { BpdmInputOtp } from "./lib/input-otp/input-otp";
import { BpdmMoneyInput } from "./lib/money-input/money-input";
import { BpdmMultiSelect } from "./lib/multi-select/multi-select";
import { BpdmNumberInput } from "./lib/number-input/number-input";
import { BpdmOrderList } from "./lib/list/order-list";
import { BpdmPickList, type PickListValue } from "./lib/list/pick-list";
import { BpdmPasswordInput } from "./lib/password-input/password-input";
import { BpdmPopover, BpdmPopoverClose } from "./lib/popover/popover";
import { BpdmProgressBar } from "./lib/progress/progress-bar";
import { BpdmRadioGroup, BpdmRadio } from "./lib/radio-group/radio-group";
import { BpdmSecureField } from "./lib/secure-field/secure-field";
import { BpdmSelect, type SelectItems } from "./lib/select/select";
import { BpdmSpinner } from "./lib/spinner/spinner";
import { BpdmStatCard } from "./lib/stat-card/stat-card";
import { BpdmStatusTimeline, type TimelineItem } from "./lib/status-timeline/status-timeline";
import { BpdmStepDialog } from "./lib/step-dialog/step-dialog";
import {
  BpdmStepper,
  BpdmStepList,
  BpdmStep,
  BpdmStepPanels,
  BpdmStepPanel,
} from "./lib/stepper/stepper";
import { BpdmSwitch } from "./lib/switch/switch";
import { BpdmTabs, type TabItem } from "./lib/tabs/tabs";
import { BpdmTextarea } from "./lib/textarea/textarea";
import { BpdmToast, BpdmToaster } from "./lib/toast/toast";
import { BpdmTooltip } from "./lib/tooltip/tooltip";
import { BpdmTreeSelect, type TreeNode } from "./lib/tree-select/tree-select";

// ---------------------------------------------------------------------------
// Automated accessibility audit (axe-core) over EVERY jsdom-renderable component,
// mirroring the React package's a11y.test.tsx so both frameworks share one gate.
//
// Scope note — what this jsdom gate covers and what it deliberately does NOT:
//   • color-contrast is DISABLED. jsdom has no layout/paint, so axe cannot compute
//     real contrast ratios — leaving it on yields meaningless passes / false negatives.
//     Contrast (and reflow/zoom) are verified in a later real-browser pass, not here.
//   • region is DISABLED — it's a best-practice PAGE rule ("all content in landmarks");
//     a component tested in isolation (and CDK overlay panels appended to <body>) are
//     not responsible for the host page's landmark structure, so it's noise here.
//   • Overlay panels render into the CDK overlay container on <body>, so those tests
//     audit document.body and open the component ([open]/service) where jsdom allows.
//   • Dropdowns with no declarative open (select, multi-select, tree-select, date-picker)
//     are audited in their trigger/closed state here; open panels are a browser pass.
// ---------------------------------------------------------------------------

const axeOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
} as const;

async function expectNoViolations(root: Element) {
  const results = await axe(root, axeOptions);
  expect(results.violations).toEqual([]);
}

// Overlay components attach asynchronously (effects / afterNextRender); flush CD + tasks.
async function settle(fixture: { detectChanges: () => void; whenStable: () => Promise<unknown> }) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

type Row = { id: number; name: string };

// ── inline / static host components ─────────────────────────────────────────

@Component({
  imports: [BpdmAccordion],
  template: `<bpdm-accordion
    defaultValue="a"
    [items]="[
      { value: 'a', title: 'Section one', content: c1 },
      { value: 'b', title: 'Section two', content: c2 }
    ]" />
    <ng-template #c1>Panel one content.</ng-template>
    <ng-template #c2>Panel two content.</ng-template>`,
})
class AccordionHost {}

@Component({
  imports: [BpdmAlert],
  template: `<bpdm-alert title="Heads up">Your changes have been saved.</bpdm-alert>
    <bpdm-alert title="Heads up" [dismissible]="true">Saved.</bpdm-alert>`,
})
class AlertHost {}

@Component({
  imports: [BpdmAvatar, BpdmAvatarGroup],
  template: `<bpdm-avatar name="Ada Lovelace" />
    <bpdm-avatar-group [users]="users" [max]="2" />`,
})
class AvatarHost {
  users: AvatarGroupUser[] = [{ name: "Ada Lovelace" }, { name: "Alan Turing" }, { name: "Grace Hopper" }];
}

@Component({
  imports: [BpdmBadge, BpdmNotificationBadge],
  template: `<bpdm-badge variant="success">Active</bpdm-badge>
    <bpdm-notification-badge [count]="5">
      <button type="button" aria-label="Notifications">Bell</button>
    </bpdm-notification-badge>`,
})
class BadgeHost {}

@Component({ imports: [BpdmButton], template: `<button bpdmButton>Save changes</button>` })
class ButtonHost {}

@Component({ imports: [BpdmCalendar], template: `<bpdm-calendar [value]="date" />` })
class CalendarHost {
  date = new Date(2026, 0, 15);
}

// open state: browser pass — DatePicker has no declarative open input
@Component({ imports: [BpdmDatePicker], template: `<bpdm-date-picker [value]="date" />` })
class DatePickerHost {
  date = new Date(2026, 0, 15);
}

@Component({
  imports: [BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent, BpdmCardFooter],
  template: `<bpdm-card>
    <bpdm-card-header>
      <h3 bpdmCardTitle>Project Apollo</h3>
      <p bpdmCardDescription>Updated 2 hours ago</p>
    </bpdm-card-header>
    <div bpdmCardContent>Mission overview and status.</div>
    <div bpdmCardFooter>Footer</div>
  </bpdm-card>`,
})
class CardHost {}

@Component({ imports: [BpdmCheckbox], template: `<bpdm-checkbox aria-label="Accept terms" />` })
class CheckboxHost {}

@Component({
  imports: [BpdmDataTable],
  template: `<bpdm-data-table label="People" [columns]="columns" [data]="data" [rowKey]="rowKey" />`,
})
class DataTableHost {
  columns: DataTableColumn<Row>[] = [{ id: "name", header: "Name", accessor: (r) => r.name }];
  data: Row[] = [
    { id: 1, name: "Ada Lovelace" },
    { id: 2, name: "Alan Turing" },
  ];
  rowKey = (r: Row) => r.id;
}

@Component({
  imports: [BpdmFloatLabel, BpdmInput],
  template: `<bpdm-float-label label="Email"><input bpdmInput type="email" /></bpdm-float-label>`,
})
class FloatLabelHost {}

@Component({ imports: [BpdmInput], template: `<label>Email<input bpdmInput type="email" /></label>` })
class InputHost {}

@Component({ imports: [BpdmInputOtp], template: `<bpdm-input-otp [length]="6" aria-label="One-time code" />` })
class InputOtpHost {}

@Component({
  imports: [BpdmMoneyInput],
  template: `<bpdm-money-input currency="USD" locale="en-US" aria-label="Amount" />`,
})
class MoneyInputHost {}

// open state: browser pass — MultiSelect has no declarative open input
@Component({
  imports: [BpdmMultiSelect],
  template: `<bpdm-multi-select aria-label="Tags" [options]="options" />`,
})
class MultiSelectHost {
  options: SelectItems = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];
}

@Component({ imports: [BpdmNumberInput], template: `<bpdm-number-input defaultValue="0" aria-label="Quantity" />` })
class NumberInputHost {}

@Component({
  imports: [BpdmOrderList],
  template: `<bpdm-order-list
    ariaLabel="Priorities"
    [defaultValue]="data"
    [itemKey]="keyFn"
    [itemTemplate]="rowTpl">
    <ng-template #rowTpl let-item>{{ item.name }}</ng-template>
  </bpdm-order-list>`,
})
class OrderListHost {
  data = [
    { id: "1", name: "Alpha" },
    { id: "2", name: "Beta" },
  ];
  keyFn = (i: { id: string; name: string }) => i.id;
}

@Component({
  imports: [BpdmPickList],
  template: `<bpdm-pick-list
    [defaultValue]="value"
    [itemKey]="key"
    [itemTemplate]="tpl"
    sourceHeader="Available"
    targetHeader="Chosen">
    <ng-template #tpl let-item>{{ item }}</ng-template>
  </bpdm-pick-list>`,
})
class PickListHost {
  key = (w: string) => w;
  value: PickListValue<string> = { source: ["Alpha", "Beta"], target: ["Gamma"] };
}

@Component({ imports: [BpdmPasswordInput], template: `<bpdm-password-input aria-label="Password" />` })
class PasswordInputHost {}

@Component({
  imports: [BpdmProgressBar],
  template: `<bpdm-progress-bar [value]="60" label="Upload progress" [showValue]="true" />`,
})
class ProgressHost {}

@Component({
  imports: [BpdmRadioGroup, BpdmRadio],
  template: `<bpdm-radio-group [value]="'free'" aria-label="Plan">
    <label><bpdm-radio value="free" /> Free</label>
    <label><bpdm-radio value="pro" /> Pro</label>
  </bpdm-radio-group>`,
})
class RadioHost {}

@Component({
  imports: [BpdmSecureField],
  template: `<bpdm-secure-field aria-label="API key" defaultValue="ak_live_7Hq2abcd" />`,
})
class SecureFieldHost {}

// open state: browser pass — Select has no declarative open input
@Component({
  imports: [BpdmSelect],
  template: `<bpdm-select [options]="options" aria-label="Country" placeholder="Pick one" />`,
})
class SelectHost {
  options: SelectItems = [
    { value: "us", label: "United States" },
    { value: "in", label: "India" },
  ];
}

@Component({ imports: [BpdmSpinner], template: `<bpdm-spinner label="Loading" />` })
class SpinnerHost {}

@Component({
  imports: [BpdmStatCard],
  template: `<bpdm-stat-card label="Revenue" value="$124,592" [delta]="12.5" deltaLabel="vs last month" />`,
})
class StatCardHost {}

@Component({
  imports: [BpdmStatusTimeline],
  template: `<bpdm-status-timeline label="Deployment progress" [items]="items" />`,
})
class StatusTimelineHost {
  items: TimelineItem[] = [
    { id: 1, title: "Queued", status: "complete", timestamp: "12:01" },
    { id: 2, title: "Building", status: "current", timestamp: "12:03" },
    { id: 3, title: "Deploy", status: "pending" },
  ];
}

@Component({
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel],
  template: `<bpdm-stepper defaultValue="one">
    <bpdm-step-list>
      <bpdm-step value="one">Account</bpdm-step>
      <bpdm-step value="two">Confirm</bpdm-step>
    </bpdm-step-list>
    <bpdm-step-panels>
      <bpdm-step-panel value="one">Step one content</bpdm-step-panel>
      <bpdm-step-panel value="two">Step two content</bpdm-step-panel>
    </bpdm-step-panels>
  </bpdm-stepper>`,
})
class StepperHost {}

@Component({ imports: [BpdmSwitch], template: `<bpdm-switch aria-label="Notifications" />` })
class SwitchHost {}

@Component({ imports: [BpdmTabs], template: `<bpdm-tabs ariaLabel="Account sections" [items]="items" />` })
class TabsHost {
  items: TabItem[] = [
    { value: "profile", label: "Profile" },
    { value: "billing", label: "Billing" },
  ];
}

@Component({ imports: [BpdmTextarea], template: `<textarea bpdmTextarea aria-label="Bio">Hello</textarea>` })
class TextareaHost {}

// open state: browser pass — TreeSelect has no declarative open input
@Component({
  imports: [BpdmTreeSelect],
  template: `<bpdm-tree-select aria-label="Food" placeholder="Pick food" [options]="options" />`,
})
class TreeSelectHost {
  options: TreeNode[] = [
    { value: "fruit", label: "Fruit", children: [{ value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }] },
  ];
}

// ── overlay host components (rendered OPEN; content portals into <body>) ─────

@Component({
  imports: [BpdmDialog, BpdmDialogBody],
  template: `<bpdm-dialog [open]="true" title="Edit project" description="Update the details.">
    <ng-template bpdmDialogBody><p>Body content.</p></ng-template>
  </bpdm-dialog>`,
})
class DialogHost {}

@Component({
  imports: [BpdmDrawer, BpdmDrawerBody],
  template: `<bpdm-drawer [open]="true" side="right" title="Filters" description="Refine results.">
    <ng-template bpdmDrawerBody><p>Body content.</p></ng-template>
  </bpdm-drawer>`,
})
class DrawerHost {}

@Component({
  imports: [BpdmStepDialog],
  template: `<bpdm-step-dialog
    [open]="true"
    title="Set up workspace"
    [steps]="[
      { title: 'Account', description: 'Your details', content: s1 },
      { title: 'Confirm', content: s2 }
    ]" />
    <ng-template #s1><p>Step one body</p></ng-template>
    <ng-template #s2><p>Step two body</p></ng-template>`,
})
class StepDialogHost {}

@Component({
  imports: [BpdmPopover, BpdmPopoverClose],
  template: `<button [bpdmPopover]="panel" [bpdmPopoverAriaLabel]="'Quick actions'" [(bpdmPopoverOpen)]="open">
      Open
    </button>
    <ng-template #panel><p>Panel content</p><button bpdmPopoverClose>Done</button></ng-template>`,
})
class PopoverHost {
  open = true;
}

@Component({ imports: [BpdmToaster], template: `<bpdm-toaster />` })
class ToastHost {}

@Component({ template: `<ng-template #body><p>Body content.</p></ng-template>` })
class DynamicDialogHost {
  body = viewChild.required<TemplateRef<unknown>>("body");
}

// open state: browser pass — the tooltip bubble is shown imperatively on
// hover/focus via a delayed CDK overlay; only the trigger is audited here.
@Component({ imports: [BpdmTooltip], template: `<button bpdmTooltip="Copy address">Copy</button>` })
class TooltipHost {}

describe("accessibility (axe)", () => {
  afterEach(() => {
    // CDK overlays append to <body>; clear them so document.body scans stay isolated.
    document.querySelectorAll(".cdk-overlay-container, .cdk-overlay-container ~ *").forEach((n) => n.remove());
  });

  const inlineCases: Array<[string, new () => object]> = [
    ["Accordion", AccordionHost],
    ["Alert", AlertHost],
    ["Avatar + AvatarGroup", AvatarHost],
    ["Badge + NotificationBadge", BadgeHost],
    ["Button", ButtonHost],
    ["Calendar", CalendarHost],
    ["DatePicker (trigger)", DatePickerHost],
    ["Card", CardHost],
    ["Checkbox", CheckboxHost],
    ["DataTable", DataTableHost],
    ["FloatLabel", FloatLabelHost],
    ["Input", InputHost],
    ["InputOtp", InputOtpHost],
    ["MoneyInput", MoneyInputHost],
    ["MultiSelect (trigger)", MultiSelectHost],
    ["NumberInput", NumberInputHost],
    ["OrderList", OrderListHost],
    ["PickList", PickListHost],
    ["PasswordInput", PasswordInputHost],
    ["ProgressBar", ProgressHost],
    ["RadioGroup", RadioHost],
    ["SecureField", SecureFieldHost],
    ["Select (trigger)", SelectHost],
    ["Spinner", SpinnerHost],
    ["StatCard", StatCardHost],
    ["StatusTimeline", StatusTimelineHost],
    ["Stepper", StepperHost],
    ["Switch", SwitchHost],
    ["Tabs", TabsHost],
    ["Textarea", TextareaHost],
    ["TreeSelect (trigger)", TreeSelectHost],
    ["Tooltip (trigger)", TooltipHost],
  ];

  it.each(inlineCases)("%s has no violations", async (_name, Host) => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await expectNoViolations(fixture.nativeElement);
  });

  const overlayCases: Array<[string, new () => object]> = [
    ["Dialog (open)", DialogHost],
    ["Drawer (open)", DrawerHost],
    ["StepDialog (open)", StepDialogHost],
    ["Popover (open)", PopoverHost],
  ];

  it.each(overlayCases)("%s has no violations", async (_name, Host) => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    await expectNoViolations(document.body);
  });

  it("Toast (visible) has no violations", async () => {
    const fixture = TestBed.createComponent(ToastHost);
    await settle(fixture);
    TestBed.inject(BpdmToast).success("Saved", { description: "Your changes are live." });
    await settle(fixture);
    await expectNoViolations(document.body);
  });

  it("DynamicDialog (open) has no violations", async () => {
    const fixture = TestBed.createComponent(DynamicDialogHost);
    fixture.detectChanges();
    TestBed.inject(BpdmDialogService).open(fixture.componentInstance.body(), {
      title: "Edit project",
      description: "Opened imperatively.",
    });
    await settle(fixture);
    await expectNoViolations(document.body);
  });

  it("ConfirmDialog (open) has no violations", async () => {
    // A fixture keeps a live change-detection cycle for the overlay panel.
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    void TestBed.inject(BpdmConfirm).confirm({
      title: "Delete project?",
      description: "This can't be undone.",
    });
    await settle(fixture);
    await expectNoViolations(document.body);
  });
});
