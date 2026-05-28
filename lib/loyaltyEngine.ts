type ValidateParams = {
  userPoints: number;
  usedPoints: number;
  cartTotal: number;
};

/**
 * 🛡️ SAFETY ENGINE (1€ = 1 point)
 */
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

/**
 * 💰 BASE EARN RULE (before multiplier)
 */
export function calculateEarnedPoints(total: number) {
  return Math.floor(total);
}

/**
 * 💎 VIP MULTIPLIER (SAAS CORE)
 */
export function calculateVipMultiplier(
  tier: "BRONZE" | "SILVER" | "GOLD" | "VIP"
) {
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

/**
 * 💰 FINAL EARNED POINTS (NEW SAAS RULE)
 */
export function calculateFinalEarnedPoints(
  total: number,
  tier: "BRONZE" | "SILVER" | "GOLD" | "VIP"
) {
  const base = calculateEarnedPoints(total);
  const multiplier = calculateVipMultiplier(tier);

  return Math.floor(base * multiplier);
}

/**
 * 🧾 UI helper
 */
export function pointsToEuro(points: number) {
  return points;
}