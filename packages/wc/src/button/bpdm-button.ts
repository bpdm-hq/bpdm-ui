import { LitElement, html, css, nothing, type PropertyValues } from "lit";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "help"
  | "destructive"
  | "contrast";
type Appearance = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg" | "iconSm" | "icon" | "iconLg" | "none";
type Shape = "default" | "round";
type ButtonType = "button" | "submit" | "reset";

/**
 * `<bpdm-button>` — the bpdm/ui Button as a framework-agnostic Web Component.
 *
 * Works in any stack that renders HTML (React, Angular, Vue, PHP/Laravel, Rails,
 * Elixir/Phoenix + LiveView, Django, vanilla). Built on Lit; styled with Shadow
 * DOM so host-page CSS can't tamper with it, while theming still flows in through
 * the `@bpdm/tokens` CSS custom properties (which pierce the shadow boundary).
 *
 * It is a **form-associated** custom element: `type="submit"` / `type="reset"`
 * drive the surrounding native `<form>` exactly like a real button — so server
 * back-ends (and LiveView) receive submits without extra JS.
 *
 * Slots: default = label. `start` / `end` = leading / trailing adornments (icons).
 * Parts: `base` (the inner button), `spinner`.
 */
export class BpdmButton extends LitElement {
  /** Form-associated: participates in native `<form>` submit/reset. */
  static readonly formAssociated = true;

