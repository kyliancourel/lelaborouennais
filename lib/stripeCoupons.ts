import { stripe } from "@/lib/stripe";

export async function createStripeCoupon(reward: {
  type: string;
  value: number | null;
}) {
  if (reward.type === "COUPON_EURO") {
    return await stripe.coupons.create({
      amount_off: (reward.value || 0) * 100,
      currency: "eur",
    });
  }

  if (reward.type === "PERCENT") {
    return await stripe.coupons.create({
      percent_off: reward.value || 0,
    });
  }

  return null;
}