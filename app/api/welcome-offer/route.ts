import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendWelcomeOfferEmail } from "@/lib/email";

function generateCode() {
  return `WELCOME-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Adresse email requise" },
        { status: 400 }
      );
    }

    const existing = await prisma.welcomeOffer.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Offre de bienvenue déjà envoyée" },
        { status: 409 }
      );
    }

    const offer = await prisma.welcomeOffer.create({
      data: {
        email: cleanEmail,
        code: generateCode(),
        value: 10,
        type: "PERCENT",
      },
    });

    await sendWelcomeOfferEmail(cleanEmail, {
      code: offer.code,
      value: offer.value,
      type: offer.type,
    });

    return NextResponse.json({
      success: true,
      message: "Ton offre de bienvenue a été envoyée par email.",
    });
  } catch (error) {
    console.error("WELCOME OFFER ERROR:", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}