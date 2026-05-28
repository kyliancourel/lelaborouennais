import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rewardId } = await req.json();

  const reward = await prisma.loyaltyReward.findUnique({
    where: { id: rewardId },
  });

  if (!reward || reward.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
  }

  // 🧠 MARK USED
  await prisma.loyaltyReward.update({
    where: { id: rewardId },
    data: {
      status: "USED",
      usedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    rewardType: reward.type,
    value: reward.value,
  });
}