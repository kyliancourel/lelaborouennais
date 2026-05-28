import { prisma } from "@/lib/prisma";

export async function applyPointsToOrder({
  userId,
  pointsToUse,
  orderTotal,
}: {
  userId: string;
  pointsToUse: number;
  orderTotal: number;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const availablePoints = user.points;

  // sécurité
  const safePoints = Math.min(pointsToUse, availablePoints);

  const discount = Math.min(safePoints, orderTotal);

  const finalTotal = orderTotal - discount;

  return {
    discount,
    finalTotal,
    usedPoints: discount,
  };
}