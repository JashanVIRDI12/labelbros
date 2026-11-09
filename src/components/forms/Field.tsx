import type { ReactNode } from "react";
import { CONTACT } from "@/lib/site";

export { EMAIL } from "@/lib/forms";

/*
 * One form field: its label, the control, and a hint or an error under it (the error replaces
 * the hint and is what the control is described by). Styles: `.field` in forms.css.
 */
export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field" data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="field-opt"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** The id a control is described by: its error, else its hint. */
export const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

/** A field every bot fills in and no person sees: if it has a value, the message is dropped. */
export function Honeypot() {
  return (
    <div className="field-trap" aria-hidden="true">
      <label htmlFor="qf-website">Website</label>
      <input id="qf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

/** Where a form is: typing, sending, off to Stripe, sent, or why it could not be sent. */
export type Status = "idle" | "sending" | "paying" | "sent" | "error" | "offline" | "busy";

/** The message under a form when it could not be sent (or `children`, for a message of its own). */
export function FormAlert({ status, children }: { status?: Status; children?: ReactNode }) {
  const text =
    children ??
    (status === "offline" ? (
      <>
        We can&apos;t take orders or messages from the site yet.
        {CONTACT.email && (
          <>
            {" "}
            Email us at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
          </>
        )}
      </>
    ) : status === "busy" ? (
      "That's a lot of sending in a short time. Wait a few minutes and try again."
    ) : status === "error" ? (
      "That didn't go through. Check the form and your connection, and try again."
    ) : null);
  if (!text) return null;
  return (
    <p className="form-alert" role="alert">
      {text}
    </p>
  );
}
