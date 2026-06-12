import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Heart, Plus, Search } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "iconSm", "icon", "iconLg"],
    },
    shape: { control: "select", options: ["default", "round"] },
  },
  args: { children: "Button" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Icon + text: just drop an icon into children — base `gap-2` spaces it.
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Plus className="size-4" /> New item
      </Button>
      <Button variant="outline">
        Continue <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};

// Icon-only: square `size="icon"`. NOTE: always pass an `aria-label`
// because there is no visible text for screen readers.
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" aria-label="Add">
        <Plus className="size-4" />
      </Button>
      <Button size="icon" variant="outline" aria-label="Search">
        <Search className="size-4" />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Like">
        <Heart className="size-4" />
      </Button>
    </div>
  ),
};

// Circle icon buttons: `shape="round"` turns the square into a circle.
export const RoundIcon: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="iconSm" shape="round" variant="outline" aria-label="Search">
        <Search className="size-4" />
      </Button>
      <Button size="icon" shape="round" aria-label="Add">
        <Plus className="size-5" />
      </Button>
      <Button size="iconLg" shape="round" variant="secondary" aria-label="Like">
        <Heart className="size-5" />
      </Button>
    </div>
  ),
};

// Pill: `shape="round"` on a text button gives fully-rounded ends.
export const Pill: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button shape="round">Rounded pill</Button>
      <Button shape="round" variant="outline">
        Filter <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};
