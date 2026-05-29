"use client";

import { useEffect, useState } from "react";

type Rule = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  pointsCost: number;
  type: string;
  value: number | null;
  options: string[] | null;
  isActive: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  icon: "🎁",
  pointsCost: 50,
  type: "COUPON_EURO",
  value: 5,
  optionsText: "",
  isActive: true,
};

export default function AdminLoyaltyPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [stats, setStats] = useState({ users: 0, totalPoints: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const res = await fetch("/api/admin/reward-rules");
    const data = await res.json();

    setRules(data.rules || []);
    setStats(data.stats || { users: 0, totalPoints: 0 });
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(rule: Rule) {
    setEditingId(rule.id);

    setForm({
      title: rule.title,
      description: rule.description,
      icon: rule.icon || "🎁",
      pointsCost: rule.pointsCost,
      type: rule.type,
      value: rule.value ?? 0,
      optionsText: Array.isArray(rule.options) ? rule.options.join("\n") : "",
      isActive: rule.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitRule(e: React.FormEvent) {
    e.preventDefault();

    const url = editingId
      ? `/api/admin/reward-rules/${editingId}`
      : "/api/admin/reward-rules";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert(
        editingId
          ? "Erreur lors de la modification de la récompense"
          : "Erreur lors de la création de la récompense"
      );
      return;
    }

    resetForm();
    await load();
  }

  async function deleteRule(id: string) {
    const confirmed = confirm("Supprimer cette récompense ?");

    if (!confirmed) return;

    const res = await fetch(`/api/admin/reward-rules/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur lors de la suppression");
      return;
    }

    await load();
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Programme fidélité</h1>

      <div className="admin-grid">
        <div className="card">
          <p>Clients</p>
          <h2>{stats.users}</h2>
        </div>

        <div className="card">
          <p>Points en circulation</p>
          <h2>{stats.totalPoints}</h2>
        </div>

        <div className="card">
          <p>Récompenses configurées</p>
          <h2>{rules.length}</h2>
        </div>
      </div>

      <form className="card form mt-3" onSubmit={submitRule}>
        <h2>{editingId ? "Modifier la récompense" : "Créer une récompense"}</h2>

        <input
          className="input"
          placeholder="Titre ex: Produit exclusif Silver"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="input"
          placeholder="Description"
          value={form.description}
          rows={5}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="input"
          placeholder="Icône"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />

        <input
          className="input"
          type="number"
          placeholder="Coût en points"
          value={form.pointsCost}
          onChange={(e) =>
            setForm({ ...form, pointsCost: Number(e.target.value) })
          }
        />

        <select
          className="input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="COUPON_EURO">Coupon €</option>
          <option value="PERCENT">Pourcentage</option>
          <option value="PRODUCT_DISCOUNT">Réduction produit</option>
          <option value="FREE_PRODUCT">Produit offert</option>
          <option value="GIFT">Cadeau</option>
        </select>

        <input
          className="input"
          type="number"
          placeholder="Valeur"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        />

        <textarea
          className="input"
          placeholder={`Options au choix, une par ligne :
Support téléphone premium
Organiseur de bureau 3 compartiments
Support casque compact`}
          value={form.optionsText}
          rows={5}
          onChange={(e) => setForm({ ...form, optionsText: e.target.value })}
        />

        <button className="btn btn-primary" type="submit">
          {editingId ? "Enregistrer les modifications" : "Ajouter"}
        </button>

        {editingId && (
          <button
            className="btn btn-outline"
            type="button"
            onClick={resetForm}
          >
            Annuler
          </button>
        )}
      </form>

      <div className="admin-grid mt-3">
        {rules.map((rule) => (
          <div key={rule.id} className="card">
            <h3>
              {rule.icon} {rule.title}
            </h3>

            <p className="reward-description">{rule.description}</p>

            <p>{rule.pointsCost} points</p>
            <p>Type : {rule.type}</p>
            <p>Valeur : {rule.value ?? "—"}</p>

            {Array.isArray(rule.options) && rule.options.length > 0 && (
              <div className="mt-3">
                <strong>Choix proposés :</strong>

                <ul className="text-muted mt-3">
                  {rule.options.map((option) => (
                    <li key={option}>• {option}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card-actions mt-3">
              <button
                className="btn btn-outline"
                onClick={() => startEdit(rule)}
              >
                Modifier
              </button>

              <button
                className="btn btn-danger"
                onClick={() => deleteRule(rule.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}