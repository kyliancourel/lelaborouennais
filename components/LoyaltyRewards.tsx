"use client";

import { useState } from "react";

type Rule = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  pointsCost: number;
  type: string;
  value: number | null;
};

type UserReward = {
  id: string;
  source: string | null;
  status: "ACTIVE" | "USED" | "EXPIRED";
};

type Props = {
  userPoints: number;
  rules: Rule[];
  userRewards: UserReward[];
};

export default function LoyaltyRewards({
  userPoints,
  rules,
  userRewards,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function unlock(ruleId: string) {
    setLoadingId(ruleId);

    const res = await fetch("/api/loyalty/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId }),
    });

    setLoadingId(null);

    if (!res.ok) {
      alert("Impossible de débloquer cette récompense.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="loyalty-rewards">
      <div className="loyalty-section-header">
        <h2>Récompenses</h2>
        <p>Débloque des avantages avec tes points.</p>
      </div>

      <div className="loyalty-reward-grid">
        {rules.map((rule) => {
          const alreadyUnlocked = userRewards.some(
            (r) => r.source === `rule_${rule.id}` && r.status === "ACTIVE"
          );

          const canUnlock = userPoints >= rule.pointsCost && !alreadyUnlocked;

          return (
            <div
              key={rule.id}
              className={`loyalty-reward-card ${
                canUnlock || alreadyUnlocked ? "unlocked" : "locked"
              }`}
            >
              <div className="reward-icon">{rule.icon || "🎁"}</div>

              <div>
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>

              <div className="reward-footer">
                <span>{rule.pointsCost} pts</span>

                {alreadyUnlocked ? (
                  <button className="btn btn-primary" disabled>
                    Disponible
                  </button>
                ) : canUnlock ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => unlock(rule.id)}
                    disabled={loadingId === rule.id}
                  >
                    {loadingId === rule.id ? "Déblocage..." : "Débloquer"}
                  </button>
                ) : (
                  <button className="btn btn-outline" disabled>
                    Verrouillé
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}