import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  req: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}