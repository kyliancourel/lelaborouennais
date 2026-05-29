type Props = {
    points: number;
  };
  
  const tiers = [
    { name: "BRONZE", min: 0 },
    { name: "SILVER", min: 75 },
    { name: "GOLD", min: 150 },
    { name: "VIP", min: 250 },
  ];
  
  function getCurrentTier(points: number) {
    if (points >= 250) return "VIP";
    if (points >= 150) return "GOLD";
    if (points >= 75) return "SILVER";
    return "BRONZE";
  }
  
  function getNextGoal(points: number) {
    if (points < 75) return { label: "SILVER", value: 75 };
    if (points < 150) return { label: "GOLD", value: 150 };
    if (points < 250) return { label: "VIP", value: 250 };
    return { label: "VIP", value: 250 };
  }
  
  export default function LoyaltyWallet({ points }: Props) {
    const tier = getCurrentTier(points);
    const next = getNextGoal(points);
  
    const progress =
      next.value === 250 && points >= 250
        ? 100
        : Math.min(100, Math.round((points / next.value) * 100));
  
    const remaining = Math.max(0, next.value - points);
  
    return (
      <div className="loyalty-wallet">
        <div className="loyalty-wallet-header">
          <div>
            <p className="loyalty-label">Programme fidélité</p>
            <h1>{points} points</h1>
          </div>
  
          <span className={`tier-badge tier-${tier.toLowerCase()}`}>
            {tier}
          </span>
        </div>
  
        <div className="loyalty-progress">
          <div
            className="loyalty-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
  
        <div className="loyalty-progress-text">
          {tier === "VIP" ? (
            <span>Tu as atteint le niveau VIP 🎉</span>
          ) : (
            <span>
              Encore <strong>{remaining} points</strong> pour atteindre{" "}
              <strong>{next.label}</strong>
            </span>
          )}
        </div>
  
        <div className="loyalty-tier-row">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`tier-dot ${points >= t.min ? "active" : ""}`}
            >
              <span>{t.name}</span>
              <small>{t.min} pts</small>
            </div>
          ))}
        </div>
      </div>
    );
  }