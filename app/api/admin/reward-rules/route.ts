import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.loyaltyRewardRule.findMany({
    orderBy: { pointsCost: "asc" },
  });

  const usersCount = await prisma.user.count();
  const totalPoints = await prisma.user.aggregate({
    _sum: { points: true },
  });

  return NextResponse.json({
    rules,
    stats: {
      users: usersCount,
      totalPoints: totalPoints._sum.points || 0,
    },
  });
}

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const rule = await prisma.loyaltyRewardRule.create({
    data: {
      title: body.title,
      description: body.description,
      icon: body.icon || "🎁",
      pointsCost: Number(body.pointsCost),
      type: body.type,
      value: body.value === "" || body.value === null ? null : Number(body.value),
      isActive: Boolean(body.isActive ?? true),
    },
  });

  return NextResponse.json({ rule });
}