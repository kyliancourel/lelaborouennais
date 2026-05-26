import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/invoice";
import React from "react";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const element = React.createElement(InvoicePDF, { order });

  const buffer = await renderToBuffer(element);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${order.orderNumber}.pdf`,
    },
  });
}