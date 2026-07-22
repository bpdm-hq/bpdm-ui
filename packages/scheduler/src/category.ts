const CATEGORY_VAR: Record<string, string> = {
  amber: "var(--sch-cat-amber)",
  violet: "var(--sch-cat-violet)",
  teal: "var(--sch-cat-teal)",
  blue: "var(--sch-cat-blue)",
  rose: "var(--sch-cat-rose)",
};

/** Map an event category to its themeable colour, defaulting to the amber accent. */
export function categoryColor(category?: string): string {
  return (category && CATEGORY_VAR[category]) || "var(--sch-cat-amber)";
}
