import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmSecureField } from "./secure-field";

/**
 * Masked input for sensitive values — API keys, secrets, license keys, tokens.
 * Masked at rest (with an optional visible tail), a reveal toggle, and an optional
 * copy button. Uses text + masking (not `type=password`) so password managers don't
 * hijack it. `(valueChange)` / copy always give the real value.
 *
 * ```html
 * <bpdm-secure-field format="grouped" [unmaskedTail]="4" placeholder="License key" />
 * <bpdm-secure-field copyable defaultValue="ak_live_7Hq2..." placeholder="API key" />
 * ```
 */
const meta: Meta<BpdmSecureField> = {
  title: "Inputs/SecureField",
  component: BpdmSecureField,
  decorators: [moduleMetadata({ imports: [BpdmSecureField] })],
  tags: ["autodocs"],
  argTypes: {
    format: { control: "inline-radio", options: ["none", "grouped"] },
    unmaskedTail: { control: { type: "number", min: 0, max: 8 } },
    revealable: { control: "boolean" },
    copyable: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
  },
  args: {
    format: "grouped",
    unmaskedTail: 4,
    revealable: true,
    copyable: false,
    size: "md",
    defaultValue: "4821095512470066",
    placeholder: "License key",
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-72">
  <bpdm-secure-field
    [format]="format"
    [unmaskedTail]="unmaskedTail"
    [revealable]="revealable"
    [copyable]="copyable"
    [size]="size"
    [disabled]="disabled"
    [defaultValue]="defaultValue"
    [placeholder]="placeholder"
  />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmSecureField>;

export const Playground: Story = {};

// grouped 4-4-4-4, last 4 visible, reveal to see the full key
export const LicenseKey: Story = {
  render: () => ({
    template: `<div class="w-72">
  <bpdm-secure-field format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" placeholder="License key" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSecureField } from '@bpdm/ng';

@Component({
  selector: 'app-secure-license',
  imports: [BpdmSecureField],
  template: \`<bpdm-secure-field format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" placeholder="License key" />\`,
})
export class SecureLicenseComponent {}`,
      },
    },
  },
};

// API key / secret — fully masked, copy + reveal
export const ApiKey: Story = {
  render: () => ({
    template: `<div class="w-80">
  <bpdm-secure-field copyable defaultValue="ak_live_7Hq2eZvKf3mQpe9Qa1Lx" placeholder="API key" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSecureField } from '@bpdm/ng';

@Component({
  selector: 'app-secure-apikey',
  imports: [BpdmSecureField],
  template: \`<bpdm-secure-field copyable defaultValue="ak_live_7Hq2eZvKf3mQpe9Qa1Lx" placeholder="API key" />\`,
})
export class SecureApiKeyComponent {}`,
      },
    },
  },
};

// show the last 4 of a serial number while masked
export const SerialTail: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-80">
  <bpdm-secure-field [unmaskedTail]="4" copyable defaultValue="SN8842019930245011" placeholder="Serial number" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSecureField } from '@bpdm/ng';

@Component({
  selector: 'app-secure-serial',
  imports: [BpdmSecureField],
  template: \`<bpdm-secure-field [unmaskedTail]="4" copyable defaultValue="SN8842019930245011" placeholder="Serial number" />\`,
})
export class SecureSerialComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-3">
  <bpdm-secure-field size="sm" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
  <bpdm-secure-field size="md" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
  <bpdm-secure-field size="lg" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSecureField } from '@bpdm/ng';

@Component({
  selector: 'app-secure-sizes',
  imports: [BpdmSecureField],
  template: \`
    <div class="flex w-72 flex-col gap-3">
      <bpdm-secure-field size="sm" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
      <bpdm-secure-field size="md" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
      <bpdm-secure-field size="lg" format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />
    </div>
  \`,
})
export class SecureSizesComponent {}`,
      },
    },
  },
};

export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-1.5">
  <bpdm-secure-field aria-invalid="true" format="grouped" [unmaskedTail]="4" defaultValue="4821" />
  <p class="text-sm text-destructive-strong">Enter a valid license key.</p>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSecureField } from '@bpdm/ng';

@Component({
  selector: 'app-secure-invalid',
  imports: [BpdmSecureField],
  template: \`
    <div class="flex w-72 flex-col gap-1.5">
      <bpdm-secure-field aria-invalid="true" format="grouped" [unmaskedTail]="4" defaultValue="4821" />
      <p class="text-sm text-destructive-strong">Enter a valid license key.</p>
    </div>
  \`,
})
export class SecureInvalidComponent {}`,
      },
    },
  },
};
