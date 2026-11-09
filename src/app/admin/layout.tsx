import type { Metadata } from "next";
import "./admin.css";

/*
 * The shop's back office: orders, quotes and messages. Never indexed, never cached by
 * search engines, and behind a password (proxy.ts, then every page and action again).
 */
export const metadata: Metadata = {
  title: "Admin · Label Bros",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
