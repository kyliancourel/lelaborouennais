"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type Reward = {
  id: string;
  type: string;
  value: number | null;
};

function getRewardLabel(reward: Reward) {
  if (reward.type === "COUPON_EURO") return `Coupon ${reward.value}€`;
  if (reward.type === "PERCENT") return `Réduction ${reward.value}%`;
  if (reward.type === "PRODUCT_DISCOUNT") return `Réduction ${reward.value}€`;
  if (reward.type === "FREE_PRODUCT") return "Produit offert";
  if (reward.type === "GIFT") return `Cadeau ${reward.value}€`;
  return "Récompense";
}

export default function CartPage() {
  const {
    cart,
    addToCart,
    removeOne,
    remove,
    total,
    pointsUsed,
    setPointsUsed,
    maxPoints,
    selectedRewardId,
    setSelectedRewardId,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    async function loadRewards() {
      const res = await fetch("/api/rewards");

      if (!res.ok) return;

      const data = await res.json();
      setRewards(data.rewards || []);
    }

    loadRewards();
  }, []);

  const discount = Math.min(pointsUsed, maxPoints);
  const finalTotal = Math.max(0, total - discount);

  async function handleCheckout() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          usedPoints: discount,
          rewardId: selectedRewardId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur checkout");
      }
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-title">Ton panier est vide</h2>
        <p className="empty-subtitle">Ajoute des produits pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Panier</h1>

      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              {item.image && (
                <img src={item.image} alt={item.name} className="cart-item-image" />
              )}

              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">{item.price} €</p>

                <div className="cart-qty">
                  <button className="qty-btn" onClick={() => removeOne(item.id)}>
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button className="qty-btn" onClick={() => addToCart(item)}>
                    +
                  </button>
                </div>

                <button className="cart-remove-btn" onClick={() => remove(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="section-title">Résumé</h2>

          <div className="summary-row">
            <span>Total</span>
            <strong>{total.toFixed(2)} €</strong>
          </div>

          <div className="loyalty-box">
            <h3>💚 Fidélité</h3>

            <p>Points utilisables : {maxPoints}</p>

            <input
              className="input"
              type="number"
              value={pointsUsed}
              onChange={(e) => setPointsUsed(Number(e.target.value))}
              max={maxPoints}
              min={0}
            />

            {rewards.length > 0 && (
              <select
                className="input"
                value={selectedRewardId || ""}
                onChange={(e) => setSelectedRewardId(e.target.value || null)}
              >
                <option value="">Aucune récompense</option>

                {rewards.map((reward) => (
                  <option key={reward.id} value={reward.id}>
                    {getRewardLabel(reward)}
                  </option>
                ))}
              </select>
            )}

            <p>Remise points : {discount.toFixed(2)} €</p>

            <p className="final-total">
              Total final : {finalTotal.toFixed(2)} €
            </p>
          </div>

          <button className="checkout-btn" disabled={loading} onClick={handleCheckout}>
            {loading ? "Redirection..." : "Payer maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}