"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api";

export function UnsubscribeForm() {
  const token = useSearchParams().get("t") ?? "";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (!token)
    return (
      <p>
        This link is missing its code. Use the unsubscribe link from one of our emails, or <Link href="/contact">ask us</Link> to take you off the list.
      </p>
    );
  if (state === "done")
    return (
      <div role="status">
        <p className="signup-title">You&apos;re off the list.</p>
        <p>We won&apos;t send you news or offers again. Changed your mind? Sign up again at the bottom of any page.</p>
      </div>
    );
  return (
    <div className="grid gap-4">
      <p>Stop all news and offer emails from Label Bros to this address.</p>
      <div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={state === "sending"}
          onClick={async () => {
            setState("sending");
            const res = await send("/api/unsubscribe", { token });
            setState(res.ok ? "done" : "error");
          }}
        >
          {state === "sending" ? "Unsubscribing…" : "Unsubscribe"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert">
          That didn&apos;t go through. Try again, or <Link href="/contact">ask us</Link> to take you off the list.
        </p>
      )}
    </div>
  );
}
