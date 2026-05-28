import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateLoyaltyUsage } from "@/lib/loyaltyEngine";
import { fraudGuard } from "@/lib/loyaltyFraudGuard";
import { rateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  // =========================
  // RATE LIMIT (ANTI SPAM)
  // =========================
  const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // =========================
  // AUTH
  // =========================
  const session = await auth();

  const { cart, usedPoints = 0 } = await req.json();

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json(
      { error: "Cart empty" },
      { status: 400 }
    );
  }

  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  // =========================
  // TOTAL CALCULATION
  // =========================
  const cartTotal = cart.reduce(
    (sum: number, item: any) =>
      sum + item.price * item.quantity,
    0
  );

  // =========================
  // USER FETCH
  // =========================
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
      })
    : null;

  const userPoints = user?.points || 0;

  // =========================
  // FRAUD CHECK
  // =========================
  const fraudCheck = fraudGuard({
    userPoints,
    usedPoints,
    cartTotal,
  });

  if (!fraudCheck.valid) {
    return NextResponse.json(
      { error: fraudCheck.reason },
      { status: 400 }
    );
  }

  // =========================
  // LOYALTY VALIDATION
  // =========================
  const { safeUsedPoints } = validateLoyaltyUsage({
    userPoints,
    usedPoints,
    cartTotal,
  });

  // =========================
  // SAFE CART
  // =========================
  const safeCart = cart.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
  }));

  // =========================
  // STRIPE SESSION
  // =========================
  const stripeSession =
    await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      billing_address_collection: "auto",

      line_items: cart.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(
            item.price * 100
          ),
          product_data: {
            name: item.name,
            images: item.image
              ? [item.image]
              : [],
          },
        },
      })),

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,

      metadata: {
        userId: userId || "",
        email: email || "",
        cart: JSON.stringify(safeCart),
        usedPoints: String(safeUsedPoints),
      },
    });

  return NextResponse.json({
    url: stripeSession.url,
  });
}