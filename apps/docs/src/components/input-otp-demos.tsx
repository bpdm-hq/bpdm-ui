'use client';

import type { ReactNode } from 'react';
import { InputOtp } from '@bpdm/ui/input-otp';

/** OTP inputs are a centered row of cells; stack multiples in a centered column. */
function Center({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-4">{children}</div>;
}

export function InputOtpUsageDemo() {
  return (
    <Center>
      <InputOtp length={6} integerOnly />
    </Center>
  );
}

export function InputOtpMaskedDemo() {
  return (
    <Center>
      <InputOtp length={4} mask integerOnly defaultValue="12" />
    </Center>
  );
}

export function InputOtpGroupedDemo() {
  return (
    <Center>
      <InputOtp length={6} grouped separator="−" integerOnly />
      <InputOtp length={9} groupSize={3} separator="−" integerOnly />
    </Center>
  );
}

export function InputOtpSizesDemo() {
  return (
    <Center>
      <InputOtp length={4} size="sm" integerOnly />
      <InputOtp length={4} size="md" integerOnly />
      <InputOtp length={4} size="lg" integerOnly />
    </Center>
  );
}

export function InputOtpStatesDemo() {
  return (
    <Center>
      <InputOtp length={6} disabled defaultValue="123456" />
    </Center>
  );
}
