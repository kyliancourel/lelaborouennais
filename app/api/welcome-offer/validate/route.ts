import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { code, cartTotal } = await req.json();

    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;

    if (!userId || !email) {
      return NextResponse.json(
        {
          error:
            "Connecte-toi avec l'adresse email qui a reçu l'offre de bienvenue.",
        },
        { status: 401 }
      );
    }

    const cleanCode = String(code || "").trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { error: "Code requis." },
        { status: 400 }
      );
    }

    const offer = await prisma.welcomeOffer.findUnique({
      where: { code: cleanCode },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Code de bienvenue invalide." },
        { status: 400 }
      );
    }

    if (offer.status !== "SENT") {
      return NextResponse.json(
        { error: "Cette offre de bienvenue a déjà été utilisée." },
        { status: 400 }
      );
    }

    if (offer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "Ce code de bienvenue n'est pas associé à l'email de ce compte.",
        },
        { status: 400 }
      );
    }

    const safeCartTotal = Number(cartTotal || 0);

    const discount =
      offer.type === "PERCENT"
        ? Math.min(safeCartTotal, (safeCartTotal * offer.value) / 100)
        : Math.min(offer.value, safeCartTotal);

    return NextResponse.json({
      success: true,
      offer: {
        code: offer.code,
        type: offer.type,
        value: offer.value,
        discount,
      },
    });
  } catch (error) {
    console.error("WELCOME OFFER VALIDATE ERROR:", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}