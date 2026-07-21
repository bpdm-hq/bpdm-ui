'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@bpdm/ui/card';
import { Button } from '@bpdm/ui/button';
import { Badge } from '@bpdm/ui/badge';

function SampleCard() {
  return (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>Starter plan</CardTitle>
        <CardDescription>For small teams getting going.</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge>Popular</Badge>
      </CardContent>
      <CardFooter>
        <Button size="sm">Choose plan</Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Two identical cards — the second is restyled purely by targeting the
 * component's `data-bpdm-slot` parts from the parent, without touching the
 * component's own props or classes.
 */
export function StylingSlotDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-fd-muted-foreground">Default</span>
        <SampleCard />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-fd-muted-foreground">Restyled via slots</span>
        <div className="[&_[data-bpdm-slot=card-header]]:bg-fd-muted [&_[data-bpdm-slot=card-header]]:rounded-t-xl [&_[data-bpdm-slot=card-header]]:-mt-px [&_[data-bpdm-slot=card-title]]:text-fd-primary [&_[data-bpdm-slot=card-footer]]:justify-end">
          <SampleCard />
        </div>
      </div>
    </div>
  );
}
