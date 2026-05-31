import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmailChangeVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newEmail, newEmailConfirm } = await req.json();

  const cleanNewEmail = String(newEmail || "").trim().toLowerCase();
  const cleanNewEmailConfirm = String(newEmailConfirm || "").trim().toLowerCase();

  if (!cleanNewEmail || !cleanNewEmailConfirm) {
    return NextResponse.json(
      { error: "Nouvel email et confirmation requis" },
      { status: 400 }
    );
  }

  if (cleanNewEmail !== cleanNewEmailConfirm) {
    return NextResponse.json(
      { error: "Les emails ne correspondent pas" },
      { status: 400 }
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  if (cleanNewEmail === currentUser.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Ce nouvel email est identique à l'email actuel" },
      { status: 400 }
    );
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: cleanNewEmail },
  });

  if (existingEmail) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé par un autre compte" },
      { status: 409 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      pendingEmail: cleanNewEmail,
      pendingEmailVerifyToken: token,
      pendingEmailVerifyExpires: expires,
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email-change?token=${token}`;

  await sendEmailChangeVerificationEmail(cleanNewEmail, verifyUrl);

  return NextResponse.json({
    success: true,
    message:
      "Email de vérification envoyé. Ton ancien email reste actif jusqu'à validation.",
  });
}