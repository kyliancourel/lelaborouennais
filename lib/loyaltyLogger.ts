import { prisma } from "@/lib/prisma";

export async function logLoyalty({
  userId,
  type,
  points,
  source,
}: {
  userId: string;
  type: "EARNED" | "USED" | "EXPIRED" | "BONUS";
  points: number;
  source?: string;
}) {
  await prisma.loyaltyPoint.create({
    data: {
      userId,
      type,
      points,
      source,
    },
  });
}