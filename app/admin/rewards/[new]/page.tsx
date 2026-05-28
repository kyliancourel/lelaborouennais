"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRewardPage() {
  const router = useRouter();

  const [type, setType] = useState("COUPON_EURO");
  const [value, setValue] = useState(10);
  const [threshold, setThreshold] = useState(50);

  async function createReward() {
    await fetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value, threshold }),
    });

    router.push("/admin/rewards");
  }

  return (
    <div className="p-10">
      <h1>Créer reward</h1>

      <select onChange={(e) => setType(e.target.value)}>
        <option value="COUPON_EURO">Coupon €</option>
        <option value="PERCENT">%</option>
        <option value="FREE_PRODUCT">Produit gratuit</option>
      </select>

      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        placeholder="Valeur"
      />

      <input
        type="number"
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        placeholder="Seuil points"
      />

      <button onClick={createReward}>
        Créer
      </button>
    </div>
  );
}