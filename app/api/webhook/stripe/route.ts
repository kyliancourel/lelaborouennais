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
    console.log("❌ Stripe webhook error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log("🔥 SESSION RECEIVED:", session.id);

  const userId = session.metadata?.userId;
  const cartRaw = session.metadata?.cart;

  if (!userId) {
    console.log("❌ Missing userId in metadata");
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
  } catch {
    console.log("❌ Cart parse error");
  }

  // 🔢 ORDER NUMBER FORMAT PRO
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;

  if (lastOrder?.orderNumber) {
    const last = lastOrder.orderNumber.split("-").pop();
    nextNumber = Number(last) + 1;
  }

  const date = new Date();
  const orderNumber = `LR-${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(nextNumber).padStart(6, "0")}`;

  // 🧾 CREATE ORDER
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

  return NextResponse.json({ received: true });
}