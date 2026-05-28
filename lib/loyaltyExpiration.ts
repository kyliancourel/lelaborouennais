import { prisma } from "@/lib/prisma";

export async function expireRewards() {
  const expired = await prisma.loyaltyReward.updateMany({
    where: {
      status: "ACTIVE",
      createdAt: {
        lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });

  return expired;
}