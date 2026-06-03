import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function PATCH(req: Request, context: Context) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { isActive } = await req.json();

  const promoCode = await prisma.promoCode.update({
    where: { id },
    data: {
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ promoCode });
}

export async function DELETE(req: Request, context: Context) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.promoCodeUsage.deleteMany({
    where: { promoCodeId: id },
  });

  await prisma.promoCode.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}