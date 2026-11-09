import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main id="main" className="adm-login">
      <div className="adm-login-card">
        <span className="adm-brand-sticker" aria-hidden="true">
          <b>Label</b>
          <b>Bros</b>
        </span>
        <h1 className="adm-login-title">Back office</h1>
        <p className="adm-muted">Orders, proofs, sample kits and enquiries. Sign in with the shop password.</p>
        <LoginForm />
      </div>
    </main>
  );
}
