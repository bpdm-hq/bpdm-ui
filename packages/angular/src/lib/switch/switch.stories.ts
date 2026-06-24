import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmSwitch } from "./switch";

/**
 * Toggle switch — three sizes, three shapes (`pill`/`square`/`sharp`), and an
 * optional ✓/✗ glyph. Works with `[(ngModel)]` / reactive forms or `[(checked)]`.
 */
const meta: Meta<BpdmSwitch> = {
  title: "Selection/Switch",
  component: BpdmSwitch,
  decorators: [moduleMetadata({ imports: [BpdmSwitch] })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["pill", "square", "sharp"] },
    icon: { control: "boolean" },
  },
  args: { size: "md", shape: "pill", icon: false },
  render: (args) => ({
    props: args,
    // no [checked] binding — self-manages clicks (avoids the arg-vs-toggle flicker)
    template: `<bpdm-switch [size]="size" [shape]="shape" [icon]="icon"></bpdm-switch>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmSwitch>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-demo',
  imports: [BpdmSwitch, FormsModule],
  template: \`<bpdm-switch [(ngModel)]="notifications" />\`,
})
export class SwitchDemoComponent {
  notifications = true;
}`,
      },
    },
  },
};

/** On, off, disabled. */
export const States: Story = {
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-switch [checked]="true" />
  <bpdm-switch />
  <bpdm-switch disabled [checked]="true" />
  <bpdm-switch disabled />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-states',
  imports: [BpdmSwitch],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-switch [checked]="true" />
      <bpdm-switch />
      <bpdm-switch disabled [checked]="true" />
      <bpdm-switch disabled />
    </div>
  \`,
})
export class SwitchStatesComponent {}`,
      },
    },
  },
};

/** Three shapes. */
export const Shapes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-switch shape="pill" [checked]="true" />
  <bpdm-switch shape="square" [checked]="true" />
  <bpdm-switch shape="sharp" [checked]="true" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-shapes',
  imports: [BpdmSwitch],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-switch shape="pill" [checked]="true" />
      <bpdm-switch shape="square" [checked]="true" />
      <bpdm-switch shape="sharp" [checked]="true" />
    </div>
  \`,
})
export class SwitchShapesComponent {}`,
      },
    },
  },
};

/** A ✓/✗ glyph inside the thumb. */
export const WithIcon: Story = {
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-switch icon [checked]="true" />
  <bpdm-switch icon />
  <bpdm-switch icon size="lg" [checked]="true" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-icon',
  imports: [BpdmSwitch],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-switch icon [checked]="true" />
      <bpdm-switch icon />
      <bpdm-switch icon size="lg" [checked]="true" />
    </div>
  \`,
})
export class SwitchIconComponent {}`,
      },
    },
  },
};

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-switch size="sm" [checked]="true" />
  <bpdm-switch size="md" [checked]="true" />
  <bpdm-switch size="lg" [checked]="true" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-sizes',
  imports: [BpdmSwitch],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-switch size="sm" [checked]="true" />
      <bpdm-switch size="md" [checked]="true" />
      <bpdm-switch size="lg" [checked]="true" />
    </div>
  \`,
})
export class SwitchSizesComponent {}`,
      },
    },
  },
};

/** Paired with a clickable label. */
export const WithLabel: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<label class="flex cursor-pointer items-center gap-3 text-sm">
  <bpdm-switch [checked]="true" /> Airplane mode
</label>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-label',
  imports: [BpdmSwitch, FormsModule],
  template: \`
    <label class="flex cursor-pointer items-center gap-3 text-sm">
      <bpdm-switch [(ngModel)]="airplane" /> Airplane mode
    </label>
  \`,
})
export class SwitchLabelComponent {
  airplane = true;
}`,
      },
    },
  },
};

/** A settings list. */
export const SettingsList: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-4 text-sm">
  <div class="flex items-center justify-between gap-8">
    <label class="cursor-pointer">Two-factor authentication</label>
    <bpdm-switch [checked]="true" />
  </div>
  <div class="flex items-center justify-between gap-8">
    <label class="cursor-pointer">Email notifications</label>
    <bpdm-switch />
  </div>
  <div class="flex items-center justify-between gap-8">
    <label class="cursor-pointer">Beta features</label>
    <bpdm-switch [checked]="true" />
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSwitch } from '@bpdm/ng';

@Component({
  selector: 'app-switch-settings',
  imports: [BpdmSwitch],
  template: \`
    <div class="flex w-72 flex-col gap-4 text-sm">
      <div class="flex items-center justify-between gap-8">
        <label class="cursor-pointer">Two-factor authentication</label>
        <bpdm-switch [checked]="true" />
      </div>
      <div class="flex items-center justify-between gap-8">
        <label class="cursor-pointer">Email notifications</label>
        <bpdm-switch />
      </div>
      <div class="flex items-center justify-between gap-8">
        <label class="cursor-pointer">Beta features</label>
        <bpdm-switch [checked]="true" />
      </div>
    </div>
  \`,
})
export class SwitchSettingsComponent {}`,
      },
    },
  },
};
