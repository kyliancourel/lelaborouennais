import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = context.params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json(
      { error: "Missing status" },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(order);
}