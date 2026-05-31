import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const {
      token,
      password,
      passwordConfirm,
    } = await req.json();

    if (password !== passwordConfirm) {
      return NextResponse.json(
        {
          error:
            "Les mots de passe ne correspondent pas.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Lien invalide ou expiré.",
        },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(
      password,
      10
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}