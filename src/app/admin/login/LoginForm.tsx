"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="adm-login-form">
      <label htmlFor="adm-pw" className="adm-label">
        Password
      </label>
      <input
        id="adm-pw"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={200}
        className="adm-input"
        aria-invalid={!!state.error}
        aria-describedby={state.error ? "adm-pw-error" : undefined}
      />
      {state.error && (
        <p id="adm-pw-error" className="adm-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
