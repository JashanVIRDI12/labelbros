import { NextResponse, type NextRequest } from "next/server";
import { cookieName, verifyToken } from "@/server/session-token";

/*
 * Runs before pages:
 *  - /admin: no valid session cookie, no admin page (except sign-in). Pages and actions check
 *    again on their own; this only stops requests early.
 *  - everything else, first visit only: guess the visitor's currency from where they are (CAD in
 *    Canada, USD elsewhere) and keep it in a cookie the "Shipping to" switch can change.
 */

function guessCurrency(req: NextRequest) {
  // the host's location header: Vercel, Cloudflare (often in front of cPanel), or a generic one
  const country = (
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-country-code") ??
    ""
  ).toUpperCase();
  if (/^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "T1") return country === "CA" ? "cad" : "usd";
  // no location from the host: CAD (the browser's language is no guide: many Canadians use en-US)
  return "cad";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (verifyToken(req.cookies.get(cookieName())?.value)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (!req.cookies.has("lb_cur")) {
    res.cookies.set("lb_cur", guessCurrency(req), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
    });
  }
  return res;
}

export const config = {
  // pages only: not the API, Next's own files or static files (anything with a dot)
  matcher: ["/admin", "/admin/:path*", "/((?!api|_next|.*\\..*).*)"],
};
