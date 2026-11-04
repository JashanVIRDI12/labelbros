"use client";

import { useState } from "react";
import { Pricing, type QuoteSnapshot } from "@/components/sections/Pricing";
import { QuoteSend } from "./QuoteSend";

/** The quote page's two halves: the builder, and the form that sends what it built. */
export function QuoteFlow() {
  const [snap, setSnap] = useState<QuoteSnapshot | null>(null);
  return (
    <>
      <Pricing variant="quote" onQuote={setSnap} />
      <QuoteSend snap={snap} />
    </>
  );
}
