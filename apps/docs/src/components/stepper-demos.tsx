'use client';

import { useState } from 'react';
import { Stepper, StepList, Step, StepItem, StepPanels, StepPanel, useStepper } from '@bpdm/ui/stepper';
import { Button } from '@bpdm/ui/button';
import { Checkbox } from '@bpdm/ui/checkbox';
import { User, Building2, ClipboardCheck } from 'lucide-react';

function Box({ children }: { children: React.ReactNode }) {
  // fill the preview width (like the other panel demos) rather than a narrow block
  return <div className="w-full self-start">{children}</div>;
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-fd-muted-foreground">{children}</p>
);

// Next / Back driven by the useStepper() hook — works anywhere inside <Stepper>
function Nav({ canNext = true }: { canNext?: boolean }) {
  const { isFirst, isLast, next, back, complete, finished } = useStepper();
  return (
    <div className="mt-4 flex items-center justify-between pe-3">
      <Button variant="secondary" appearance="ghost" size="sm" onClick={back} disabled={isFirst}>
        Back
      </Button>
      {isLast ? (
        <Button size="sm" onClick={complete} disabled={finished}>
          {finished ? 'Done ✓' : 'Finish'}
        </Button>
      ) : (
        <Button size="sm" onClick={next} disabled={!canNext}>
          Next
        </Button>
      )}
    </div>
  );
}

// demos
export function StepperUsageDemo() {
  return (
    <Box>
      <Stepper defaultValue="1">
        <StepList className="px-3">
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels className="px-3">
          <StepPanel value="1"><P>Tell us who you are — name and email.</P></StepPanel>
          <StepPanel value="2"><P>Name your workspace and pick a URL.</P></StepPanel>
          <StepPanel value="3"><P>Everything looks good — review and finish.</P></StepPanel>
        </StepPanels>
        <Nav />
      </Stepper>
    </Box>
  );
}

export function StepperVerticalDemo() {
  // vertical uses StepItem to wrap each Step + StepPanel (draws the connecting rail);
  // Step/StepPanel inherit their value from the enclosing StepItem
  return (
    <Box>
      <Stepper defaultValue="1" orientation="vertical">
        <StepItem value="1">
          <Step>Account</Step>
          <StepPanel><P>Tell us who you are.</P></StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step>Workspace</Step>
          <StepPanel><P>Name your workspace.</P></StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step>Review</Step>
          <StepPanel><P>Review and finish.</P></StepPanel>
        </StepItem>
        <Nav />
      </Stepper>
    </Box>
  );
}

export function StepperLinearDemo() {
  return (
    <Box>
      <Stepper defaultValue="1" linear lockIndicator>
        <StepList className="px-3">
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels className="px-3">
          <StepPanel value="1"><P>Future steps are locked until you advance.</P></StepPanel>
          <StepPanel value="2"><P>Now step 3 is reachable.</P></StepPanel>
          <StepPanel value="3"><P>Review and finish.</P></StepPanel>
        </StepPanels>
        <Nav />
      </Stepper>
    </Box>
  );
}

export function StepperValidatedDemo() {
  const [agreed, setAgreed] = useState(false);
  return (
    <Box>
      <Stepper defaultValue="1" linear>
        <StepList className="px-3">
          <Step value="1">Terms</Step>
          <Step value="2">Confirm</Step>
        </StepList>
        <StepPanels className="px-3">
          <StepPanel value="1">
            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-fd-foreground">
              <Checkbox size="sm" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
              I accept the terms and conditions
            </label>
            <p className="mt-1.5 text-xs text-fd-muted-foreground">Next stays disabled until you accept.</p>
          </StepPanel>
          <StepPanel value="2"><P>All set — confirm to finish.</P></StepPanel>
        </StepPanels>
        <Nav canNext={agreed} />
      </Stepper>
    </Box>
  );
}

export function StepperIconsDemo() {
  // completed steps show a check; active + upcoming show the custom icon
  return (
    <Box>
      <Stepper defaultValue="1">
        <StepList className="px-3">
          <Step value="1" icon={<User />}>Account</Step>
          <Step value="2" icon={<Building2 />}>Workspace</Step>
          <Step value="3" icon={<ClipboardCheck />}>Review</Step>
        </StepList>
        <StepPanels className="px-3">
          <StepPanel value="1"><P>Tell us who you are.</P></StepPanel>
          <StepPanel value="2"><P>Name your workspace.</P></StepPanel>
          <StepPanel value="3"><P>Review and finish.</P></StepPanel>
        </StepPanels>
        <Nav />
      </Stepper>
    </Box>
  );
}

export function StepperStepsOnlyDemo() {
  return (
    <Box>
      <Stepper defaultValue="2">
        <StepList className="px-3">
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
      </Stepper>
    </Box>
  );
}
