import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncUserPoints } from "@/lib/loyalty";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const points = await syncUserPoints(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      username: true,
      usernameUpdatedAt: true,
      loyaltyTier: true,
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      points,
    },
  });
}