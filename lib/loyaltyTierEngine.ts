// /lib/loyaltyTierEngine.ts

import { prisma } from "@/lib/prisma";

export async function updateUserTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const points = user.points;

  let tier = "BRONZE";

  if (points >= 250) tier = "VIP";
  else if (points >= 150) tier = "GOLD";
  else if (points >= 75) tier = "SILVER";

  await prisma.user.update({
    where: { id: userId },
    data: {
      loyaltyTier: tier as any,
    },
  });
}