import { prisma } from "@/lib/prisma";

/**
 * Calcule le total réel des points depuis l'historique
 */
export async function getUserPoints(userId: string) {
  const result = await prisma.loyaltyLog.aggregate({
    where: {
      userId,
      type: "EARNED",
    },
    _sum: {
      points: true,
    },
  });

  return result._sum.points ?? 0;
}

/**
 * Synchronise le solde utilisateur (source de vérité)
 */
export async function syncUserPoints(userId: string) {
  const total = await getUserPoints(userId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      points: total,
    },
  });

  return total;
}

/**
 * Ajoute des points + historise
 */
export async function addUserPoints(params: {
  userId: string;
  points: number;
  source: string;
}) {
  const { userId, points, source } = params;

  await prisma.loyaltyLog.create({
    data: {
      userId,
      points,
      type: "EARNED",
      source,
    },
  });
  
  return syncUserPoints(userId);
}