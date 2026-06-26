import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "bpdm/ui — one design system, every framework";

// Branded 1200×630 social card, generated at build time (static export).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0e0e11",
          backgroundImage: "radial-gradient(900px 520px at 50% -10%, rgba(245,166,35,0.16), transparent 70%)",
          color: "#f7f6f3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#f5a623", fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" }}>
          bpdm · design system
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 92, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
          <span>One design system,</span>
          <span style={{ color: "#f5a623" }}>every framework.</span>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 32, color: "#a5a3ad", maxWidth: 900 }}>
          Accessible, themeable components on one shared token set — React &amp; Angular.
        </div>
        <div style={{ display: "flex", marginTop: 48, gap: 28, fontSize: 26, color: "#a5a3ad" }}>
          <span style={{ color: "#61dafb" }}>React</span>
          <span>·</span>
          <span style={{ color: "#ff5a6a" }}>Angular</span>
          <span>·</span>
          <span>bpdm.dev</span>
        </div>
      </div>
    ),
    size,
  );
}
