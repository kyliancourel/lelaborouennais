"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function textToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    image: "",
    category: "",
    customizableText: false,
    customizationPrice: 4,
    availableColorsText: "",
    unavailableColorsText: "",
    colorZonesText: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        category: form.category,
        customizableText: form.customizableText,
        customizationPrice: Number(form.customizationPrice || 4),
        availableColors: textToArray(form.availableColorsText),
        unavailableColors: textToArray(form.unavailableColorsText),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert("Erreur: " + (err.error || "Création impossible"));
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Créer un produit</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Nom du produit"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Slug (ex: vase-3d)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Description du produit"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Prix"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="URL image"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <input
            className="input"
            placeholder="Catégorie (ex: Bureau, Décoration...)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <label className="radio-row">
            <input
              type="checkbox"
              checked={form.customizableText}
              onChange={(e) =>
                setForm({ ...form, customizableText: e.target.checked })
              }
            />
            Option texte personnalisable
          </label>

          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Prix option personnalisation"
            value={form.customizationPrice}
            onChange={(e) =>
              setForm({
                ...form,
                customizationPrice: Number(e.target.value),
              })
            }
          />

          <textarea
            className="input"
            placeholder={`Couleurs disponibles, une par ligne :
              Noir|#111111
              Blanc de Jade|#dfeee6
              Bleu Glacier|#9bdaf2`}
            value={form.availableColorsText}
            onChange={(e) =>
              setForm({ ...form, availableColorsText: e.target.value })
            }
          />

          <textarea
            className="input"
            placeholder={`Couleurs non disponibles, une par ligne :
              Rouge|#ef4444
              Vert|#22c55e`}
            value={form.unavailableColorsText}
            onChange={(e) =>
              setForm({ ...form, unavailableColorsText: e.target.value })
            }
          />

          <textarea
            className="input"
            placeholder={`Zones personnalisables :

Base
Texte
Logo
Bordure`}
            value={form.colorZonesText}
            onChange={(e) =>
              setForm({
                ...form,
                colorZonesText: e.target.value,
              })
            }
          />



          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer le produit"}
          </button>
        </form>
      </div>
    </div>
  );
}