import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/email";
import { calculateFinalEarnedPoints } from "@/lib/loyaltyEngine";
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

  const rewardId = session.metadata?.rewardId || "";
  const rewardDiscount = Number(session.metadata?.rewardDiscount || 0);
  const rewardTitle = session.metadata?.rewardTitle || "";
  const rewardType = session.metadata?.rewardType || "";

  const rewardValue =
    session.metadata?.rewardValue && session.metadata.rewardValue !== ""
      ? Number(session.metadata.rewardValue)
      : null;

  const rewardSelectedOption = session.metadata?.rewardSelectedOption || "";

  const welcomeOfferId = session.metadata?.welcomeOfferId || "";
  const welcomeOfferCode = session.metadata?.welcomeOfferCode || "";
  const welcomeOfferDiscount = Number(
    session.metadata?.welcomeOfferDiscount || 0
  );

  const welcomeOfferType = session.metadata?.welcomeOfferType || "";

  const welcomeOfferValue =
    session.metadata?.welcomeOfferValue &&
    session.metadata.welcomeOfferValue !== ""
      ? Number(session.metadata.welcomeOfferValue)
      : null;
  
  const promoCodeId = session.metadata?.promoCodeId || "";
  const promoCode = session.metadata?.promoCode || "";
  const promoDiscount = Number(session.metadata?.promoDiscount || 0);
  const promoCodeType = session.metadata?.promoCodeType || "";

  const promoCodeValue =
    session.metadata?.promoCodeValue && session.metadata.promoCodeValue !== ""
      ? Number(session.metadata.promoCodeValue)
      : null;

  const cart = session.metadata?.cart
    ? JSON.parse(session.metadata.cart)
    : [];

  const email =
    session.customer_email ||
    session.metadata?.email ||
    session.customer_details?.email ||
    null;

  if (!email) {
    return NextResponse.json({ received: true });
  }

  const existing = await prisma.order.findFirst({
    where: {
      stripeSessionId: session.id,
    },
  });

  if (existing) {
    return NextResponse.json({ received: true });
  }

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: `LR-${Date.now()}`,
        stripeSessionId: session.id,
        ...(userId ? { userId } : {}),

        total: (session.amount_total ?? 0) / 100,
        status: "PAID",

        usedPoints,
        discount: usedPoints + rewardDiscount + welcomeOfferDiscount + promoDiscount,

        rewardId: rewardId || null,
        rewardTitle: rewardTitle || null,
        rewardType: rewardType ? (rewardType as any) : null,
        rewardValue,
        rewardSelectedOption: rewardSelectedOption || null,

        welcomeOfferId: welcomeOfferId || null,
        welcomeOfferCode: welcomeOfferCode || null,
        welcomeOfferValue,

        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
            selectedColor: item.selectedColor || null,
            selectedColors: item.selectedColors || {},
            customText: item.customText || null,
            packLabel: item.packLabel || null,
          })),
        },
      },
    });

    const fullOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!fullOrder) {
      throw new Error("Order not found");
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const tierBeforeOrder = user?.loyaltyTier || "BRONZE";
      const pointsBeforeOrder = user?.points || 0;

      const pointsEarned = calculateFinalEarnedPoints(
        fullOrder.total,
        tierBeforeOrder
      );

      await prisma.loyaltyLog.create({
        data: {
          userId,
          points: pointsEarned,
          type: "EARNED",
          source: `order_${fullOrder.id}`,
        },
      });

      if (rewardId) {
        await prisma.loyaltyReward.update({
          where: {
            id: rewardId,
          },
          data: {
            status: "USED",
            usedAt: new Date(),
          },
        });
      }

      if (welcomeOfferId) {
        await prisma.welcomeOffer.update({
          where: {
            id: welcomeOfferId,
          },
          data: {
            status: "USED",
            usedAt: new Date(),
          },
        });

        await prisma.loyaltyLog.create({
          data: {
            userId,
            points: 0,
            type: "BONUS",
            source: `welcome_offer_${welcomeOfferId}`,
            metadata: {
              title: "Offre de bienvenue",
              code: welcomeOfferCode,
              type: welcomeOfferType,
              value: welcomeOfferValue,
              discount: welcomeOfferDiscount,
            },
          },
        });
      }

      if (promoCodeId && userId) {
  await prisma.promoCodeUsage.create({
    data: {
      promoCodeId,
      userId,
      orderId: fullOrder.id,
    },
  });

  await prisma.loyaltyLog.create({
    data: {
      userId,
      points: 0,
      type: "BONUS",
      source: `promo_code_${promoCodeId}`,
      metadata: {
        title: "Code promo",
        code: promoCode,
        type: promoCodeType,
        value: promoCodeValue,
        discount: promoDiscount,
      },
    },
  });
}

      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          points: {
            increment: pointsEarned,
          },
        },
      });

      await updateUserTier(userId);

      const userAfterTierUpdate = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      await sendOrderEmail(email, {
        orderNumber: fullOrder.orderNumber!,
        total: fullOrder.total,
        createdAt: fullOrder.createdAt,
        email,
        user: {
          ...fullOrder.user,
          loyaltyTier:
            userAfterTierUpdate?.loyaltyTier ||
            updatedUser.loyaltyTier ||
            tierBeforeOrder,
        },
        items: fullOrder.items,

        discount: fullOrder.discount,

        rewardTitle: fullOrder.rewardTitle,
        rewardType: fullOrder.rewardType,
        rewardValue: fullOrder.rewardValue,
        rewardSelectedOption: fullOrder.rewardSelectedOption,

        welcomeOfferCode: fullOrder.welcomeOfferCode,
        welcomeOfferValue: fullOrder.welcomeOfferValue,

        pointsBeforeOrder,
        pointsEarned,
        pointsAfterOrder: pointsBeforeOrder + pointsEarned,
        loyaltyTierAfterOrder:
          userAfterTierUpdate?.loyaltyTier ||
          updatedUser.loyaltyTier ||
          tierBeforeOrder,
      });

      return NextResponse.json({
        received: true,
      });
    }

    await sendOrderEmail(email, {
      orderNumber: fullOrder.orderNumber!,
      total: fullOrder.total,
      createdAt: fullOrder.createdAt,
      email,
      user: fullOrder.user,
      items: fullOrder.items,

      discount: fullOrder.discount,

      rewardTitle: fullOrder.rewardTitle,
      rewardType: fullOrder.rewardType,
      rewardValue: fullOrder.rewardValue,
      rewardSelectedOption: fullOrder.rewardSelectedOption,

      welcomeOfferCode: fullOrder.welcomeOfferCode,
      welcomeOfferValue: fullOrder.welcomeOfferValue,

      pointsBeforeOrder: 0,
      pointsEarned: 0,
      pointsAfterOrder: 0,
      loyaltyTierAfterOrder: "BRONZE",
    });

    return NextResponse.json({
      received: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}