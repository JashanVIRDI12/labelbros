"use client";

import { useSyncExternalStore } from "react";
import type { Currency } from "./facts";

/*
 * Which currency this visitor sees: CAD when shipping to Canada, USD everywhere else. The proxy
 * guesses it from their location on the first visit and keeps it in a cookie; the "Shipping to"
 * switch changes it. Pages are built ahead of time in CAD and switch on arrival.
 */

export const CURRENCY_COOKIE = "lb_cur";
const EVENT = "lb-currency";

function read(): Currency {
  const m = document.cookie.match(/(?:^|;\s*)lb_cur=(cad|usd)/);
  return (m?.[1] as Currency) ?? "cad";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useCurrency(): Currency {
  return useSyncExternalStore(subscribe, read, () => "cad");
}

export function setCurrency(cur: Currency) {
  document.cookie = `${CURRENCY_COOKIE}=${cur}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  window.dispatchEvent(new Event(EVENT));
}
