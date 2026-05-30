"use client";

import { useCart } from "@/context/CartContext";
import { useUserLoyalty } from "@/hooks/useUserLoyalty";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

type Reward = {
  id: string;
  type: string;
  value: number | null;
  title: string;
  description: string;
  icon: string | null;
  selectedOption: string | null;
};

function getRewardLabel(reward: Reward) {
  if (reward.selectedOption) {
    return `${reward.title} — ${reward.selectedOption}`;
  }

  return reward.title;
}

function getRewardDiscount(reward: Reward | null, total: number) {
  if (!reward || !reward.value) return 0;

  if (reward.type === "COUPON_EURO") return Math.min(reward.value, total);
  if (reward.type === "PERCENT") return Math.min(total, (total * reward.value) / 100);
  if (reward.type === "PRODUCT_DISCOUNT") return Math.min(reward.value, total);
  if (reward.type === "GIFT") return Math.min(reward.value, total);

  return 0;
}

export default function CartPage() {
  const {
    cart,
    addToCart,
    removeOne,
    remove,
    total,
    selectedRewardId,
    setSelectedRewardId,
  } = useCart();

  const { user } = useUserLoyalty();

  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const availablePoints = user?.points ?? 0;

  useEffect(() => {
    async function loadRewards() {
      const res = await fetch("/api/rewards");
      if (!res.ok) return;

      const data = await res.json();
      setRewards(data.rewards || []);
    }

    loadRewards();
  }, []);

  const selectedReward = useMemo(
    () => rewards.find((reward) => reward.id === selectedRewardId) ?? null,
    [rewards, selectedRewardId]
  );

  const rewardDiscount = getRewardDiscount(selectedReward, total);
  const finalTotal = Math.max(0, total - rewardDiscount);
  const earnedPointsAfterPayment = Math.floor(finalTotal);

  async function handleCheckout() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
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

                {item.selectedColor && (
                  <p className="text-muted">Couleur : {item.selectedColor}</p>
                )}

                {item.customText && (
                  <p className="text-muted">Texte : {item.customText}</p>
                )}

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
            <h3>🌟 Fidélité</h3>

            <p>
              Points disponibles sur ton compte : <strong>{availablePoints}</strong>
            </p>

            <p>
              Points gagnés après cette commande :{" "}
              <strong>{earnedPointsAfterPayment}</strong>
            </p>

            {rewards.length > 0 ? (
              <>
                <label className="input-label">Récompense débloquée</label>

                <select
                  className="input"
                  value={selectedRewardId || ""}
                  onChange={(e) => setSelectedRewardId(e.target.value || null)}
                >
                  <option value="">Aucune récompense</option>

                  {rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.icon || "🎁"} {getRewardLabel(reward)}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className="text-muted">
                Aucune récompense débloquée pour le moment.
              </p>
            )}

            {selectedReward && (
              <div className="reward-checkout-detail">
                <strong>{selectedReward.icon || "🎁"} {selectedReward.title}</strong>

                {selectedReward.selectedOption ? (
                  <p>Choix : {selectedReward.selectedOption}</p>
                ) : (
                  <p>{selectedReward.description}</p>
                )}
              </div>
            )}

            {rewardDiscount > 0 && (
              <p>Remise récompense : {rewardDiscount.toFixed(2)} €</p>
            )}

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