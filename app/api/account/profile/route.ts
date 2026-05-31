import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

function canChangeUsername(lastUpdate: Date | null) {
  if (!lastUpdate) return true;

  const nextDate = new Date(lastUpdate);
  nextDate.setMonth(nextDate.getMonth() + 6);

  return new Date() >= nextDate;
}

export async function PUT(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstname, lastname, username } = await req.json();

  const cleanFirstname = String(firstname || "").trim();
  const cleanLastname = String(lastname || "").trim();
  const cleanUsername = String(username || "").trim();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const data: any = {
    firstname: cleanFirstname || null,
    lastname: cleanLastname || null,
  };

  if (cleanUsername !== (user.username || "")) {
    if (!cleanUsername) {
      data.username = null;
      data.usernameUpdatedAt = new Date();
    } else {
      if (!isValidUsername(cleanUsername)) {
        return NextResponse.json(
          {
            error:
              "Le pseudo doit contenir 3 à 20 caractères : lettres, chiffres, tiret ou underscore uniquement.",
          },
          { status: 400 }
        );
      }

      if (!canChangeUsername(user.usernameUpdatedAt)) {
        return NextResponse.json(
          { error: "Tu peux modifier ton pseudo seulement une fois tous les 6 mois." },
          { status: 400 }
        );
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (existingUsername && existingUsername.id !== user.id) {
        return NextResponse.json(
          { error: "Ce pseudo est déjà utilisé" },
          { status: 409 }
        );
      }

      data.username = cleanUsername;
      data.usernameUpdatedAt = new Date();
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({ success: true });
}