import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");

  // 🔐 récup token JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("TOKEN ROLE:", token?.role); // 👈 ICI
  console.log("MW PATH:", pathname);
  console.log("MW TOKEN:", token);

  // ❌ pas connecté → redirect login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ pas admin → redirect home
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// ⚡ uniquement routes admin
export const config = {
  matcher: ["/admin/:path*"],
};