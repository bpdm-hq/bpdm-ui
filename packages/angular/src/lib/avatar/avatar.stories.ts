import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmAvatar, BpdmAvatarGroup } from "./avatar";
import { BpdmNotificationBadge } from "../badge/badge";

// Demo-only: a license-free gradient avatar (inline SVG data URI) from a seed —
// no external image service, no copyright. Real apps pass their own photos.
function genAvatar(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = h % 360;
  const b = (a + 78) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${a} 64% 56%)'/><stop offset='1' stop-color='hsl(${b} 60% 46%)'/></linearGradient></defs><rect width='120' height='120' fill='url(#g)'/><circle cx='38' cy='44' r='34' fill='hsl(${b} 72% 70%)' opacity='0.45'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PEOPLE = ["Aria Lindqvist", "Theo Brandt", "Lena Cho", "Mateo Silva", "Ines Vidal", "Sam Reyes"].map(
  (name) => ({ name, src: genAvatar(name) }),
);

/**
 * Avatar with a graceful fallback chain — image → initials (auto-tinted from the
 * name) → person icon. Circle or square, six sizes, an optional presence dot, and
 * a `<bpdm-avatar-group>` that overlaps avatars with a `+N` overflow.
 */
const meta: Meta<BpdmAvatar> = {
  title: "Data Display/Avatar",
  decorators: [moduleMetadata({ imports: [BpdmAvatar, BpdmAvatarGroup, BpdmNotificationBadge] })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl", "2xl"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    status: { control: "inline-radio", options: [undefined, "online", "busy", "away", "offline"] },
    colorful: { control: "boolean" },
    name: { control: "text" },
    src: { control: "text" },
  },
  args: { name: "Aria Lindqvist", size: "lg", shape: "circle" },
  render: (args) => ({
    props: args,
    template: `<bpdm-avatar [name]="name" [src]="src" [size]="size" [shape]="shape" [status]="status" [colorful]="colorful !== false"></bpdm-avatar>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmAvatar>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-demo',
  imports: [BpdmAvatar],
  template: \`<bpdm-avatar name="Aria Lindqvist" size="lg" />\`,
})
export class AvatarDemoComponent {}`,
      },
    },
  },
};

/** Fallback to initials, auto-tinted deterministically from the name. */
export const Initials: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  @for (name of ['Aria Lindqvist','Theo Brandt','Lena Cho','Mateo Silva','Ines Vidal','Sam Reyes']; track name) {
    <bpdm-avatar [name]="name" size="lg" />
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-initials',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      @for (name of names; track name) {
        <bpdm-avatar [name]="name" size="lg" />
      }
    </div>
  \`,
})
export class AvatarInitialsComponent {
  readonly names = ['Aria Lindqvist','Theo Brandt','Lena Cho','Mateo Silva','Ines Vidal','Sam Reyes'];
}`,
      },
    },
  },
};

/** Real photos; a broken URL falls back to initials automatically. */
export const WithImage: Story = {
  render: () => ({
    props: { people: PEOPLE.slice(0, 4) },
    template: `<div class="flex flex-wrap items-center gap-3">
  @for (p of people; track p.name) {
    <bpdm-avatar [name]="p.name" [src]="p.src" size="lg" />
  }
  <bpdm-avatar name="Clara Bauer" src="https://invalid.example/none.jpg" size="lg" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-image',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      @for (p of people; track p.name) {
        <bpdm-avatar [name]="p.name" [src]="p.src" size="lg" />
      }
      <!-- a broken URL falls back to initials automatically -->
      <bpdm-avatar name="Clara Bauer" src="https://invalid.example/none.jpg" size="lg" />
    </div>
  \`,
})
export class AvatarImageComponent {
  readonly people = [
    { name: 'Aria Lindqvist', src: '/aria.jpg' },
    { name: 'Theo Brandt', src: '/theo.jpg' },
    { name: 'Lena Cho', src: '/lena.jpg' },
    { name: 'Mateo Silva', src: '/mateo.jpg' },
  ];
}`,
      },
    },
  },
};

/** Presence dot. */
export const Status: Story = {
  render: () => ({
    props: { a: PEOPLE[0].src, c: PEOPLE[2].src },
    template: `<div class="flex flex-wrap items-center gap-3">
  <bpdm-avatar name="Aria Lindqvist" [src]="a" size="lg" status="online" />
  <bpdm-avatar name="Theo Brandt" size="lg" status="busy" />
  <bpdm-avatar name="Lena Cho" [src]="c" size="lg" status="away" />
  <bpdm-avatar name="Mateo Silva" size="lg" status="offline" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-status',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" status="online" />
      <bpdm-avatar name="Theo Brandt" size="lg" status="busy" />
      <bpdm-avatar name="Lena Cho" src="/lena.jpg" size="lg" status="away" />
      <bpdm-avatar name="Mateo Silva" size="lg" status="offline" />
    </div>
  \`,
})
export class AvatarStatusComponent {}`,
      },
    },
  },
};

