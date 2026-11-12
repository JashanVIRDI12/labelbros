"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

/** Rendered on the thank-you page once an order is paid: empties the cart it came from. */
export function ClearCart() {
  useEffect(() => clearCart(), []);
  return null;
}
