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
    // 🛡️ max utilisable = panier (1 point = 1€)
    const maxByCart = Math.floor(cartTotal);
  
    // 🛡️ max utilisateur
    const maxByUser = userPoints;
  
    const safeUsedPoints = Math.max(
      0,
      Math.floor(Math.min(usedPoints, maxByCart, maxByUser))
    );
  
    return {
      safeUsedPoints,
    };
  }
  
  /**
   * 🟢 SAAS CORE RULE
   * 1€ = 1 point
   */
  export function calculateEarnedPoints(total: number) {
    return Math.floor(total);
  }
  
  /**
   * 🟢 BONUS: conversion helper UI/dashboard
   */
  export function pointsToEuro(points: number) {
    return points;
  }