import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";
import AxeBuilder from "@axe-core/playwright";

/**
 * Batch E2 — browser-axe contrast pass.
 *
 * jsdom (vitest-axe, Batch E1) already covers the structural axe rules but
 * physically cannot evaluate `color-contrast` (no layout / no computed colors).
 * This real-Chromium pass fills exactly that gap: for every story it re-checks
 * `color-contrast` — and nothing else — across all four themes × both text
 * directions, so the `-strong` tokens, `--ring`, `--input`, etc. get automated
 * proof. Keeping it to the single rule keeps each story's 8-way sweep fast.
 */

const THEMES = ["paper", "mist", "charcoal", "slate"] as const;
const DIRS = ["ltr", "rtl"] as const;

type Violation = {
  theme: string;
  dir: string;
  rule: string;
  impact: string | null | undefined;
  node: string;
  summary: string;
};

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    const a11y = storyContext.parameters?.["a11y"] as
      | { skipContrast?: boolean; disable?: boolean; test?: string }
      | undefined;

    // Per-story opt-out — deliberate "don't do this" demos or stories where the
    // contrast is intentionally out of scope. Never silent: always log the skip.
    if (a11y?.skipContrast || a11y?.disable || a11y?.test === "off") {
      console.log(
        `[a11y:contrast] SKIP ${context.id} — opt-out via parameters.a11y (${JSON.stringify(
          a11y,
        )})`,
      );
      return;
    }

    // Story mount point differs by builder; support both.
    const rootSelector = await page.evaluate(() =>
      document.querySelector("#storybook-root")
        ? "#storybook-root"
        : document.querySelector("#root")
          ? "#root"
          : "body",
    );

    const violations: Violation[] = [];

    for (const theme of THEMES) {
      for (const dir of DIRS) {
        await page.evaluate(
          ({ theme, dir }) => {
            document.documentElement.setAttribute("data-theme", theme);
            document.documentElement.setAttribute("dir", dir);
            // Portaled overlays read <html>; wrapped content reads the nearest
            // [data-theme] ancestor — so update every themed element too.
            document
              .querySelectorAll("[data-theme]")
              .forEach((el) => el.setAttribute("data-theme", theme));
          },
          { theme, dir },
        );

        const results = await new AxeBuilder({ page })
          .include(rootSelector)
          .withRules(["color-contrast"])
          .analyze();

        for (const v of results.violations) {
          for (const node of v.nodes) {
            violations.push({
              theme,
              dir,
              rule: v.id,
              impact: v.impact,
              node: node.html,
              summary: (node.failureSummary ?? "").replace(/\s+/g, " ").trim(),
            });
          }
        }
      }
    }

    // Restore a neutral state so nothing leaks to the next story.
    await page.evaluate(() => document.documentElement.setAttribute("dir", "ltr"));

    if (violations.length > 0) {
      const detail = violations
        .map(
          (v) =>
            `  • ${context.title} › ${context.name} [theme=${v.theme} dir=${v.dir}] ${v.rule} (${v.impact})\n` +
            `    node: ${v.node}\n` +
            `    ${v.summary}`,
        )
        .join("\n");
      const message = `color-contrast violations for story "${context.id}" (${violations.length}):\n${detail}`;
      // Fail with the full, actionable list (component › story · theme · dir ·
      // node). A bare `expect(violations).toEqual([])` would bury this detail
      // behind an unreadable object diff, so surface it as the error message.
      throw new Error(message);
    }
    // Explicit no-violation assertion for the reader / reporters.
    expect(violations).toEqual([]);
  },
};

export default config;
