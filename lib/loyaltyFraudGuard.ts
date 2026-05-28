type Params = {
    userPoints: number;
    usedPoints: number;
    cartTotal: number;
  };
  
  export function fraudGuard({
    userPoints,
    usedPoints,
    cartTotal,
  }: Params) {
    // ❌ impossible de dépasser le panier
    if (usedPoints > cartTotal) {
      return {
        valid: false,
        reason: "OVER_CART_LIMIT",
      };
    }
  
    // ❌ impossible de dépasser user points
    if (usedPoints > userPoints) {
      return {
        valid: false,
        reason: "INSUFFICIENT_POINTS",
      };
    }
  
    // ❌ suspicion abuse (too high ratio)
    if (usedPoints > cartTotal * 0.8) {
      return {
        valid: false,
        reason: "FRAUD_SUSPECTED",
      };
    }
  
    return { valid: true };
  }