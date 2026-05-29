import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rewards = await prisma.loyaltyReward.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rules = await prisma.loyaltyRewardRule.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: "asc" },
  });

  return NextResponse.json({
    rewards,
    rules,
  });
}