// Ref-counted background scroll-lock for the overlays. Module-level so overlapping overlays (a detail
// dialog opened over a day peek) don't unlock the page prematurely — the lock lifts only when the last
// one releases. Mirrors @bpdm/scheduler's useScrollLock.

let scrollLockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/** Lock background scrolling; returns an idempotent release fn (call it on the overlay's destroy). */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  const body = document.body;
  if (scrollLockCount === 0) {
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;
    // pad for the scrollbar we're about to hide so the page behind doesn't shift
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    body.style.overflow = "hidden";
  }
  scrollLockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount--;
    if (scrollLockCount === 0) {
      body.style.overflow = savedOverflow;
      body.style.paddingRight = savedPaddingRight;
    }
  };
}
