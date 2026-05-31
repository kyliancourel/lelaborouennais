import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateRewardDiscount } from "@/lib/loyaltyEngine";
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

  const {
    cart,
    usedPoints = 0,
    rewardId = null,
    welcomeCode = "",
  } = await req.json();

  if (usedPoints > 0) {
    return NextResponse.json(
      { error: "Les points servent uniquement à débloquer des récompenses." },
      { status: 400 }
    );
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });
  }

  const userId = session?.user?.id || null;
  const email = session?.user?.email || null;

  const cartTotal = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  let rewardDiscount = 0;
  let safeRewardId = "";
  let rewardTitle = "";
  let rewardType = "";
  let rewardValue = "";
  let rewardSelectedOption = "";

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

    const ruleId = reward.source?.replace("rule_", "");

    const rule = ruleId
      ? await prisma.loyaltyRewardRule.findUnique({
          where: { id: ruleId },
        })
      : null;

    rewardDiscount = calculateRewardDiscount({
      type: reward.type,
      value: reward.value,
      cartTotal,
    });

    safeRewardId = reward.id;
    rewardTitle = rule?.title || "Récompense fidélité";
    rewardType = reward.type;
    rewardValue =
      reward.value !== null && reward.value !== undefined
        ? String(reward.value)
        : "";
    rewardSelectedOption = reward.selectedOption || "";
  }

  let welcomeOfferDiscount = 0;
  let welcomeOfferId = "";
  let welcomeOfferCode = "";

  const cleanWelcomeCode = String(welcomeCode || "").trim().toUpperCase();

  if (cleanWelcomeCode) {
    if (!userId || !email) {
      return NextResponse.json(
        {
          error:
            "Connecte-toi avec l'adresse email qui a reçu l'offre de bienvenue.",
        },
        { status: 401 }
      );
    }

    const offer = await prisma.welcomeOffer.findUnique({
      where: { code: cleanWelcomeCode },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Code de bienvenue invalide" },
        { status: 400 }
      );
    }

    if (offer.status !== "SENT") {
      return NextResponse.json(
        { error: "Cette offre de bienvenue a déjà été utilisée" },
        { status: 400 }
      );
    }

    if (offer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "Ce code de bienvenue n'est pas associé à l'email de ce compte.",
        },
        { status: 400 }
      );
    }

    const previousOrders = await prisma.order.count({
      where: {
        userId,
        status: {
          in: ["PAID", "SHIPPED", "COMPLETED"],
        },
      },
    });

    if (previousOrders > 0) {
      return NextResponse.json(
        {
          error:
            "L'offre de bienvenue est valable uniquement sur la première commande.",
        },
        { status: 400 }
      );
    }

    welcomeOfferDiscount = Math.min(offer.value, cartTotal);
    welcomeOfferId = offer.id;
    welcomeOfferCode = offer.code;
  }

  const totalDiscount = Math.min(
    cartTotal,
    rewardDiscount + welcomeOfferDiscount
  );

  const safeCart = cart.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    selectedColor: item.selectedColor || "",
    selectedColors: item.selectedColors || {},
    customText: item.customText || "",
  }));

  const coupon =
    totalDiscount > 0
      ? await stripe.coupons.create({
          amount_off: Math.round(totalDiscount * 100),
          currency: "eur",
          duration: "once",
          name: "Réduction fidélité / bienvenue",
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
          name: [
            item.name,
            item.selectedColor ? `Couleur : ${item.selectedColor}` : "",
            item.customText ? `Texte : ${item.customText}` : "",
          ]
            .filter(Boolean)
            .join(" — "),
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
      usedPoints: "0",

      rewardId: safeRewardId,
      rewardDiscount: String(rewardDiscount),
      rewardTitle,
      rewardType,
      rewardValue,
      rewardSelectedOption,

      welcomeOfferId,
      welcomeOfferCode,
      welcomeOfferDiscount: String(welcomeOfferDiscount),
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}