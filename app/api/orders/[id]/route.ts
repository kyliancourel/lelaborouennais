import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  const order = await prisma.order.update({
    where: { id },
    data: { status: data.status },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.orderItem.deleteMany({
    where: { orderId: id },
  });

  await prisma.order.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}