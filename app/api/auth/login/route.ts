import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Vérifier champs
    if (!email || !password) {
      return Response.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // 2. Trouver utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 🚨 3. BLOQUAGE EMAIL NON VÉRIFIÉ (AJOUT ICI)
    if (!user.isVerified) {
      return Response.json(
        { error: "Email non vérifié" },
        { status: 403 }
      );
    }

    // 4. Vérifier mot de passe
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 5. Retourner user SANS password
    return Response.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}