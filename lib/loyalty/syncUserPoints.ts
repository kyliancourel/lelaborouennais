import { prisma } from "@/lib/prisma";
import { getUserPoints } from "./calcPoints";

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