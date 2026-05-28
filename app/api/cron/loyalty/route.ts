import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  // 🔍 find expired users
  const expiredUsers = await prisma.user.findMany({
    where: {
      pointsExpiresAt: {
        lt: now,
      },
    },
  });

  for (const user of expiredUsers) {
    if (user.points <= 0) continue;

    // 🧾 AUDIT LOG (important SaaS)
    await prisma.loyaltyPoint.create({
      data: {
        userId: user.id,
        points: user.points,
        type: "EXPIRED",
        source: "cron_expiration",
      },
    });

    // reset safe
    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: 0,
        pointsExpiresAt: null,
      },
    });
  }

  return NextResponse.json({
    expired: expiredUsers.length,
  });
}