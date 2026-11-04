import type { ReactNode } from "react";

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

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
