import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({
      hasUsedWelcomeOffer: false,
    });
  }

  const usedOffer = await prisma.welcomeOffer.findFirst({
    where: {
      email: email.toLowerCase(),
      status: "USED",
    },
  });

  return NextResponse.json({
    hasUsedWelcomeOffer: Boolean(usedOffer),
  });
}