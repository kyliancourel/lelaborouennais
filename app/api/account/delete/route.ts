import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { choice, transferEmail, confirmText } = await req.json();

  if (confirmText !== "SUPPRIMER") {
    return NextResponse.json({ error: "Confirmation invalide" }, { status: 400 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const points = user.points || 0;

  if (points > 0 && choice === "TRANSFER") {
    const cleanTransferEmail = String(transferEmail || "").trim().toLowerCase();

    if (!cleanTransferEmail) {
      return NextResponse.json(
        { error: "Email destinataire requis" },
        { status: 400 }
      );
    }

    if (cleanTransferEmail === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Impossible de transférer les points vers le même compte" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: cleanTransferEmail },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Compte destinataire introuvable" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: {
          points: {
            increment: points,
          },
        },
      }),

      prisma.loyaltyLog.create({
        data: {
          userId: targetUser.id,
          points,
          type: "BONUS",
          source: "account_delete_transfer",
          metadata: {
            fromEmail: user.email,
          },
        },
      }),

      prisma.order.updateMany({
        where: { userId },
        data: { userId: null },
      }),

      prisma.loyaltyReward.deleteMany({
        where: { userId },
      }),

      prisma.loyaltyLog.deleteMany({
        where: { userId },
      }),

      prisma.session.deleteMany({
        where: { userId },
      }),

      prisma.account.deleteMany({
        where: { userId },
      }),

      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  }

  await prisma.$transaction([
    prisma.order.updateMany({
      where: { userId },
      data: { userId: null },
    }),

    prisma.loyaltyReward.deleteMany({
      where: { userId },
    }),

    prisma.loyaltyLog.deleteMany({
      where: { userId },
    }),

    prisma.session.deleteMany({
      where: { userId },
    }),

    prisma.account.deleteMany({
      where: { userId },
    }),

    prisma.user.delete({
      where: { id: userId },
    }),
  ]);

  return NextResponse.json({ success: true });
}