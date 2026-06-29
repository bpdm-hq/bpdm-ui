'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { ProgressBar } from '@bpdm/ui/progress';
import { Button } from '@bpdm/ui/button';

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

export function ProgressInCardDemo() {
  const [value, setValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  const start = () => {
    setUploading(true);
    setValue(0);
    const id = setInterval(() => {
      setValue((v) => {
        if (v >= 100) {
          clearInterval(id);
          setUploading(false);
          return 100;
        }
        return v + 8;
      });
    }, 220);
  };
  return (
    <div className="w-72 space-y-4 rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-fd-foreground">report-2025.pdf</p>
        <p className="text-xs text-fd-muted-foreground">4.2 MB</p>
      </div>
      <ProgressBar value={value} showValue variant={value >= 100 ? 'success' : 'primary'} />
      <Button size="sm" variant="secondary" appearance="outline" onClick={start} disabled={uploading}>
        {value >= 100 ? 'Upload again' : 'Upload'}
      </Button>
    </div>
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
