import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  // ✅ FIX IMPORTANT : lire directement depuis request
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
    console.error("Webhook signature error:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Only handle successful checkout
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  const cartRaw = session.metadata?.cart;

  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const cart = cartRaw ? JSON.parse(cartRaw) : [];

  try {
    // 🧾 CREATE ORDER
    const order = await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        userId,
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

    // 🔥 RELOAD FULL ORDER FOR EMAIL
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (fullOrder) {
      await sendOrderEmail(user.email, {
        orderNumber: fullOrder.orderNumber!,
        total: fullOrder.total,
        items: fullOrder.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    }

    console.log("ORDER CREATED + EMAIL SENT");
  } catch (err) {
    console.error("ORDER ERROR:", err);
  }

  return NextResponse.json({ received: true });
}