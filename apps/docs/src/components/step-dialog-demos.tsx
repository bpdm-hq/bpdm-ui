'use client';

import { StepDialog, type StepDialogStep } from '@bpdm/ui/step-dialog';
import { Button } from '@bpdm/ui/button';
import { Input } from '@bpdm/ui/input';

const STEPS: StepDialogStep[] = [
  {
    title: 'Account',
    description: 'Your login details.',
    content: <Input type="email" placeholder="you@company.com" aria-label="Email" />,
  },
  {
    title: 'Profile',
    description: 'Tell us about you.',
    content: <Input placeholder="Display name" aria-label="Display name" />,
  },
  {
    title: 'Done',
    description: 'Review and finish.',
    content: (
      <p className="text-sm text-fd-muted-foreground">
        Everything looks good — click Finish to complete setup.
      </p>
    ),
  },
];

export function StepDialogWizardDemo() {
  return <StepDialog trigger={<Button>Get started</Button>} title="Set up workspace" steps={STEPS} />;
}
