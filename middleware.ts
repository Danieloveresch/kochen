import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Schützt alle Seiten. Ohne gültiges Cookie -> Weiterleitung zu /login.
export function middleware(req: NextRequest) {
  const token = req.cookies.get("access")?.value;
  if (token && token === process.env.ACCESS_TOKEN) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // /login und /api/login bleiben offen, ebenso interne Next-Pfade.
  matcher: ["/((?!login|api/login|_next|favicon.ico).*)"],
};
