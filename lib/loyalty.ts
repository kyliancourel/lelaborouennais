import { prisma } from "@/lib/prisma";

export async function getUserRealPoints(userId: string) {
  const earned = await prisma.loyaltyLog.aggregate({
    where: {
      userId,
      type: {
        in: ["EARNED", "BONUS"],
      },
    },
    _sum: {
      points: true,
    },
  });

  const used = await prisma.loyaltyLog.aggregate({
    where: {
      userId,
      type: {
        in: ["USED", "EXPIRED"],
      },
    },
    _sum: {
      points: true,
    },
  });

  return Math.max(
    0,
    (earned._sum.points || 0) - (used._sum.points || 0)
  );
}

export async function syncUserPoints(userId: string) {
  const points = await getUserRealPoints(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { points },
  });

  return points;
}