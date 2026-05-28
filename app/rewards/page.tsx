"use client";

import { useEffect, useState } from "react";

type Reward = {
  id: string;
  type: string;
  value: number | null;
  status: "ACTIVE" | "USED" | "EXPIRED";
  source: string;
  createdAt: string;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      setRewards(data.rewards);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-10">Chargement...</div>;
  }

  return (
    <div className="rewards-page">
      <h1 className="page-title">💚 Mes récompenses</h1>

      {/* ========================= */}
      {/* HERO STATS */}
      {/* ========================= */}
      <div className="rewards-hero">
        <div className="card">
          <h3>🎯 Programme fidélité</h3>
          <p>Gagne 1€ = 1 point</p>
        </div>

        <div className="card">
          <h3>🏆 Paliers</h3>
          <p>50 → 300 points</p>
        </div>
      </div>

      {/* ========================= */}
      {/* REWARDS GRID */}
      {/* ========================= */}
      <div className="rewards-grid">
        {rewards.map((r) => (
          <div key={r.id} className={`reward-card ${r.status}`}>
            <h3>
              {r.type === "COUPON_EURO" && "💶 Coupon"}
              {r.type === "PERCENT" && "📉 Réduction %"}
              {r.type === "PRODUCT_DISCOUNT" && "🎁 -50% produit"}
              {r.type === "FREE_PRODUCT" && "🆓 Produit offert"}
              {r.type === "GIFT" && "🎁 Cadeau"}
            </h3>

            <p>
              Valeur :{" "}
              <strong>
                {r.type === "COUPON_EURO" && `${r.value}€`}
                {r.type === "PERCENT" && `${r.value}%`}
                {r.type === "PRODUCT_DISCOUNT" && "-50%"}
                {r.type === "FREE_PRODUCT" && "Gratuit"}
                {r.type === "GIFT" && `${r.value}€`}
              </strong>
            </p>

            <p>Status : {r.status}</p>

            {r.status === "ACTIVE" && (
              <button
                className="btn-use"
                onClick={async () => {
                  await fetch("/api/loyalty/redeem", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rewardId: r.id }),
                  });

                  window.location.reload();
                }}
              >
                Utiliser
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}