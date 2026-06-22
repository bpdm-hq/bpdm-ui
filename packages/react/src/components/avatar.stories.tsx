import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Avatar, AvatarGroup, type AvatarSize } from "./avatar";
import { NotificationBadge } from "./badge";

const usage = `
Avatar with a graceful fallback chain — image → initials (auto-tinted from the
name) → icon. Circle or square, six sizes, an optional presence dot, and an
\`AvatarGroup\` that overlaps avatars with a \`+N\` overflow. Compose with
\`NotificationBadge\` for a count overlay.

\`\`\`tsx
import { Avatar, AvatarGroup } from "@bpdm/ui";

<Avatar name="Aria Lindqvist" src="/aria.jpg" status="online" />
<Avatar name="Theo Brandt" />            {/* initials, auto-colored */}

<AvatarGroup max={4}>
  <Avatar name="Aria Lindqvist" src="/aria.jpg" />
  <Avatar name="Theo Brandt" src="/theo.jpg" />
  <Avatar name="Lena Cho" src="/lena.jpg" />
  <Avatar name="Mateo Silva" />
  <Avatar name="Ines Vidal" />
  <Avatar name="Sam Reyes" />
</AvatarGroup>
\`\`\`
`;

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

// Demo-only: generate a license-free gradient avatar (inline SVG data URI) from a
// seed — no external image service, no copyright. Real apps pass their own photos.
function seedHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function genAvatar(seed: string) {
  const h = seedHash(seed);
  const a = h % 360;
  const b = (a + 78) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${a} 64% 56%)'/><stop offset='1' stop-color='hsl(${b} 60% 46%)'/></linearGradient></defs><rect width='120' height='120' fill='url(#g)'/><circle cx='38' cy='44' r='34' fill='hsl(${b} 72% 70%)' opacity='0.45'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PEOPLE = ["Aria Lindqvist", "Theo Brandt", "Lena Cho", "Mateo Silva", "Ines Vidal", "Sam Reyes"].map(
  (name) => ({ name, src: genAvatar(name) }),
);

const meta: Meta<typeof Avatar> = {
  title: "Data Display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Playground</h2>
          <Primary />
          <Controls />
          <h2>Examples</h2>
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    status: { control: "inline-radio", options: [undefined, "online", "busy", "away", "offline"] },
    colorful: { control: "boolean" },
    name: { control: "text" },
    src: { control: "text" },
  },
  args: { name: "Aria Lindqvist", size: "lg", shape: "circle" },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

// fallback to initials, auto-tinted deterministically from the name
export const Initials: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {["Aria Lindqvist", "Theo Brandt", "Lena Cho", "Mateo Silva", "Ines Vidal", "Sam Reyes"].map(
        (name) => (
          <Avatar key={name} name={name} size="lg" />
        ),
      )}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar } from "@bpdm/ui";

export function Example() {
  const names = [
    "Aria Lindqvist",
    "Theo Brandt",
    "Lena Cho",
    "Mateo Silva",
    "Ines Vidal",
    "Sam Reyes",
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {names.map((name) => (
        <Avatar key={name} name={name} size="lg" />
      ))}
    </div>
  );
}`,
      },
    },
  },
};

// real photos; a broken URL falls back to initials automatically
export const WithImage: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {PEOPLE.slice(0, 4).map((p) => (
        <Avatar key={p.name} name={p.name} src={p.src} size="lg" />
      ))}
      <Avatar name="Clara Bauer" src="https://invalid.example/none.jpg" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar } from "@bpdm/ui";

export function Example() {
  const people = [
    { name: "Aria Lindqvist", src: "/aria.jpg" },
    { name: "Theo Brandt", src: "/theo.jpg" },
    { name: "Lena Cho", src: "/lena.jpg" },
    { name: "Mateo Silva", src: "/mateo.jpg" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {people.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.src} size="lg" />
      ))}
      {/* a broken URL falls back to initials automatically */}
      <Avatar name="Clara Bauer" src="https://invalid.example/none.jpg" size="lg" />
    </div>
  );
}`,
      },
    },
  },
};

