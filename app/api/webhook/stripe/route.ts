import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId || null;

  const cart = session.metadata?.cart
    ? JSON.parse(session.metadata.cart)
    : [];

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.email ||
    null;

  if (!email) {
    console.log("❌ No email found");
    return NextResponse.json({ received: true });
  }

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existing) {
    return NextResponse.json({ received: true });
  }

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        stripeSessionId: session.id,
        ...(userId ? { userId } : {}),
        total: (session.amount_total ?? 0) / 100,
        status: "PAID",
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
          })),
        },
      },
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!fullOrder) {
      throw new Error("Order not found");
    }

    await sendOrderEmail(email, {
      orderNumber: fullOrder.orderNumber!,
      total: fullOrder.total,
      createdAt: fullOrder.createdAt,
      email,
      user: fullOrder.user,
      items: fullOrder.items,
    });

    console.log("✅ ORDER + EMAIL SENT");
  } catch (err) {
    console.error("ORDER ERROR:", err);
  }

  return NextResponse.json({ received: true });
}