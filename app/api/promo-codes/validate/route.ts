import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  const userId = session?.user?.id || null;

  if (!userId) {
    return NextResponse.json(
      { error: "Connecte-toi pour utiliser un code promo." },
      { status: 401 }
    );
  }

  const { code, cartTotal } = await req.json();

  const cleanCode = String(code || "").trim().toUpperCase();

  if (!cleanCode) {
    return NextResponse.json(
      { error: "Code promo requis." },
      { status: 400 }
    );
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: cleanCode },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json(
      { error: "Code promo invalide ou expiré." },
      { status: 400 }
    );
  }

  const alreadyUsed = await prisma.promoCodeUsage.findUnique({
    where: {
      promoCodeId_userId: {
        promoCodeId: promo.id,
        userId,
      },
    },
  });

  if (alreadyUsed) {
    return NextResponse.json(
      { error: "Tu as déjà utilisé ce code promo." },
      { status: 400 }
    );
  }

  const safeTotal = Number(cartTotal || 0);

  const discount =
    promo.type === "PERCENT"
      ? Math.min(safeTotal, (safeTotal * promo.value) / 100)
      : Math.min(promo.value, safeTotal);

  return NextResponse.json({
    promo: {
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount,
    },
  });
}