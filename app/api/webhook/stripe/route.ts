import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/email";
import { calculateEarnedPoints } from "@/lib/loyaltyEngine";
import { updateUserTier } from "@/lib/loyaltyTierEngine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId || null;
  const usedPoints = Number(session.metadata?.usedPoints || 0);

  const cart = session.metadata?.cart
    ? JSON.parse(session.metadata.cart)
    : [];

  const email =
    session.customer_email ||
    session.metadata?.email ||
    session.customer_details?.email ||
    null;

  if (!email) return NextResponse.json({ received: true });

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existing) return NextResponse.json({ received: true });

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        stripeSessionId: session.id,
        ...(userId ? { userId } : {}),
        total: (session.amount_total ?? 0) / 100,
        status: "PAID",
        usedPoints,
        discount: usedPoints,
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
        items: { include: { product: true } },
      },
    });

    if (!fullOrder) throw new Error("Order not found");

    await sendOrderEmail(email, {
      orderNumber: fullOrder.orderNumber!,
      total: fullOrder.total,
      createdAt: fullOrder.createdAt,
      email,
      user: fullOrder.user,
      items: fullOrder.items,
    });

    // 🧠 LOYALTY ENGINE SAAS CORE
    if (userId) {
      const pointsEarned = calculateEarnedPoints(fullOrder.total);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const realUserPoints = user?.points || 0;
      const safeUsedPoints = Math.min(realUserPoints, usedPoints);

      await prisma.loyaltyPoint.create({
        data: {
          userId,
          points: pointsEarned,
          type: "EARNED",
          source: `order_${fullOrder.id}`,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: pointsEarned,
            decrement: safeUsedPoints,
          },
        },
      });

      await updateUserTier(userId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}