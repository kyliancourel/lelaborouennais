import { prisma } from "@/lib/prisma";

export async function getUserRealPoints(userId: string) {
  const logs = await prisma.loyaltyLog.aggregate({
    where: {
      userId,
    },
    _sum: {
      points: true,
    },
  });

  return Math.max(0, logs._sum.points || 0);
}

export async function syncUserPoints(userId: string) {
  const points = await getUserRealPoints(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { points },
  });

  return points;
}