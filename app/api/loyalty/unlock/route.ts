import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ruleId } = await req.json();

  const rule = await prisma.loyaltyRewardRule.findFirst({
    where: {
      id: ruleId,
      isActive: true,
    },
  });

  if (!rule) {
    return NextResponse.json({ error: "Reward rule not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.points < rule.pointsCost) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }

  const reward = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          decrement: rule.pointsCost,
        },
      },
    });

    await tx.loyaltyLog.create({
      data: {
        userId: session.user.id,
        points: rule.pointsCost,
        type: "USED",
        source: `unlock_${rule.id}`,
        metadata: {
          title: rule.title,
          type: rule.type,
          value: rule.value,
        },
      },
    });

    return tx.loyaltyReward.create({
      data: {
        userId: session.user.id,
        type: rule.type,
        value: rule.value,
        status: "ACTIVE",
        source: `rule_${rule.id}`,
      },
    });
  });

  return NextResponse.json({ reward });
}