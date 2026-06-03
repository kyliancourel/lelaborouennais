import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      usages: true,
    },
  });

  return NextResponse.json({ promoCodes });
}

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, type, value, isActive } = await req.json();

  const cleanCode = String(code || "").trim().toUpperCase();

  if (!cleanCode || !value) {
    return NextResponse.json(
      { error: "Code et valeur requis." },
      { status: 400 }
    );
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      code: cleanCode,
      type: type === "EURO" ? "EURO" : "PERCENT",
      value: Number(value),
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ promoCode });
}