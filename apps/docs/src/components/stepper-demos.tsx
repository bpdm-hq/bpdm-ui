'use client';

import { useState } from 'react';
import { Stepper, StepList, Step, StepPanels, StepPanel, useStepper } from '@bpdm/ui/stepper';
import { Button } from '@bpdm/ui/button';
import { Checkbox } from '@bpdm/ui/checkbox';

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-md self-start">{children}</div>;
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-fd-muted-foreground">{children}</p>
);

// Next / Back driven by the useStepper() hook — works anywhere inside <Stepper>
function Nav({ canNext = true }: { canNext?: boolean }) {
  const { isFirst, isLast, next, back, complete, finished } = useStepper();
  return (
    <div className="mt-4 flex items-center justify-between">
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

// ── demos ─────────────────────────────────────────────────────────────────────
export function StepperUsageDemo() {
  return (
    <Box>
      <Stepper defaultValue="1">
        <StepList>
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels>
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
  return (
    <Box>
      <Stepper defaultValue="1" orientation="vertical">
        <StepList>
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="1"><P>Tell us who you are.</P></StepPanel>
          <StepPanel value="2"><P>Name your workspace.</P></StepPanel>
          <StepPanel value="3"><P>Review and finish.</P></StepPanel>
        </StepPanels>
        <Nav />
      </Stepper>
    </Box>
  );
}

export function StepperLinearDemo() {
  return (
    <Box>
      <Stepper defaultValue="1" linear lockIndicator>
        <StepList>
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels>
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
        <StepList>
          <Step value="1">Terms</Step>
          <Step value="2">Confirm</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="1">
            <label className="flex items-center gap-2 text-sm text-fd-foreground">
              <Checkbox size="sm" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
              I accept the terms — <span className="text-fd-muted-foreground">Next stays disabled until checked.</span>
            </label>
          </StepPanel>
          <StepPanel value="2"><P>All set — confirm to finish.</P></StepPanel>
        </StepPanels>
        <Nav canNext={agreed} />
      </Stepper>
    </Box>
  );
}

export function StepperStepsOnlyDemo() {
  return (
    <Box>
      <Stepper defaultValue="2">
        <StepList>
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
      </Stepper>
    </Box>
  );
}
