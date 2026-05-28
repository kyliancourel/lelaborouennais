import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();

  const totalPointsEarned = await prisma.loyaltyPoint.aggregate({
    _sum: { points: true },
    where: { type: "EARNED" },
  });

  const totalPointsUsed = await prisma.loyaltyPoint.aggregate({
    _sum: { points: true },
    where: { type: "USED" },
  });

  const conversionRate =
    users.length > 0
      ? (totalPointsUsed._sum.points || 0) /
        (totalPointsEarned._sum.points || 1)
      : 0;

  return NextResponse.json({
    users: users.length,
    pointsEarned: totalPointsEarned._sum.points || 0,
    pointsUsed: totalPointsUsed._sum.points || 0,
    conversionRate,
  });
}