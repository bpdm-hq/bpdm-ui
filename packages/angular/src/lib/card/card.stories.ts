import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import {
  BpdmCard,
  BpdmCardContent,
  BpdmCardDescription,
  BpdmCardFooter,
  BpdmCardHeader,
  BpdmCardTitle,
} from "./card";
import { BpdmButton } from "../button/button";

const CARD_PARTS = [
  BpdmCard,
  BpdmCardHeader,
  BpdmCardTitle,
  BpdmCardDescription,
  BpdmCardContent,
  BpdmCardFooter,
  BpdmButton,
];

/**
 * `<bpdm-card>` — a surface container composed with header / title / description
 * / content / footer parts. Same surfaces and motion as the React card.
 */
const meta: Meta<BpdmCard> = {
  title: "Data Display/Card",
  decorators: [moduleMetadata({ imports: CARD_PARTS })],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "soft"],
      description: "Surface style",
    },
    hoverable: { control: "boolean", description: "Lift on hover" },
    interactive: { control: "boolean", description: "Focusable + pressable" },
  },
  args: { variant: "elevated", hoverable: false, interactive: false },
  render: (args) => ({
    props: args,
    template: `<bpdm-card [variant]="variant" [hoverable]="hoverable" [interactive]="interactive" class="max-w-sm">
  <bpdm-card-header>
    <h3 bpdmCardTitle>Production deploy</h3>
    <p bpdmCardDescription>Build #482 · 2 minutes ago</p>
  </bpdm-card-header>
  <div bpdmCardContent>Rolling out to all regions. Traffic is shifting gradually with automatic rollback armed.</div>
  <div bpdmCardFooter divider>
    <button bpdmButton size="sm" variant="outline">View logs</button>
    <button bpdmButton size="sm">Promote</button>
  </div>
</bpdm-card>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmCard>;

/** Play with every option from the controls panel. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription,
  BpdmCardContent, BpdmCardFooter, BpdmButton,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-demo',
  imports: [
    BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription,
    BpdmCardContent, BpdmCardFooter, BpdmButton,
  ],
  template: \`
    <bpdm-card variant="elevated" class="max-w-sm">
      <bpdm-card-header>
        <h3 bpdmCardTitle>Production deploy</h3>
        <p bpdmCardDescription>Build #482 · 2 minutes ago</p>
      </bpdm-card-header>
      <div bpdmCardContent>
        Rolling out to all regions. Traffic is shifting gradually
        with automatic rollback armed.
      </div>
      <div bpdmCardFooter divider>
        <button bpdmButton size="sm" variant="outline">View logs</button>
        <button bpdmButton size="sm">Promote</button>
      </div>
    </bpdm-card>
  \`,
})
export class CardDemoComponent {}`,
      },
    },
  },
};

/** The three surface styles. */
export const Variants: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="grid gap-4 sm:grid-cols-3">
  <bpdm-card variant="elevated"><div bpdmCardContent>Elevated — shadow, no border.</div></bpdm-card>
  <bpdm-card variant="outlined"><div bpdmCardContent>Outlined — border, no shadow.</div></bpdm-card>
  <bpdm-card variant="soft"><div bpdmCardContent>Soft — muted fill.</div></bpdm-card>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCard, BpdmCardContent } from '@bpdm/ng';

@Component({
  selector: 'app-card-variants',
  imports: [BpdmCard, BpdmCardContent],
  template: \`
    <div class="grid gap-4 sm:grid-cols-3">
      <bpdm-card variant="elevated"><div bpdmCardContent>Elevated — shadow, no border.</div></bpdm-card>
      <bpdm-card variant="outlined"><div bpdmCardContent>Outlined — border, no shadow.</div></bpdm-card>
      <bpdm-card variant="soft"><div bpdmCardContent>Soft — muted fill.</div></bpdm-card>
    </div>
  \`,
})
export class CardVariantsComponent {}`,
      },
    },
  },
};
