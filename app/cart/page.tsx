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

type WelcomePreview = {
  code: string;
  type: string;
  value: number;
  discount: number;
};

type PromoPreview = {
  code: string;
  type: string;
  value: number;
  discount: number;
};

function formatEuro(value: number) {
  return Number(value).toFixed(2) + " €";
}

function getRewardLabel(reward: Reward) {
  if (reward.selectedOption) {
    return `${reward.title} — ${reward.selectedOption}`;
  }

  return reward.title;
}

function getRewardDiscount(reward: Reward | null, total: number) {
  if (!reward || !reward.value) return 0;

  if (reward.type === "COUPON_EURO") return Math.min(reward.value, total);

  if (reward.type === "PERCENT") {
    return Math.min(total, (total * reward.value) / 100);
  }

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

  const [welcomeCode, setWelcomeCode] = useState("");
  const [welcomePreview, setWelcomePreview] = useState<WelcomePreview | null>(
    null
  );
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [welcomeError, setWelcomeError] = useState("");
  const [welcomeSuccess, setWelcomeSuccess] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

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
  const welcomeDiscount = welcomePreview?.discount ?? 0;
  const promoDiscount = promoPreview?.discount ?? 0;

  const totalDiscount = Math.min(
    total,
    rewardDiscount + welcomeDiscount + promoDiscount
  );

  const finalTotal = Math.max(0, total - totalDiscount);
  const earnedPointsAfterPayment = Math.floor(finalTotal);

  async function validateWelcomeCode() {
    setWelcomeError("");
    setWelcomeSuccess("");
    setWelcomePreview(null);

    const cleanCode = welcomeCode.trim().toUpperCase();

    if (!cleanCode) {
      setWelcomeError("Entre un code de bienvenue.");
      return;
    }

    setWelcomeLoading(true);

    const res = await fetch("/api/welcome-offer/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: cleanCode,
        cartTotal: total,
      }),
    });

    const data = await res.json();

    setWelcomeLoading(false);

    if (!res.ok) {
      setWelcomeError(data.error || "Code invalide.");
      return;
    }

    setWelcomePreview(data.offer);
    setWelcomeSuccess("Code appliqué au panier.");
  }

  async function validatePromoCode() {
    setPromoError("");
    setPromoSuccess("");
    setPromoPreview(null);

    const cleanCode = promoCode.trim().toUpperCase();

    if (!cleanCode) {
      setPromoError("Entre un code promo.");
      return;
    }

    setPromoLoading(true);

    const res = await fetch("/api/promo-codes/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: cleanCode,
        cartTotal: total,
      }),
    });

    const data = await res.json();

    setPromoLoading(false);

    if (!res.ok) {
      setPromoError(data.error || "Code promo invalide.");
      return;
    }

    setPromoPreview(data.promo);
    setPromoSuccess("Code promo appliqué au panier.");
  }

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
          welcomeCode: welcomePreview ? welcomeCode : "",
          promoCode: promoPreview ? promoCode : "",
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
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />
              )}

              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">{formatEuro(item.price)}</p>

                {item.selectedColor && (
                  <p className="text-muted">Couleur : {item.selectedColor}</p>
                )}

                {item.selectedColors &&
                  Object.entries(item.selectedColors).map(([zone, color]) => (
                    <p key={zone} className="text-muted">
                      {zone} : {String(color)}
                    </p>
                  ))}

                {item.customText && (
                  <p className="text-muted">Texte : {item.customText}</p>
                )}

                <div className="cart-qty">
                  <button
                    className="qty-btn"
                    onClick={() => removeOne(item.id)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button className="qty-btn" onClick={() => addToCart(item)}>
                    +
                  </button>
                </div>

                <button
                  className="cart-remove-btn"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="section-title">Résumé</h2>

          <div className="summary-row">
            <span>Total avant remise</span>
            <strong>{formatEuro(total)}</strong>
          </div>

          <div className="loyalty-box">
            <h3>🌟 Fidélité</h3>

            <p>
              Points disponibles sur ton compte :{" "}
              <strong>{availablePoints}</strong>
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
                <strong>
                  {selectedReward.icon || "🎁"} {selectedReward.title}
                </strong>

                {selectedReward.selectedOption ? (
                  <p>Choix : {selectedReward.selectedOption}</p>
                ) : (
                  <p>{selectedReward.description}</p>
                )}
              </div>
            )}

            {rewardDiscount > 0 && (
              <p>Remise récompense : -{formatEuro(rewardDiscount)}</p>
            )}
          </div>

          <div className="loyalty-box mt-3">
            <h3>🎁 Offre de bienvenue</h3>

            <p className="text-muted">
              Si tu as reçu un code par email, tu peux l'utiliser ici.
            </p>

            <input
              className="input"
              placeholder="Ex : WELCOME-XXXXXX"
              value={welcomeCode}
              onChange={(e) => {
                setWelcomeCode(e.target.value.toUpperCase());
                setWelcomePreview(null);
                setWelcomeError("");
                setWelcomeSuccess("");
              }}
            />

            <button
              type="button"
              className="btn btn-outline"
              onClick={validateWelcomeCode}
              disabled={welcomeLoading}
            >
              {welcomeLoading ? "Vérification..." : "Appliquer le code"}
            </button>

            {welcomeError && <p className="auth-error">{welcomeError}</p>}
            {welcomeSuccess && <p className="auth-success">{welcomeSuccess}</p>}

            {welcomePreview && (
              <div className="reward-checkout-detail">
                <strong>Code : {welcomePreview.code}</strong>

                <p>
                  Avantage :{" "}
                  {welcomePreview.type === "PERCENT"
                    ? `${welcomePreview.value}%`
                    : formatEuro(welcomePreview.value)}
                </p>

                <p>
                  Remise bienvenue : -{formatEuro(welcomePreview.discount)}
                </p>
              </div>
            )}
          </div>

          <div className="loyalty-box mt-3">
            <h3>🏷️ Code promo</h3>

            <p className="text-muted">
              Entre un code promo public si tu en as un.
            </p>

            <input
              className="input"
              placeholder="Ex : PROMO10"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoPreview(null);
                setPromoError("");
                setPromoSuccess("");
              }}
            />

            <button
              type="button"
              className="btn btn-outline"
              onClick={validatePromoCode}
              disabled={promoLoading}
            >
              {promoLoading ? "Vérification..." : "Appliquer le code promo"}
            </button>

            {promoError && <p className="auth-error">{promoError}</p>}
            {promoSuccess && <p className="auth-success">{promoSuccess}</p>}

            {promoPreview && (
              <div className="reward-checkout-detail">
                <strong>Code : {promoPreview.code}</strong>

                <p>
                  Avantage :{" "}
                  {promoPreview.type === "PERCENT"
                    ? `${promoPreview.value}%`
                    : formatEuro(promoPreview.value)}
                </p>

                <p>Remise code promo : -{formatEuro(promoPreview.discount)}</p>
              </div>
            )}
          </div>

          <div className="loyalty-box">
            <h3>Total commande</h3>

            {rewardDiscount > 0 && (
              <p className="text-muted">
                Remise fidélité : -{formatEuro(rewardDiscount)}
              </p>
            )}

            {welcomeDiscount > 0 && (
              <p className="text-muted">
                Remise bienvenue : -{formatEuro(welcomeDiscount)}
              </p>
            )}

            {promoDiscount > 0 && (
              <p className="text-muted">
                Remise code promo : -{formatEuro(promoDiscount)}
              </p>
            )}

            {totalDiscount > 0 && (
              <p className="text-muted">
                Total des remises : -{formatEuro(totalDiscount)}
              </p>
            )}

            <p className="final-total">Total final : {formatEuro(finalTotal)}</p>
          </div>

          <button
            className="checkout-btn"
            disabled={loading}
            onClick={handleCheckout}
          >
            {loading ? "Redirection..." : "Payer maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}