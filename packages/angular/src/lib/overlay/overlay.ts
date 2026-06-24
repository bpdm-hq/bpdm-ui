import { ConnectedPosition, ConnectionPositionPair } from "@angular/cdk/overlay";

// Shared CDK-overlay helpers for the floating components (tooltip, popover, …).
// Internal — not part of the public API.

export type OverlaySide = "top" | "right" | "bottom" | "left";
export type OverlayAlign = "start" | "center" | "end";

// the edge the panel grows from — so the pop-in scales out of the trigger
export const OVERLAY_ORIGIN: Record<OverlaySide, string> = {
  top: "origin-bottom",
  bottom: "origin-top",
  left: "origin-right",
  right: "origin-left",
};

// where the little arrow sits + how it's rotated to point back at the trigger
export const OVERLAY_ARROW: Record<OverlaySide, string> = {
  top: "absolute left-1/2 top-full -translate-x-1/2",
  bottom: "absolute left-1/2 bottom-full -translate-x-1/2 rotate-180",
  left: "absolute top-1/2 left-full -translate-y-1/2 -rotate-90",
  right: "absolute top-1/2 right-full -translate-y-1/2 rotate-90",
};

const OPPOSITE: Record<OverlaySide, OverlaySide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function one(side: OverlaySide, align: OverlayAlign, offset: number): ConnectedPosition {
  if (side === "top" || side === "bottom") {
    const x = align === "center" ? "center" : align === "start" ? "start" : "end";
    const base = { originX: x, overlayX: x } as const;
    return side === "top"
      ? { ...base, originY: "top", overlayY: "bottom", offsetY: -offset }
      : { ...base, originY: "bottom", overlayY: "top", offsetY: offset };
  }
  const y = align === "center" ? "center" : align === "start" ? "top" : "bottom";
  const base = { originY: y, overlayY: y } as const;
  return side === "left"
    ? { ...base, originX: "start", overlayX: "end", offsetX: -offset }
    : { ...base, originX: "end", overlayX: "start", offsetX: offset };
}

/** Primary placement, plus the opposite side as a flip fallback when space is tight. */
export function connectedPositions(
  side: OverlaySide,
  align: OverlayAlign,
  offset: number,
): ConnectedPosition[] {
  return [one(side, align, offset), one(OPPOSITE[side], align, offset)];
}

/** Recover which side CDK actually settled on (it may have flipped) so the arrow can follow. */
export function sideFromPair(p: ConnectionPositionPair): OverlaySide {
  const vertical =
    p.originY !== p.overlayY && p.originY !== "center" && p.overlayY !== "center";
  if (vertical) return p.overlayY === "bottom" ? "top" : "bottom";
  return p.overlayX === "end" ? "left" : "right";
}
