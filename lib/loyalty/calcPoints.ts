// lib/loyalty/calcPoints.ts
import { prisma } from "@/lib/prisma";

export async function getUserPoints(userId: string) {
  const points = await prisma.loyaltyLog.aggregate({
    where: {
      userId,
    },
    _sum: {
      points: true,
    },
  });

  return points._sum.points ?? 0;
}