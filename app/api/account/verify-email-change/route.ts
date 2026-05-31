import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      pendingEmailVerifyToken: token,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  }

  if (
    !user.pendingEmailVerifyExpires ||
    user.pendingEmailVerifyExpires < new Date()
  ) {
    return NextResponse.json({ error: "Token expiré" }, { status: 400 });
  }

  if (!user.pendingEmail) {
    return NextResponse.json(
      { error: "Aucun nouvel email en attente" },
      { status: 400 }
    );
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: user.pendingEmail },
  });

  if (existingEmail && existingEmail.id !== user.id) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail,
      pendingEmail: null,
      pendingEmailVerifyToken: null,
      pendingEmailVerifyExpires: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Nouvel email confirmé avec succès.",
  });
}