import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    console.log("❌ Missing Stripe signature");
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
    console.error("❌ Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("🔥 WEBHOOK EVENT:", event.type);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log("📦 SESSION:", session);

  const userId = session.metadata?.userId;
  const cartRaw = session.metadata?.cart;

  console.log("👤 userId:", userId);
  console.log("🛒 cartRaw:", cartRaw);

  if (!userId) {
    console.log("❌ NO USER ID → STOP");
    return NextResponse.json({ received: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log("❌ USER NOT FOUND");
    return NextResponse.json({ received: true });
  }

  let cart: any[] = [];

  try {
    cart = cartRaw ? JSON.parse(cartRaw) : [];
  } catch (e) {
    console.log("❌ CART PARSE ERROR");
  }

  console.log("🛒 CART:", cart);

  // =========================
  // ORDER NUMBER (PRO VERSION)
  // =========================
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;

  if (lastOrder?.orderNumber) {
    const lastPart = lastOrder.orderNumber.split("-").pop();
    const parsed = Number(lastPart);

    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  const orderNumber = `LR-${year}-${month}-${String(nextNumber).padStart(
    6,
    "0"
  )}`;

  console.log("🧾 ORDER NUMBER:", orderNumber);

  // =========================
  // CREATE ORDER
  // =========================
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        total: (session.amount_total ?? 0) / 100,
        status: "PAID",
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log("✅ ORDER CREATED:", order.id);
  } catch (err) {
    console.error("❌ PRISMA ORDER ERROR:", err);
  }

  return NextResponse.json({ received: true });
}