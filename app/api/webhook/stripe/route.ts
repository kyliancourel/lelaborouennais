import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

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
    console.error("Missing userId in metadata");
    return NextResponse.json({ received: true });
  }

  let cart: any[] = [];

  try {
    cart = cartRaw ? JSON.parse(cartRaw) : [];
  } catch (err) {
    console.error("Cart parse error:", err);
  }

  try {
    await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        userId,
        total: (session.amount_total ?? 0) / 100,
        status: "PAID",
        items: {
          create: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
          })),
        },
      },
    });

    console.log("ORDER CREATED SUCCESSFULLY");
  } catch (err) {
    console.error("ORDER CREATION ERROR:", err);
  }

  return NextResponse.json({ received: true });
}