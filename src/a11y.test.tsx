import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "./components/button";
import { Badge } from "./components/badge";
import { Alert } from "./components/alert";
import { Checkbox } from "./components/checkbox";
import { Switch } from "./components/switch";
import { ProgressBar } from "./components/progress";
import { Input } from "./components/input";

// Automated accessibility audit (axe-core) on a representative set of components.
// jsdom-friendly only — portal/virtualized components are exercised in Storybook's
// a11y panel instead.
const cases: Array<[string, React.ReactElement]> = [
  ["Button", <Button>Save</Button>],
  ["Badge", <Badge variant="success">Active</Badge>],
  ["Alert", <Alert variant="info" title="Heads up">A short note.</Alert>],
  ["Checkbox (labelled)", (
    <label>
      <Checkbox /> Remember me
    </label>
  )],
  ["Switch (labelled)", <Switch aria-label="Notifications" />],
  ["ProgressBar", <ProgressBar value={60} showValue label="Uploading" />],
  ["Input (labelled)", (
    <label>
      Email
      <Input type="email" />
    </label>
  )],
];

describe("accessibility (axe)", () => {
  it.each(cases)("%s has no violations", async (_name, el) => {
    const { container } = render(el);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
