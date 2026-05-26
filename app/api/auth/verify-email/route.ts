import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
    },
  });

  if (!user) {
    return Response.json({ error: "Token invalide" }, { status: 400 });
  }

  if (
    !user.emailVerifyExpires ||
    user.emailVerifyExpires < new Date()
  ) {
    return Response.json({ error: "Token expiré" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return Response.json({ message: "Email vérifié !" });
}