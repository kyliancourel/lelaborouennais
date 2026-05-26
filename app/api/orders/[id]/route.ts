import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =========================
// UPDATE ORDER STATUS
// =========================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: data.status,
    },
  });

  return NextResponse.json(order);
}

// =========================
// DELETE ORDER
// =========================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 🔥 supprimer les items d'abord (relation Prisma)
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id },
    });

    // 🔥 supprimer la commande
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}