  // Delegate focus to the inner <button> so Tab and :focus-visible stay native.
  // This MUST be set via shadowRootOptions, not by overriding createRenderRoot:
  // a custom createRenderRoot skips Lit's adoptStyles() and the component ships
  // with no styles in its shadow root.
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    variant: { type: String, reflect: true },
    appearance: { type: String, reflect: true },
    size: { type: String, reflect: true },
    shape: { type: String, reflect: true },
    type: { type: String },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    loadingLabel: { type: String, attribute: "loading-label" },
  };

  declare variant: Variant;
  declare appearance: Appearance;
  declare size: Size;
  declare shape: Shape;
  declare type: ButtonType;
  declare disabled: boolean;
  declare loading: boolean;
  declare loadingLabel: string;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.variant = "primary";
    this.appearance = "solid";
    this.size = "md";
    this.shape = "default";
    this.type = "button";
    this.disabled = false;
    this.loading = false;
    this.loadingLabel = "Loading";
    // attachInternals() is how a form-associated element talks to its form.
    this.internals = this.attachInternals();
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has("disabled")) {
      // keep the a11y tree honest: a disabled button is not a valid form control
      this.internals.ariaDisabled = this.disabled ? "true" : null;
    }
  }

  private onClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    // Shadow-boundary form controls don't auto-submit, so drive the form here.
    const form = this.internals.form;
    if (!form) return;
    if (this.type === "submit") form.requestSubmit();
    else if (this.type === "reset") form.reset();
  };

  override render() {
    const inactive = this.disabled || this.loading;
    return html`
      <button
        part="base"
        type="button"
        class="base"
        ?disabled=${this.disabled}
        aria-busy=${this.loading ? "true" : nothing}
        aria-disabled=${inactive ? "true" : nothing}
        @click=${this.onClick}
      >
        ${this.loading
          ? html`<span class="spinner" part="spinner" aria-hidden="true"></span>`
          : html`<slot name="start"></slot>`}
        <slot></slot>
        <slot name="end"></slot>
      </button>
    `;
  }

  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    :host([size="none"]) {
      display: inline-flex;
    }
    .base {
      position: relative;
      display: inline-flex;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      white-space: nowrap;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 500;
      text-decoration: none;
      width: 100%;
      scale: 1;
      translate: 0 0;
      transition:
        color,
        background-color,
        border-color,
        box-shadow,
        transform,
        scale,
        translate;
      transition-duration: var(--bpdm-duration-fast, 120ms);
      transition-timing-function: var(--bpdm-ease-overshoot, cubic-bezier(0.34, 1.56, 0.64, 1));
    }
    /* the bpdm signature: a springy tactile press */
    .base:active {
      scale: 0.95;
      translate: 0 1px;
    }
    .base:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 2px var(--background, #fff),
        0 0 0 4px var(--ring, #e8a300);
    }
    :host([disabled]) .base,
    :host([loading]) .base {
      pointer-events: none;
      opacity: 0.5;
    }

    /* ── sizes ── */
    :host([size="sm"]) .base { height: 2rem; padding-inline: 0.75rem; font-size: 0.875rem; }
    :host([size="md"]) .base { height: 2.5rem; padding-inline: 1rem; font-size: 0.875rem; }
    :host([size="lg"]) .base { height: 3rem; padding-inline: 1.5rem; font-size: 1rem; }
    :host([size="iconSm"]) .base { height: 2rem; width: 2rem; }
    :host([size="icon"]) .base { height: 2.5rem; width: 2.5rem; }
    :host([size="iconLg"]) .base { height: 3rem; width: 3rem; }

    /* ── shape (owns the radius) ── */
    :host([shape="default"]) .base { border-radius: var(--radius, 0.5rem); }
    :host([shape="round"]) .base { border-radius: 9999px; }

    /* ── solid ── */
    :host([appearance="solid"][variant="primary"]) .base { background: var(--primary, #e8a300); color: var(--primary-foreground, #1a1a1a); }
    :host([appearance="solid"][variant="primary"]) .base:hover { background: color-mix(in oklab, var(--primary, #e8a300) 90%, transparent); }
    :host([appearance="solid"][variant="secondary"]) .base { background: var(--secondary, #e8e8e8); color: var(--secondary-foreground, #1a1a1a); }
    :host([appearance="solid"][variant="secondary"]) .base:hover { background: color-mix(in oklab, var(--secondary, #e8e8e8) 80%, transparent); }
    :host([appearance="solid"][variant="success"]) .base { background: var(--success, #16a34a); color: var(--success-foreground, #fff); }
    :host([appearance="solid"][variant="info"]) .base { background: var(--info, #0284c7); color: var(--info-foreground, #fff); }
    :host([appearance="solid"][variant="warning"]) .base { background: var(--warning, #d97706); color: var(--warning-foreground, #fff); }
    :host([appearance="solid"][variant="help"]) .base { background: var(--help, #7c3aed); color: var(--help-foreground, #fff); }
    :host([appearance="solid"][variant="destructive"]) .base { background: var(--destructive, #dc2626); color: var(--destructive-foreground, #fff); }
    :host([appearance="solid"][variant="contrast"]) .base { background: var(--foreground, #1a1a1a); color: var(--background, #fff); }

    /* ── outline ── */
    :host([appearance="outline"]) .base { border: 1px solid; background: transparent; }
    :host([appearance="outline"][variant="primary"]) .base { border-color: var(--primary-strong, #b37400); color: var(--primary-strong, #b37400); }
    :host([appearance="outline"][variant="secondary"]) .base { border-color: var(--input, #d4d4d4); color: var(--foreground, #1a1a1a); }
    :host([appearance="outline"][variant="success"]) .base { border-color: var(--success, #16a34a); color: var(--success, #16a34a); }
    :host([appearance="outline"][variant="info"]) .base { border-color: var(--info, #0284c7); color: var(--info, #0284c7); }
    :host([appearance="outline"][variant="warning"]) .base { border-color: var(--warning, #d97706); color: var(--warning, #d97706); }
    :host([appearance="outline"][variant="help"]) .base { border-color: var(--help, #7c3aed); color: var(--help, #7c3aed); }
    :host([appearance="outline"][variant="destructive"]) .base { border-color: var(--destructive, #dc2626); color: var(--destructive-strong, #b91c1c); }
    :host([appearance="outline"][variant="contrast"]) .base { border-color: color-mix(in oklab, var(--foreground, #1a1a1a) 40%, transparent); color: var(--foreground, #1a1a1a); }

    /* ── ghost ── */
    :host([appearance="ghost"][variant="primary"]) .base { color: var(--primary-strong, #b37400); }
    :host([appearance="ghost"][variant="secondary"]) .base { color: var(--foreground, #1a1a1a); }
    :host([appearance="ghost"][variant="success"]) .base { color: var(--success, #16a34a); }
    :host([appearance="ghost"][variant="info"]) .base { color: var(--info, #0284c7); }
    :host([appearance="ghost"][variant="warning"]) .base { color: var(--warning, #d97706); }
    :host([appearance="ghost"][variant="help"]) .base { color: var(--help, #7c3aed); }
    :host([appearance="ghost"][variant="destructive"]) .base { color: var(--destructive-strong, #b91c1c); }
    :host([appearance="ghost"][variant="contrast"]) .base { color: var(--foreground, #1a1a1a); }

    /* hover wash for outline + ghost (tinted by the current variant) */
    :host([appearance="outline"]) .base:hover,
    :host([appearance="ghost"]) .base:hover {
      background: color-mix(in oklab, currentColor 10%, transparent);
    }

    /* ── spinner ── */
    .spinner {
      width: 1em;
      height: 1em;
      border-radius: 9999px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      animation: bpdm-spin 0.6s linear infinite;
    }
    @keyframes bpdm-spin {
      to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .base { transition: none; }
      .base:active { scale: 1; translate: 0 0; }
      .spinner { animation-duration: 1.2s; }
    }
  `;
}

// SSR-safe: `customElements` is undefined on the server (Next/Nuxt/LiveView
// render), so only register in the browser. The element upgrades on hydration.
if (typeof customElements !== "undefined" && !customElements.get("bpdm-button")) {
  customElements.define("bpdm-button", BpdmButton);
}

declare global {
  interface HTMLElementTagNameMap {
    "bpdm-button": BpdmButton;
  }
}
