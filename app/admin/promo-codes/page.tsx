"use client";

import { useEffect, useState } from "react";

type PromoCode = {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  usages: unknown[];
};

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENT");
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadPromoCodes() {
    const res = await fetch("/api/admin/promo-codes", {
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();
    setPromoCodes(data.promoCodes || []);
  }

  useEffect(() => {
    loadPromoCodes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        type,
        value,
        isActive,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erreur création code promo");
      return;
    }

    setCode("");
    setValue("");
    setType("PERCENT");
    setIsActive(true);

    loadPromoCodes();
  }

  async function togglePromo(promo: PromoCode) {
    await fetch(`/api/admin/promo-codes/${promo.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !promo.isActive,
      }),
    });

    loadPromoCodes();
  }

  async function deletePromo(id: string) {
    const ok = confirm("Supprimer ce code promo ?");
    if (!ok) return;

    await fetch(`/api/admin/promo-codes/${id}`, {
      method: "DELETE",
    });

    loadPromoCodes();
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Codes promo</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Code promo ex: PROMO10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="PERCENT">Pourcentage (%)</option>
            <option value="EURO">Montant fixe (€)</option>
          </select>

          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Valeur"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <label className="radio-row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Code actif
          </label>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer le code promo"}
          </button>
        </form>
      </div>

      <div className="orders-list mt-3">
        {promoCodes.map((promo) => (
          <div key={promo.id} className="order-card">
            <div className="card-row">
              <div>
                <h3>{promo.code}</h3>

                <p className="text-muted">
                  {promo.type === "PERCENT"
                    ? `${promo.value}% de réduction`
                    : `${Number(promo.value).toFixed(2)} € de réduction`}
                </p>

                <p className="text-muted">
                  Utilisations : {promo.usages.length}
                </p>

                <p>
                  Statut :{" "}
                  <strong>{promo.isActive ? "Actif" : "Inactif"}</strong>
                </p>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => togglePromo(promo)}
                >
                  {promo.isActive ? "Désactiver" : "Activer"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deletePromo(promo.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}