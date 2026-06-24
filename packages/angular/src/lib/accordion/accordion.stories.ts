import { Component, computed, input, TemplateRef, viewChild } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import {
  type AccordionItemData,
  type AccordionType,
  type AccordionVariant,
  BpdmAccordion,
} from "./accordion";

@Component({
  selector: "demo-accordion",
  imports: [BpdmAccordion],
  template: `
    <div class="w-full max-w-xl">
      <bpdm-accordion
        [items]="items()"
        [variant]="variant()"
        [type]="type()"
        [defaultValue]="defaultValue()"
      />
    </div>
    <ng-template #deploys>Every merge to the main branch kicks off a build and a production deploy. You can also trigger a manual deploy from the dashboard.</ng-template>
    <ng-template #rollback>Yes — open any past deploy and choose “Promote to production” to instantly roll back to that version.</ng-template>
    <ng-template #logs>Build and runtime logs are retained for 30 days and are searchable per deploy and per service.</ng-template>
    <ng-template #members>Open Settings → Members, enter their email and pick a role. They’ll receive an invite link by email.</ng-template>

    <ng-template #rocket><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></svg></ng-template>
    <ng-template #rotate><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg></ng-template>
    <ng-template #file><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg></ng-template>
    <ng-template #users><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></ng-template>
  `,
})
class AccordionDemo {
  readonly variant = input<AccordionVariant>("default");
  readonly type = input<AccordionType>("single");
  readonly defaultValue = input<string | string[]>("deploys");
  readonly withIcons = input(false);
  readonly disabledValue = input<string>("");

  private readonly deploys = viewChild<TemplateRef<unknown>>("deploys");
  private readonly rollback = viewChild<TemplateRef<unknown>>("rollback");
  private readonly logs = viewChild<TemplateRef<unknown>>("logs");
  private readonly members = viewChild<TemplateRef<unknown>>("members");
  private readonly rocket = viewChild<TemplateRef<unknown>>("rocket");
  private readonly rotate = viewChild<TemplateRef<unknown>>("rotate");
  private readonly file = viewChild<TemplateRef<unknown>>("file");
  private readonly users = viewChild<TemplateRef<unknown>>("users");

  readonly items = computed<AccordionItemData[]>(() => {
    const c = [this.deploys(), this.rollback(), this.logs(), this.members()];
    if (c.some((x) => !x)) return [];
    const icons = this.withIcons()
      ? [this.rocket(), this.rotate(), this.file(), this.users()]
      : [undefined, undefined, undefined, undefined];
    const dis = this.disabledValue();
    const base = [
      { value: "deploys", title: "How are deploys triggered?", content: c[0]! },
      { value: "rollback", title: "Can I roll back a release?", content: c[1]! },
      { value: "logs", title: "Where are build logs stored?", content: c[2]! },
      { value: "members", title: "How do I invite a teammate?", content: c[3]! },
    ];
    return base.map((b, i) => ({
      ...b,
      icon: icons[i] ?? undefined,
      disabled: b.value === dis,
    }));
  });
}

const usage = `
Accordion (keyboard + ARIA) with a smoothly animated height, a rotating chevron,
and three looks — \`default\` (a bordered list), \`separated\` (each item a card), and
\`borderless\`. Single or multiple panels open at once. Data-driven via \`items\`.

\`\`\`html
<bpdm-accordion [items]="faq" variant="separated" defaultValue="deploys" />
\`\`\`
`;

const meta: Meta = {
  title: "Navigation/Accordion",
  decorators: [moduleMetadata({ imports: [AccordionDemo] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "separated", "borderless"] },
  },
  args: { variant: "default" },
  render: (args) => ({
    props: args,
    template: `<demo-accordion [variant]="variant" defaultValue="deploys" />`,
  }),
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmAccordion, AccordionItemData } from '@bpdm/ng';

@Component({
  selector: 'app-faq',
  imports: [BpdmAccordion],
  template: \`
    <bpdm-accordion [items]="items()" defaultValue="deploys" />
    <ng-template #deploys>Every merge to main deploys to production.</ng-template>
    <ng-template #rollback>Promote any past deploy to roll back.</ng-template>
  \`,
})
export class FaqComponent {
  private deploys = viewChild<TemplateRef<unknown>>('deploys');
  private rollback = viewChild<TemplateRef<unknown>>('rollback');
  items = computed<AccordionItemData[]>(() => {
    const d = this.deploys(), r = this.rollback();
    return d && r ? [
      { value: 'deploys', title: 'How are deploys triggered?', content: d },
      { value: 'rollback', title: 'Can I roll back a release?', content: r },
    ] : [];
  });
}`,
      },
    },
  },
};

/** Minimal — no container border, just dividers; the open header stands out. */
export const Borderless: Story = {
  render: () => ({ template: `<demo-accordion variant="borderless" defaultValue="rollback" />` }),
};

/** Each item is its own card. */
export const Separated: Story = {
  render: () => ({ template: `<demo-accordion variant="separated" defaultValue="deploys" />` }),
};

/** A leading icon per item. */
export const WithIcons: Story = {
  render: () => ({ template: `<demo-accordion variant="separated" [withIcons]="true" />` }),
};

/** More than one panel open at a time. */
export const Multiple: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { dv: ["deploys", "logs"] },
    template: `<demo-accordion type="multiple" [defaultValue]="dv" />`,
  }),
};

/** A disabled item can't be toggled. */
export const DisabledItem: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-accordion disabledValue="rollback" defaultValue="deploys" />` }),
};
