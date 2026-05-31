import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      emailConfirm,
      password,
      passwordConfirm,
      firstname,
      name,
      username,
    } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanEmailConfirm = String(emailConfirm || "").trim().toLowerCase();
    const cleanUsername = String(username || "").trim();
    const cleanFirstname = String(firstname || "").trim();
    const cleanLastname = String(name || "").trim();

    if (!cleanEmail || !password) {
      return Response.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    if (cleanEmail !== cleanEmailConfirm) {
      return Response.json(
        { error: "Les emails ne correspondent pas" },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return Response.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return Response.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    if (cleanUsername && !isValidUsername(cleanUsername)) {
      return Response.json(
        {
          error:
            "Le pseudo doit contenir 3 à 20 caractères : lettres, chiffres, tiret ou underscore uniquement.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return Response.json(
        { error: "Utilisateur déjà existant" },
        { status: 409 }
      );
    }

    if (cleanUsername) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (existingUsername) {
        return Response.json(
          { error: "Ce pseudo est déjà utilisé" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        firstname: cleanFirstname || null,
        lastname: cleanLastname || null,
        username: cleanUsername || null,
        isVerified: false,
        emailVerifyToken: token,
        emailVerifyExpires: expires,
        emailLastSentAt: new Date(),
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendVerificationEmail(cleanEmail, verifyUrl);

    return Response.json(
      {
        success: true,
        message: "Compte créé. Vérifie ton email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}