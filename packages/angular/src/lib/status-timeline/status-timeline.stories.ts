import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmStatusTimeline, type TimelineItem } from "./status-timeline";

/**
 * Vertical status timeline for lifecycles — deployments, approvals, onboarding, builds.
 * Each step has a status: `complete` (✓), `current` (pulsing), `pending` (hollow),
 * `failed` (✗), with an optional timestamp and description.
 *
 * ```html
 * <bpdm-status-timeline [items]="[
 *   { title: 'Build queued', status: 'complete', timestamp: '09:41' },
 *   { title: 'Running tests', status: 'current', timestamp: '09:42' },
 *   { title: 'Deploy', status: 'pending' },
 * ]" />
 * ```
 */
const meta: Meta<BpdmStatusTimeline> = {
  title: "Data Display/StatusTimeline",
  component: BpdmStatusTimeline,
  decorators: [moduleMetadata({ imports: [BpdmStatusTimeline] })],
  tags: ["autodocs"],
  argTypes: { items: { table: { disable: true } } },
  render: (args) => ({
    props: args,
    template: `<div class="w-80"><bpdm-status-timeline [items]="items" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmStatusTimeline>;

const pipeline: TimelineItem[] = [
  { title: "Build queued", status: "complete", timestamp: "09:41", description: "Triggered by push to main" },
  { title: "Dependencies installed", status: "complete", timestamp: "09:41" },
  { title: "Running tests", status: "current", timestamp: "09:42", description: "412 of 980 passed" },
  { title: "Deploy to production", status: "pending", description: "Waiting for tests" },
];

export const Playground: Story = { args: { items: pipeline } };

// a flow that hit a failure
export const WithFailure: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-80"><bpdm-status-timeline [items]="items" /></div>`,
    props: {
      items: [
        { title: "Tests passed", status: "complete", timestamp: "11:02" },
        { title: "Deploy failed", status: "failed", timestamp: "11:03", description: "Health check timed out" },
        { title: "Rollback scheduled", status: "pending", description: "Retrying in 5 min" },
      ] as TimelineItem[],
    },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatusTimeline, type TimelineItem } from '@bpdm/ng';

@Component({
  selector: 'app-timeline-failure',
  imports: [BpdmStatusTimeline],
  template: \`<bpdm-status-timeline [items]="items" />\`,
})
export class TimelineFailureComponent {
  items: TimelineItem[] = [
    { title: 'Tests passed', status: 'complete', timestamp: '11:02' },
    { title: 'Deploy failed', status: 'failed', timestamp: '11:03', description: 'Health check timed out' },
    { title: 'Rollback scheduled', status: 'pending', description: 'Retrying in 5 min' },
  ];
}`,
      },
    },
  },
};

// all four statuses
export const Statuses: Story = {
  render: () => ({
    template: `<div class="w-80"><bpdm-status-timeline [items]="items" /></div>`,
    props: {
      items: [
        { title: "Complete step", status: "complete" },
        { title: "Current step", status: "current" },
        { title: "Failed step", status: "failed" },
        { title: "Pending step", status: "pending" },
      ] as TimelineItem[],
    },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatusTimeline, type TimelineItem } from '@bpdm/ng';

@Component({
  selector: 'app-timeline-statuses',
  imports: [BpdmStatusTimeline],
  template: \`<bpdm-status-timeline [items]="items" />\`,
})
export class TimelineStatusesComponent {
  // status: 'complete' | 'current' | 'pending' | 'failed'
  items: TimelineItem[] = [
    { title: 'Complete step', status: 'complete' },
    { title: 'Current step', status: 'current' },
    { title: 'Failed step', status: 'failed' },
    { title: 'Pending step', status: 'pending' },
  ];
}`,
      },
    },
  },
};
