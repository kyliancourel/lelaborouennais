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

function parseOptions(optionsText: unknown) {
  if (typeof optionsText !== "string") return [];

  return optionsText
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const options = parseOptions(body.optionsText);

    const rule = await prisma.loyaltyRewardRule.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        icon: body.icon || "🎁",
        pointsCost: Number(body.pointsCost),
        type: body.type,
        value:
          body.value === "" || body.value === null || body.value === undefined
            ? null
            : Number(body.value),
        options: options.length > 0 ? options : undefined,
        isActive: Boolean(body.isActive ?? true),
      },
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("UPDATE REWARD RULE ERROR:", error);

    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing reward rule id" },
        { status: 400 }
      );
    }

    const existing = await prisma.loyaltyRewardRule.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reward rule not found" },
        { status: 404 }
      );
    }

    await prisma.loyaltyRewardRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE REWARD RULE ERROR:", error);

    return NextResponse.json(
      { error: "Server error while deleting reward rule" },
      { status: 500 }
    );
  }
}