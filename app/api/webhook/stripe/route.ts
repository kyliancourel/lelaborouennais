import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  const sig = (await headers()).get("stripe-signature");

  console.log("🔥 WEBHOOK HIT");

  if (!sig) {
    console.log("❌ Missing signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Signature error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("EVENT TYPE:", event.type);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log("SESSION RECEIVED");

  const userId = session.metadata?.userId;
  const cartRaw = session.metadata?.cart;

  if (!userId) {
    console.log("❌ Missing userId");
    return NextResponse.json({ received: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log("❌ User not found");
    return NextResponse.json({ received: true });
  }

  let cart: any[] = [];

  try {
    cart = cartRaw ? JSON.parse(cartRaw) : [];
  } catch (e) {
    console.log("❌ Cart parse error");
  }

  console.log("🛒 CART:", cart);

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        userId: user.id,
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

    console.log("✅ ORDER CREATED:", order.id);
  } catch (err) {
    console.error("❌ PRISMA ERROR:", err);
  }

  return NextResponse.json({ received: true });
}