// presence dot
export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" status="online" />
      <Avatar name="Theo Brandt" size="lg" status="busy" />
      <Avatar name="Lena Cho" src={PEOPLE[2].src} size="lg" status="away" />
      <Avatar name="Mateo Silva" size="lg" status="offline" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" status="online" />
      <Avatar name="Theo Brandt" size="lg" status="busy" />
      <Avatar name="Lena Cho" src="/lena.jpg" size="lg" status="away" />
      <Avatar name="Mateo Silva" size="lg" status="offline" />
    </div>
  );
}`,
      },
    },
  },
};

// overlapping stack with a +N overflow tile
export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AvatarGroup max={4}>
        {PEOPLE.map((p) => (
          <Avatar key={p.name} name={p.name} src={p.src} />
        ))}
      </AvatarGroup>
      <AvatarGroup max={5} size="sm">
        {["Aria Lindqvist", "Theo Brandt", "Lena Cho", "Mateo Silva", "Ines Vidal", "Sam Reyes", "Nina Berg"].map(
          (name) => (
            <Avatar key={name} name={name} />
          ),
        )}
      </AvatarGroup>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar, AvatarGroup } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      <AvatarGroup max={4}>
        <Avatar name="Aria Lindqvist" src="/aria.jpg" />
        <Avatar name="Theo Brandt" src="/theo.jpg" />
        <Avatar name="Lena Cho" src="/lena.jpg" />
        <Avatar name="Mateo Silva" src="/mateo.jpg" />
        <Avatar name="Ines Vidal" src="/ines.jpg" />
        <Avatar name="Sam Reyes" src="/sam.jpg" />
      </AvatarGroup>

      {/* a second, smaller group with initials only */}
      <AvatarGroup max={5} size="sm">
        <Avatar name="Aria Lindqvist" />
        <Avatar name="Theo Brandt" />
        <Avatar name="Lena Cho" />
        <Avatar name="Mateo Silva" />
        <Avatar name="Ines Vidal" />
        <Avatar name="Sam Reyes" />
        <Avatar name="Nina Berg" />
      </AvatarGroup>
    </div>
  );
}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      {SIZES.map((size) => (
        <Avatar key={size} name="Aria Lindqvist" src={PEOPLE[0].src} size={size} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar, type AvatarSize } from "@bpdm/ui";

export function Example() {
  const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  return (
    <div className="flex flex-wrap items-end gap-3">
      {sizes.map((size) => (
        <Avatar key={size} name="Aria Lindqvist" src="/aria.jpg" size={size} />
      ))}
    </div>
  );
}`,
      },
    },
  },
};

export const Shapes: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" shape="circle" />
      <Avatar name="Theo Brandt" size="lg" shape="circle" />
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" shape="square" />
      <Avatar name="Theo Brandt" size="lg" shape="square" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" shape="circle" />
      <Avatar name="Theo Brandt" size="lg" shape="circle" />
      <Avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" shape="square" />
      <Avatar name="Theo Brandt" size="lg" shape="square" />
    </div>
  );
}`,
      },
    },
  },
};

export const Icon: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar size="lg" />
      <Avatar size="lg" shape="square" />
      <Avatar size="lg" colorful={false} name="JD" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* no name/src → person icon */}
      <Avatar size="lg" />
      <Avatar size="lg" shape="square" />
      <Avatar size="lg" colorful={false} name="JD" />
    </div>
  );
}`,
      },
    },
  },
};

// count overlay (compose with NotificationBadge)
export const WithBadge: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex items-center gap-6">
      <NotificationBadge count={4}>
        <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" />
      </NotificationBadge>
      <NotificationBadge dot variant="success">
        <Avatar name="Theo Brandt" size="lg" />
      </NotificationBadge>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Avatar, NotificationBadge } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex items-center gap-6">
      <NotificationBadge count={4}>
        <Avatar name="Aria Lindqvist" src="/aria.jpg" size="lg" />
      </NotificationBadge>
      <NotificationBadge dot variant="success">
        <Avatar name="Theo Brandt" size="lg" />
      </NotificationBadge>
    </div>
  );
}`,
      },
    },
  },
};
