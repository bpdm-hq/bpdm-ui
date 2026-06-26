import type { CSSProperties } from "react";

const REACT_DOCS = "/react/?path=/docs/introduction--docs";
const ANGULAR_DOCS = "/angular/?path=/docs/introduction--docs";
const REPO = "https://github.com/BDev-9/bpdm-ui";

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand-mark" href="/">
            <span className="b">&lt;</span>Bpdm<span className="b"> /&gt;</span>
          </a>
          <nav className="nav-links">
            <a className="hide-sm" href="#frameworks">Components</a>
            <a className="hide-sm" href="#themes">Themes</a>
            <a className="gh" href={REPO} target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="hero">
          <div className="wrap">
            <span className="eyebrow">bpdm · design system</span>
            <h1>
              One design system,<br />
              <span className="amber">every framework.</span>
            </h1>
            <p className="tagline">
              Accessible, themeable UI components built on one shared set of design tokens —
              implemented natively for each framework, so they look and move exactly the same
              everywhere.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href={REACT_DOCS}>
                Explore the components <span className="arrow">→</span>
              </a>
              <a className="btn btn-ghost" href={REPO} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </div>
            <div className="hero-meta">
              <span>Accessible</span><span className="dot">·</span>
              <span>Themeable</span><span className="dot">·</span>
              <span>Tree-shakeable</span><span className="dot">·</span>
              <span>React &amp; Angular</span>
            </div>
          </div>
        </section>

        {/* framework picker */}
        <section id="frameworks" className="soft">
          <div className="wrap">
            <div className="section-head">
              <h2>Pick your framework</h2>
              <p>Same design, same tokens — choose the implementation you build with.</p>
            </div>
            <div className="cards">
              {/* React */}
              <a
                className="card card--active"
                href={REACT_DOCS}
                style={{ "--accent": "var(--react)" } as CSSProperties}
              >
                <div className="row">
                  <span className="logo" aria-hidden="true">
                    <svg viewBox="-11.5 -10.23 23 20.46" fill="none">
                      <circle r="2.05" fill="#61dafb" />
                      <g stroke="#61dafb" strokeWidth="1">
                        <ellipse rx="11" ry="4.2" />
                        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                      </g>
                    </svg>
                  </span>
                  <span
                    className="badge"
                    style={{ background: "color-mix(in srgb, var(--react) 18%, transparent)", color: "var(--react)" }}
                  >
                    Live
                  </span>
                </div>
                <h3>React</h3>
                <p>38 components built on Radix primitives, Tailwind 4, and four themes.</p>
                <span className="cta">Explore React docs <span className="arrow">→</span></span>
              </a>

              {/* Angular */}
              <a
                className="card card--active"
                href={ANGULAR_DOCS}
                style={{ "--accent": "var(--angular)" } as CSSProperties}
              >
                <div className="row">
                  <span className="logo" aria-hidden="true">
                    <svg viewBox="0 0 256 272" fill="none">
                      <path fill="#dd0031" d="M128 0 0 45.8l19.5 169.3L128 272l108.5-56.9L256 45.8z" />
                      <path fill="#c3002f" d="M128 0v272l108.5-56.9L256 45.8z" />
                      <path fill="#fff" d="M128 32 47.8 211.7h29.9l16.1-40.2h67.8l16.1 40.2h29.9L128 32zm23.4 114.6h-46.8L128 90.2z" />
                    </svg>
                  </span>
                  <span
                    className="badge"
                    style={{ background: "color-mix(in srgb, var(--angular) 18%, transparent)", color: "var(--angular)" }}
                  >
                    Live
                  </span>
                </div>
                <h3>Angular</h3>
                <p>38 components built with Angular standalone components, the CDK, and four themes.</p>
                <span className="cta">Explore Angular docs <span className="arrow">→</span></span>
              </a>
            </div>
          </div>
        </section>

        {/* features */}
        <section>
          <div className="wrap">
            <div className="section-head">
              <h2>Built for production</h2>
              <p>The things you&apos;d expect from a serious component library — by default.</p>
            </div>
            <div className="features">
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <h3>Accessible by default</h3>
                <p>Keyboard, focus and ARIA handled via Radix (React) and the Angular CDK — not bolted on later.</p>
              </div>
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                  </svg>
                </span>
                <h3>Four built-in themes</h3>
                <p>Light (paper, mist) and dark (charcoal, slate). Switch the whole UI with one <code>data-theme</code>.</p>
              </div>
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                  </svg>
                </span>
                <h3>Tree-shakeable</h3>
                <p>Standalone components, ESM and <code>sideEffects: false</code> — only what you import ships.</p>
              </div>
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m16 18 6-6-6-6" />
                    <path d="m8 6-6 6 6 6" />
                  </svg>
                </span>
                <h3>Fully typed</h3>
                <p>First-class TypeScript with prop-level autocomplete across every component and variant.</p>
              </div>
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <h3>One motion language</h3>
                <p>Shared easing and duration tokens drive every transition — and honor <code>prefers-reduced-motion</code>.</p>
              </div>
              <div className="feature">
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                  </svg>
                </span>
                <h3>Shared design tokens</h3>
                <p>One source of truth (<code>@bpdm/tokens</code>) powers every framework — re-brand by overriding variables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* theme showcase */}
        <section id="themes" className="soft">
          <div className="wrap">
            <div className="section-head">
              <h2>Four themes, one token set</h2>
              <p>Every component reads semantic variables — these are the built-in palettes.</p>
            </div>
            <div className="themes">
              <div className="theme" style={{ background: "#faf9f6", color: "#1c1a17", borderColor: "#e7e3dc" }}>
                <div className="theme-preview">
                  <span className="theme-pill" style={{ background: "#f5a623", color: "#1a1205" }}>Aa</span>
                  <span className="theme-bars">
                    <i style={{ background: "#1c1a17", width: "80%" }} />
                    <i style={{ background: "#e7e3dc", width: "60%" }} />
                  </span>
                </div>
                <div className="theme-name">Paper <small>light · warm</small></div>
              </div>
              <div className="theme" style={{ background: "#f7f8fa", color: "#1a1d24", borderColor: "#e2e6ec" }}>
                <div className="theme-preview">
                  <span className="theme-pill" style={{ background: "#f5a623", color: "#1a1205" }}>Aa</span>
                  <span className="theme-bars">
                    <i style={{ background: "#1a1d24", width: "80%" }} />
                    <i style={{ background: "#e2e6ec", width: "60%" }} />
                  </span>
                </div>
                <div className="theme-name">Mist <small>light · cool</small></div>
              </div>
              <div className="theme" style={{ background: "#1b1b21", color: "#f7f6f3", borderColor: "#2e2e35" }}>
                <div className="theme-preview">
                  <span className="theme-pill" style={{ background: "#f5a623", color: "#1a1205" }}>Aa</span>
                  <span className="theme-bars">
                    <i style={{ background: "#f7f6f3", width: "80%" }} />
                    <i style={{ background: "#2e2e35", width: "60%" }} />
                  </span>
                </div>
                <div className="theme-name">Charcoal <small>dark · warm</small></div>
              </div>
              <div className="theme" style={{ background: "#161b22", color: "#e6e8eb", borderColor: "#2a313c" }}>
                <div className="theme-preview">
                  <span className="theme-pill" style={{ background: "#f5a623", color: "#1a1205" }}>Aa</span>
                  <span className="theme-bars">
                    <i style={{ background: "#e6e8eb", width: "80%" }} />
                    <i style={{ background: "#2a313c", width: "60%" }} />
                  </span>
                </div>
                <div className="theme-name">Slate <small>dark · cool</small></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot-inner">
          <span>
            <span style={{ color: "var(--primary)" }}>&lt;</span>Bpdm /&gt; · an open-source design system
          </span>
          <span>
            MIT · <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a> ·{" "}
            <a href="https://bpdm.dev" target="_blank" rel="noopener noreferrer">bpdm.dev</a>
          </span>
        </div>
      </footer>
    </>
  );
}
