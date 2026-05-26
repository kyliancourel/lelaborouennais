import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, name } = body;

    // VALIDATION
    if (!email || !password) {
      return Response.json(
        {
          error: "Email et mot de passe requis",
        },
        {
          status: 400,
        }
      );
    }

    // USER EXISTE ?
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          error: "Utilisateur déjà existant",
        },
        {
          status: 409,
        }
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // TOKEN
    const token = crypto.randomBytes(32).toString("hex");

    // EXPIRATION
    const expires = new Date(
      Date.now() + 1000 * 60 * 60 * 24
    );

    // CREATE USER
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: false,
        emailVerifyToken: token,
        emailVerifyExpires: expires,
        emailLastSentAt: new Date(), // 👈 AJOUT
      },
    });

    // VERIFY URL
    const verifyUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    // SEND EMAIL
    await sendVerificationEmail(email, verifyUrl);

    return Response.json(
      {
        success: true,
        message:
          "Compte créé. Vérifie ton email.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return Response.json(
      {
        error: "Erreur serveur",
      },
      {
        status: 500,
      }
    );
  }
}