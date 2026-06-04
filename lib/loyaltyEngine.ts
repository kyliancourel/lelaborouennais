import type { LoyaltyRewardType, LoyaltyTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateUserTier } from "@/lib/loyaltyTierEngine";

type ValidateParams = {
  userPoints: number;
  usedPoints: number;
  cartTotal: number;
};

export function validateLoyaltyUsage({
  userPoints,
  usedPoints,
  cartTotal,
}: ValidateParams) {
  const maxByCart = Math.floor(cartTotal);
  const maxByUser = userPoints;

  const safeUsedPoints = Math.max(
    0,
    Math.floor(Math.min(usedPoints, maxByCart, maxByUser))
  );

  return { safeUsedPoints };
}

export function calculateEarnedPoints(total: number) {
  return Math.floor(total);
}

export function calculateVipMultiplier(tier: LoyaltyTier) {
  switch (tier) {
    case "VIP":
      return 2;
    case "GOLD":
      return 1.5;
    case "SILVER":
      return 1.2;
    default:
      return 1;
  }
}

export function calculateFinalEarnedPoints(total: number, tier: LoyaltyTier) {
  const base = calculateEarnedPoints(total);
  const multiplier = calculateVipMultiplier(tier);

  return Math.floor(base * multiplier);
}

export function calculateRewardDiscount(params: {
  type: LoyaltyRewardType;
  value: number | null;
  cartTotal: number;
}) {
  const { type, value, cartTotal } = params;

  if (!value) return 0;

  if (type === "COUPON_EURO") {
    return Math.min(value, cartTotal);
  }

  if (type === "PERCENT") {
    return Math.min(cartTotal, (cartTotal * value) / 100);
  }

  if (type === "PRODUCT_DISCOUNT") {
    return Math.min(value, cartTotal);
  }

  if (type === "GIFT") {
    return Math.min(value, cartTotal);
  }

  if (type === "FREE_PRODUCT") {
    return 0;
  }

  return 0;
}

export function pointsToEuro(points: number) {
  return points;
}

export async function removeEarnedPointsForCancelledOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order?.userId) {
    return;
  }

  const earnedLog = await prisma.loyaltyLog.findFirst({
    where: {
      userId: order.userId,
      type: "EARNED",
      source: `order_${order.id}`,
    },
  });

  if (!earnedLog) {
    return;
  }

  const alreadyRemoved = await prisma.loyaltyLog.findFirst({
    where: {
      userId: order.userId,
      type: "EXPIRED",
      source: `cancel_order_${order.id}`,
    },
  });

  if (alreadyRemoved) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: order.userId,
    },
  });

  if (!user) {
    return;
  }

  const pointsToRemove = Math.min(
    user.points,
    Math.max(0, earnedLog.points)
  );

  if (pointsToRemove > 0) {
    await prisma.user.update({
      where: {
        id: order.userId,
      },
      data: {
        points: {
          decrement: pointsToRemove,
        },
      },
    });
  }

  await prisma.loyaltyLog.create({
    data: {
      userId: order.userId,
      points: -pointsToRemove,
      type: "EXPIRED",
      source: `cancel_order_${order.id}`,
      metadata: {
        reason: "Commande annulée ou remboursée",
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status,
        removedPoints: pointsToRemove,
      },
    },
  });

  await updateUserTier(order.userId);
}