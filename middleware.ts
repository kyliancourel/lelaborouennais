import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();

  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  console.log("MIDDLEWARE SESSION:", session);

  // ❌ pas connecté
  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ pas admin
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};