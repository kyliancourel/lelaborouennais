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
  const { name, hex, isActive, inStock } = await req.json();

  const color = await prisma.colorOption.update({
    where: { id },
    data: {
      name: String(name || "").trim(),
      hex: String(hex || "").trim(),
      isActive: Boolean(isActive),
      inStock: Boolean(inStock),
    },
  });

  return NextResponse.json({ color });
}

export async function DELETE(req: Request, context: Context) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.colorOption.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}