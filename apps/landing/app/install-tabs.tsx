"use client";

import { useState } from "react";

type Pkg = { key: "react" | "angular"; label: string; pkg: string };

const PKGS: Pkg[] = [
  { key: "react", label: "React", pkg: "@bpdm/ui" },
  { key: "angular", label: "Angular", pkg: "@bpdm/ng" },
];

/** Install command with framework tabs + copy-to-clipboard (client component). */
export function InstallTabs() {
  const [active, setActive] = useState<Pkg["key"]>("react");
  const [copied, setCopied] = useState(false);
  const pkg = PKGS.find((p) => p.key === active)!.pkg;
  const cmd = `npm install ${pkg}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="install">
      <div className="install-tabs" role="tablist" aria-label="Framework">
        {PKGS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active === p.key}
            className={`install-tab${active === p.key ? " is-active" : ""}`}
            onClick={() => setActive(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="install-cmd">
        <code>
          <span className="prompt">$</span> npm install <span className="pkg">{pkg}</span>
        </code>
        <button type="button" className="copy" aria-label="Copy install command" onClick={copy}>
          {copied ? (
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
