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

  const enrichedRewards = rewards.map((reward) => {
    const ruleId = reward.source?.replace("rule_", "");

    const rule = rules.find((r) => r.id === ruleId);

    return {
      id: reward.id,
      type: reward.type,
      value: reward.value,
      source: reward.source,
      selectedOption: reward.selectedOption,
      title: rule?.title || "Récompense fidélité",
      description: rule?.description || "",
      icon: rule?.icon || "🎁",
    };
  });

  return NextResponse.json({
    rewards: enrichedRewards,
    rules,
  });
}