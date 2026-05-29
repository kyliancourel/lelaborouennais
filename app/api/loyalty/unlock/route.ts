import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateUserTier } from "@/lib/loyaltyTierEngine";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ruleId, selectedOption } = await req.json();

  const userId = session.user.id;

  const rule = await prisma.loyaltyRewardRule.findFirst({
    where: {
      id: ruleId,
      isActive: true,
    },
  });

  if (!rule) {
    return NextResponse.json({ error: "Reward rule not found" }, { status: 404 });
  }

  const options = Array.isArray(rule.options) ? rule.options : [];

  if (options.length > 0) {
    if (!selectedOption || !options.includes(selectedOption)) {
      return NextResponse.json(
        { error: "Selected option is required" },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.points < rule.pointsCost) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  const existingActiveReward = await prisma.loyaltyReward.findFirst({
    where: {
      userId,
      source: `rule_${rule.id}`,
      status: "ACTIVE",
    },
  });

  if (existingActiveReward) {
    return NextResponse.json(
      { error: "Reward already unlocked" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.loyaltyReward.create({
      data: {
        userId,
        type: rule.type,
        value: rule.value,
        source: `rule_${rule.id}`,
        selectedOption: selectedOption || null,
      },
    }),

    prisma.loyaltyLog.create({
      data: {
        userId,
        points: rule.pointsCost,
        type: "USED",
        source: `unlock_${rule.id}`,
        metadata: {
          rewardTitle: rule.title,
          selectedOption: selectedOption || null,
        },
      },
    }),

    prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: rule.pointsCost,
        },
      },
    }),
  ]);

  await updateUserTier(userId);

  return NextResponse.json({ success: true });
}