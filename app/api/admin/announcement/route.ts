import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const announcement = await prisma.siteAnnouncement.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({
    announcement,
  });
}

export async function PUT(req: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, isActive } = await req.json();

  const existing = await prisma.siteAnnouncement.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
  });

  const announcement = existing
    ? await prisma.siteAnnouncement.update({
        where: {
          id: existing.id,
        },
        data: {
          message: String(message || "").trim(),
          isActive: Boolean(isActive),
        },
      })
    : await prisma.siteAnnouncement.create({
        data: {
          message: String(message || "").trim(),
          isActive: Boolean(isActive),
        },
      });

  return NextResponse.json({
    announcement,
  });
}