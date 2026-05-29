import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE REWARD RULE ERROR:", error);

    return NextResponse.json(
      { error: "Server error while deleting reward rule" },
      { status: 500 }
    );
  }
}