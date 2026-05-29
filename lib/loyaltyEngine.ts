import type { LoyaltyRewardType, LoyaltyTier } from "@prisma/client";

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