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
  usedAt?: Date | string | null;
};

type Props = {
  userPoints: number;
  rules: Rule[];
  userRewards: UserReward[];
};

function getNextAvailableDate(usedAt: Date | string) {
  const date = new Date(usedAt);
  date.setMonth(date.getMonth() + 1);
  return date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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

    const data = await res.json();
    setLoadingId(null);

    if (!res.ok) {
      if (data.nextAvailableAt) {
        alert(
          `Cette récompense sera disponible à nouveau le ${formatDate(
            new Date(data.nextAvailableAt)
          )}.`
        );
        return;
      }

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
          const source = `rule_${rule.id}`;
          const options = Array.isArray(rule.options) ? rule.options : [];

          const activeReward = userRewards.find(
            (reward) => reward.source === source && reward.status === "ACTIVE"
          );

          const lastUsedReward = userRewards.find(
            (reward) => reward.source === source && reward.status === "USED" && reward.usedAt
          );

          const nextAvailableAt = lastUsedReward?.usedAt
            ? getNextAvailableDate(lastUsedReward.usedAt)
            : null;

          const isCooldown =
            nextAvailableAt !== null && nextAvailableAt.getTime() > Date.now();

          const alreadyUnlocked = Boolean(activeReward);

          const canUnlock =
            userPoints >= rule.pointsCost && !alreadyUnlocked && !isCooldown;

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

                {options.length > 0 && !alreadyUnlocked && !isCooldown && (
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

                {isCooldown && nextAvailableAt && (
                  <p className="text-muted mt-3">
                    Disponible à nouveau le{" "}
                    <strong>{formatDate(nextAvailableAt)}</strong>
                  </p>
                )}
              </div>

              <div className="reward-footer">
                <span>{rule.pointsCost} pts</span>

                {alreadyUnlocked ? (
                  <button className="btn btn-primary" disabled>
                    Disponible
                  </button>
                ) : isCooldown && nextAvailableAt ? (
                  <button className="btn btn-outline" disabled>
                    {formatDate(nextAvailableAt)}
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