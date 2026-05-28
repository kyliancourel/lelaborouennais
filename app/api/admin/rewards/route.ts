import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, type, value, source } = body;

  const reward = await prisma.loyaltyReward.create({
    data: {
      userId: userId || "SYSTEM",
      type,
      value,
      source: source || "admin_created",
    },
  });

  return NextResponse.json(reward);
}