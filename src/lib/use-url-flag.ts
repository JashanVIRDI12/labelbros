import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Does the page's URL have ?key=value (and, if given, this #hash)? False on the server. */
export function useUrlFlag(key: string, value: string, hash?: string) {
  return useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get(key) === value && (!hash || window.location.hash === hash),
    () => false,
  );
}
