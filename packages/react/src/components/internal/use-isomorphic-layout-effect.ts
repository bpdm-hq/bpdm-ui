import * as React from "react";

/** `useLayoutEffect` on the client, `useEffect` on the server. Silences React's
 *  "useLayoutEffect does nothing on the server" dev warning during SSR while
 *  keeping synchronous, pre-paint DOM measurement on the client. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
