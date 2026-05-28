import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateLoyaltyUsage } from "@/lib/loyaltyEngine";

export async function POST(req: Request) {
  const session = await auth();
  const { cart, usedPoints = 0 } = await req.json();

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });
  }

  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  const cartTotal = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  // 🧠 SOURCE OF TRUTH DB
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  const userPoints = user?.points || 0;

  const { safeUsedPoints } = validateLoyaltyUsage({
    userPoints,
    usedPoints,
    cartTotal,
  });

  const safeCart = cart.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
  }));

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    customer_email: email || undefined,
    billing_address_collection: "auto",

    line_items: cart.map((item: any) => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
      },
    })),

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,

    metadata: {
      userId: userId || "",
      email: email || "",
      cart: JSON.stringify(safeCart),
      usedPoints: String(safeUsedPoints),
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}