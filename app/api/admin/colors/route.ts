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
  const colors = await prisma.colorOption.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({ colors });
}

export async function POST(req: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, hex, isActive, inStock } = await req.json();

  const cleanName = String(name || "").trim();
  const cleanHex = String(hex || "").trim();

  if (!cleanName || !cleanHex) {
    return NextResponse.json(
      { error: "Nom et couleur requis." },
      { status: 400 }
    );
  }

  const color = await prisma.colorOption.create({
    data: {
      name: cleanName,
      hex: cleanHex,
      isActive: Boolean(isActive),
      inStock: Boolean(inStock),
    },
  });

  return NextResponse.json({ color });
}