/** Overlapping stack with a `+N` overflow tile. */
export const Group: Story = {
  render: () => ({
    props: {
      people: PEOPLE,
      initialsOnly: ["Aria Lindqvist", "Theo Brandt", "Lena Cho", "Mateo Silva", "Ines Vidal", "Sam Reyes", "Nina Berg"].map(
        (name) => ({ name }),
      ),
    },
    template: `<div class="flex flex-col gap-4">
  <bpdm-avatar-group [users]="people" [max]="4" />
  <bpdm-avatar-group [users]="initialsOnly" [max]="5" size="sm" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatarGroup } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-group',
  imports: [BpdmAvatarGroup],
  template: \`
    <bpdm-avatar-group [users]="team" [max]="4" />
  \`,
})
export class AvatarGroupComponent {
  readonly team = [
    { name: 'Aria Lindqvist', src: '/aria.jpg' },
    { name: 'Theo Brandt', src: '/theo.jpg' },
    { name: 'Lena Cho', src: '/lena.jpg' },
    { name: 'Mateo Silva' },
    { name: 'Ines Vidal' },
    { name: 'Sam Reyes' },
  ];
}`,
      },
    },
  },
};

/** Six sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { src: PEOPLE[0].src },
    template: `<div class="flex flex-wrap items-end gap-3">
  @for (size of ['xs','sm','md','lg','xl','2xl']; track size) {
    <bpdm-avatar name="Aria Lindqvist" [src]="src" [size]="size" />
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar, AvatarSize } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-sizes',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-end gap-3">
      @for (size of sizes; track size) {
        <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" [size]="size" />
      }
    </div>
  \`,
})
export class AvatarSizesComponent {
  readonly sizes: AvatarSize[] = ['xs','sm','md','lg','xl','2xl'];
}`,
      },
    },
  },
};

/** Circle or square. */
export const Shapes: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { src: PEOPLE[0].src },
    template: `<div class="flex flex-wrap items-center gap-3">
  <bpdm-avatar name="Aria Lindqvist" [src]="src" size="lg" shape="circle" />
  <bpdm-avatar name="Theo Brandt" size="lg" shape="circle" />
  <bpdm-avatar name="Aria Lindqvist" [src]="src" size="lg" shape="square" />
  <bpdm-avatar name="Theo Brandt" size="lg" shape="square" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-shapes',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" shape="circle" />
      <bpdm-avatar name="Theo Brandt" size="lg" shape="circle" />
      <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" shape="square" />
      <bpdm-avatar name="Theo Brandt" size="lg" shape="square" />
    </div>
  \`,
})
export class AvatarShapesComponent {}`,
      },
    },
  },
};

/** No name/src → person icon; `[colorful]="false"` for a neutral look. */
export const Icon: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  <bpdm-avatar size="lg" />
  <bpdm-avatar size="lg" shape="square" />
  <bpdm-avatar size="lg" [colorful]="false" name="JD" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-icon',
  imports: [BpdmAvatar],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <bpdm-avatar size="lg" />
      <bpdm-avatar size="lg" shape="square" />
      <bpdm-avatar size="lg" [colorful]="false" name="JD" />
    </div>
  \`,
})
export class AvatarIconComponent {}`,
      },
    },
  },
};

/** Count overlay — compose with the notification badge. */
export const WithBadge: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { src: PEOPLE[0].src },
    template: `<div class="flex items-center gap-6">
  <bpdm-notification-badge [count]="4"><bpdm-avatar name="Aria Lindqvist" [src]="src" size="lg" /></bpdm-notification-badge>
  <bpdm-notification-badge dot variant="success"><bpdm-avatar name="Theo Brandt" size="lg" /></bpdm-notification-badge>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAvatar, BpdmNotificationBadge } from '@bpdm/ng';

@Component({
  selector: 'app-avatar-badge',
  imports: [BpdmAvatar, BpdmNotificationBadge],
  template: \`
    <div class="flex items-center gap-6">
      <bpdm-notification-badge [count]="4">
        <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" />
      </bpdm-notification-badge>
      <bpdm-notification-badge dot variant="success">
        <bpdm-avatar name="Theo Brandt" size="lg" />
      </bpdm-notification-badge>
    </div>
  \`,
})
export class AvatarBadgeComponent {}`,
      },
    },
  },
};
