import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // 1. trouver user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 2. déjà vérifié
    if (user.isVerified) {
      return Response.json(
        { error: "Compte déjà vérifié" },
        { status: 400 }
      );
    }

    // 3. ANTI-SPAM (cooldown 60s)
    const now = new Date();

    if (user.emailLastSentAt) {
      const diff = now.getTime() - user.emailLastSentAt.getTime();
    
      if (diff < 30 * 1000) {
        return Response.json(
          { error: "Merci d’attendre 30 secondes" },
          { status: 429 }
        );
      }
    }

    // 4. nouveau token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    // 5. update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: token,
        emailVerifyExpires: expires,
        emailLastSentAt: new Date(), // 👈 IMPORTANT
      },
    });

    // 6. send email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendVerificationEmail(email, verifyUrl);

    return Response.json({
      message: "Email de vérification renvoyé",
    });
  } catch (error) {
    return Response.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}