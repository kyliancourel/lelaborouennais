"use client";

import { useEffect, useState } from "react";

type Reward = {
  id: string;
  type: string;
  value: number | null;
  status: "ACTIVE" | "USED" | "EXPIRED";
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/rewards");
    const data = await res.json();

    setRewards(data.rewards || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function redeem(id: string) {
    await fetch("/api/loyalty/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rewardId: id,
      }),
    });

    load();
  }

  if (loading) {
    return (
      <div className="rewards-page">
        Chargement...
      </div>
    );
  }

  return (
    <div className="rewards-page">
      <h1 className="page-title">
        Récompenses
      </h1>

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`card reward-card ${reward.status}`}
          >
            <h3>{reward.type}</h3>

            <p>
              Valeur : {reward.value}
            </p>

            <p>
              Statut : {reward.status}
            </p>

            {reward.status === "ACTIVE" && (
              <button
                className="btn btn-primary"
                onClick={() =>
                  redeem(reward.id)
                }
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