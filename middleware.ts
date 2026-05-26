import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // 🔥 IMPORTANT
  });

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  console.log("PATH:", req.nextUrl.pathname);
  console.log("TOKEN:", token);

  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};