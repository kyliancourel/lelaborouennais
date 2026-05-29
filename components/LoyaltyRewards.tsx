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
  options?: string[] | null;
};

type UserReward = {
  id: string;
  source: string | null;
  status: "ACTIVE" | "USED" | "EXPIRED";
  selectedOption?: string | null;
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  async function unlock(rule: Rule) {
    const options = Array.isArray(rule.options) ? rule.options : [];
    const selectedOption = selectedOptions[rule.id] || "";

    if (options.length > 0 && !selectedOption) {
      alert("Choisis une option avant de débloquer cette récompense.");
      return;
    }

    setLoadingId(rule.id);

    const res = await fetch("/api/loyalty/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ruleId: rule.id,
        selectedOption,
      }),
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
          const options = Array.isArray(rule.options) ? rule.options : [];

          const activeReward = userRewards.find(
            (reward) =>
              reward.source === `rule_${rule.id}` &&
              reward.status === "ACTIVE"
          );

          const alreadyUnlocked = Boolean(activeReward);
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

                <p className="reward-description">{rule.description}</p>

                {options.length > 0 && !alreadyUnlocked && (
                  <div className="reward-choice">
                    <label className="input-label">Choisis ton cadeau</label>

                    <select
                      className="input"
                      value={selectedOptions[rule.id] || ""}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          [rule.id]: e.target.value,
                        })
                      }
                      disabled={!canUnlock}
                    >
                      <option value="">Sélectionner une option</option>

                      {options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {alreadyUnlocked && activeReward?.selectedOption && (
                  <p className="text-muted mt-3">
                    Choix : <strong>{activeReward.selectedOption}</strong>
                  </p>
                )}
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
                    onClick={() => unlock(rule)}
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