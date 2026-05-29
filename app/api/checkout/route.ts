import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateRewardDiscount,
  validateLoyaltyUsage,
} from "@/lib/loyaltyEngine";
import { fraudGuard } from "@/lib/loyaltyFraudGuard";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();
  const { cart, usedPoints = 0, rewardId = null } = await req.json();

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });
  }

  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  const cartTotal = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  const userPoints = user?.points || 0;

  const fraudCheck = fraudGuard({
    userPoints,
    usedPoints,
    cartTotal,
  });

  if (!fraudCheck.valid) {
    return NextResponse.json({ error: fraudCheck.reason }, { status: 400 });
  }

  const { safeUsedPoints } = validateLoyaltyUsage({
    userPoints,
    usedPoints,
    cartTotal,
  });

  let rewardDiscount = 0;
  let safeRewardId = "";

  if (rewardId && userId) {
    const reward = await prisma.loyaltyReward.findFirst({
      where: {
        id: rewardId,
        userId,
        status: "ACTIVE",
      },
    });

    if (!reward) {
      return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
    }

    rewardDiscount = calculateRewardDiscount({
      type: reward.type,
      value: reward.value,
      cartTotal,
    });

    safeRewardId = reward.id;
  }

  const totalDiscount = Math.min(
    cartTotal,
    safeUsedPoints + rewardDiscount
  );

  const safeCart = cart.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
  }));

  const coupon =
    totalDiscount > 0
      ? await stripe.coupons.create({
          amount_off: Math.round(totalDiscount * 100),
          currency: "eur",
          duration: "once",
          name: "Réduction fidélité",
        })
      : null;

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

    discounts: coupon ? [{ coupon: coupon.id }] : undefined,

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,

    metadata: {
      userId: userId || "",
      email: email || "",
      cart: JSON.stringify(safeCart),
      usedPoints: String(safeUsedPoints),
      rewardId: safeRewardId,
      rewardDiscount: String(rewardDiscount),
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}