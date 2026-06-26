"use client";

import { Fragment, useState } from "react";
import { createPortal } from "react-dom";

const STEPS = ["Account", "Workspace", "Review"];

/** Interactive multi-step wizard preview — stepper + form + toggle + plan picker
 * + toast on finish. Decorative (inside an aria-hidden collage); controls are not
 * tab-focusable, but the toast portals to <body> so it is announced. */
export function HeroPreview() {
  const [fw, setFw] = useState<"react" | "angular">("react");
  const [step, setStep] = useState(0);
  const [priv, setPriv] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("pro");
  const [toast, setToast] = useState(false);

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => {
    setToast(false);
    requestAnimationFrame(() => setToast(true));
    window.clearTimeout((finish as { _t?: number })._t);
    (finish as { _t?: number })._t = window.setTimeout(() => setToast(false), 2600);
    setStep(0);
  };

  return (
    <>
      <div className="window">
        <div className="window-bar">
          <span className="dots"><i className="wd r" /><i className="wd y" /><i className="wd g" /></span>
          <span className="window-title">Component preview</span>
        </div>
        <div className="window-body">
          <div className="fw-tabs" role="tablist">
            <button type="button" tabIndex={-1} className={`fw-tab${fw === "react" ? " is-active" : ""}`} onClick={() => setFw("react")}>React</button>
            <button type="button" tabIndex={-1} className={`fw-tab${fw === "angular" ? " is-active" : ""}`} onClick={() => setFw("angular")}>Angular</button>
            <span className="fw-note">identical output<span className="live-dot"></span></span>
          </div>

          {/* stepper */}
          <div className="wiz-steps">
            {STEPS.map((label, i) => (
              <Fragment key={label}>
                <div className={`wiz-step${i === step ? " is-current" : ""}${i < step ? " is-done" : ""}`}>
                  <span className="wiz-dot">
                    {i < step ? (
                      <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="wiz-label">{label}</span>
                </div>
                {i < STEPS.length - 1 && <span className={`wiz-bar${i < step ? " is-done" : ""}`}></span>}
              </Fragment>
            ))}
          </div>

          {/* step body */}
          <div className="wiz-body">
            {step === 0 && (
              <>
                <div className="d-field">
                  <label>Project name</label>
                  <div className="d-input">Acme dashboard</div>
                </div>
                <div className="d-field">
                  <label>Your email</label>
                  <div className="d-input">you@company.com</div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <button type="button" tabIndex={-1} className="panel-row panel-row-btn" onClick={() => setPriv((p) => !p)}>
                  <span>Private workspace</span>
                  <span className={`d-switch${priv ? "" : " is-off"}`}><i></i></span>
                </button>
                <div className="d-field">
                  <label>Plan</label>
                  <div className="wiz-plans">
                    <button type="button" tabIndex={-1} className={`wiz-plan${plan === "free" ? " is-on" : ""}`} onClick={() => setPlan("free")}>Free</button>
                    <button type="button" tabIndex={-1} className={`wiz-plan${plan === "pro" ? " is-on" : ""}`} onClick={() => setPlan("pro")}>Pro</button>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <div className="wiz-review">
                <div className="wiz-rev-row"><span>Project</span><strong>Acme dashboard</strong></div>
                <div className="wiz-rev-row"><span>Email</span><strong>you@company.com</strong></div>
                <div className="wiz-rev-row"><span>Visibility</span><strong>{priv ? "Private" : "Public"}</strong></div>
                <div className="wiz-rev-row"><span>Plan</span><strong>{plan === "pro" ? "Pro" : "Free"}</strong></div>
              </div>
            )}
          </div>

          {/* actions */}
          <div className="panel-actions wiz-actions">
            <button type="button" tabIndex={-1} className="d-btn d-btn-ghost" onClick={back} disabled={step === 0}>Back</button>
            {step < 2 ? (
              <button type="button" tabIndex={-1} className="d-btn d-btn-primary" onClick={next}>Continue</button>
            ) : (
              <button type="button" tabIndex={-1} className="d-btn d-btn-primary" onClick={finish}>Create workspace</button>
            )}
          </div>
        </div>
      </div>

      {toast && typeof document !== "undefined"
        ? createPortal(
            <div className="toast" role="status" aria-live="polite">
              <span className="toast-ic">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <p className="toast-title">Workspace created</p>
                <p className="toast-sub">Acme dashboard is ready to go.</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
