'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { ProgressBar } from '@bpdm/ui/progress';

const VARIANTS = ['primary', 'success', 'warning', 'destructive', 'info'] as const;

/** Progress bars are full-width — constrain demos to a centered column. */
function Box({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}

export function ProgressBasicDemo() {
  return (
    <Box>
      <ProgressBar value={60} />
    </Box>
  );
}

export function ProgressLabelDemo() {
  return (
    <Box>
      <ProgressBar value={72} showValue label="Uploading…" variant="success" />
    </Box>
  );
}

export function ProgressInsideDemo() {
  return (
    <Box>
      <ProgressBar value={72} valuePosition="inside" />
    </Box>
  );
}

export function ProgressFormatDemo() {
  return (
    <Box>
      <ProgressBar value={50} max={100} label="Storage" format={(v, max) => `${v}/${max} GB`} />
    </Box>
  );
}

export function ProgressSizesDemo() {
  return (
    <Box>
      <div className="flex flex-col gap-4">
        <ProgressBar size="sm" value={62} />
        <ProgressBar size="md" value={62} />
        <ProgressBar size="lg" value={62} />
      </div>
    </Box>
  );
}

export function ProgressVariantsDemo() {
  return (
    <Box>
      <div className="flex flex-col gap-3">
        {VARIANTS.map((variant, i) => (
          <ProgressBar
            key={variant}
            variant={variant}
            value={(i + 1) * 18}
            showValue
            label={variant}
          />
        ))}
      </div>
    </Box>
  );
}

export function ProgressIndeterminateDemo() {
  return (
    <Box>
      <ProgressBar indeterminate />
    </Box>
  );
}

export function ProgressDynamicDemo() {
  const [value, setValue] = useState(20);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : Math.min(100, v + 10)));
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <Box>
      <ProgressBar
        value={value}
        showValue
        label="Syncing"
        variant={value >= 100 ? 'success' : 'primary'}
      />
    </Box>
  );
}
