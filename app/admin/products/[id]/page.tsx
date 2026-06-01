"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { is } from "zod/locales";

function arrayToText(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .filter((item): item is string => typeof item === "string")
    .join("\n");
}

function textToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    customizableText: false,
    customizationPrice: 0,
    availableColorsText: "",
    unavailableColorsText: "",
    colorZonesText: "",
    isArchived: false,
  });

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) =>
        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          price: data.price ?? 0,
          image: data.image ?? "",
          category: data.category ?? "",
          customizableText: Boolean(data.customizableText),
          customizationPrice: data.customizationPrice ?? 0,
          availableColorsText: arrayToText(data.availableColors),
          unavailableColorsText: arrayToText(data.unavailableColors),
          colorZonesText: arrayToText(data.colorZones),
          isArchived: Boolean(data.isArchived),
        })
      );
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        category: form.category,
        customizableText: form.customizableText,
        customizationPrice: Number(form.customizationPrice),
        availableColors: textToArray(form.availableColorsText),
        unavailableColors: textToArray(form.unavailableColorsText),
        colorZones: textToArray(form.colorZonesText),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert("Erreur: " + (err.error || "Modification impossible"));
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    const confirmDelete = confirm("Supprimer ce produit ?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Erreur: " + (err.error || "Suppression impossible"));
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Modifier produit</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleUpdate}>
          <input
            className="input"
            placeholder="Nom du produit"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Description"
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
                price: Number(e.target.value) })
            }
          />

          <input
            className="input"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <input
            className="input"
            placeholder="Catégorie"
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
            placeholder="Couleurs disponibles, une par ligne : Noir|#111111"
            value={form.availableColorsText}
            onChange={(e) =>
              setForm({ ...form, availableColorsText: e.target.value })
            }
          />

          <textarea
            className="input"
            placeholder="Couleurs non disponibles, une par ligne : Rouge|#ef4444"
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
            {loading ? "Mise à jour..." : "Modifier"}
          </button>
        </form>
        <button
          className="btn btn-outline mt-3"
          onClick={async () => {
            const res = await fetch(`/api/products/${id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                isArchived: !form.isArchived,
              }),
            });

            if (!res.ok) {
              const err = await res.json();
              alert(err.error || "Erreur");
              return;
            }

            router.refresh();
            window.location.reload();
          }}
        >
          {form.isArchived
            ? "Restaurer le produit"
            : "Archiver le produit"}
        </button>

        <button className="btn btn-danger mt-3" onClick={handleDelete}>
          Supprimer le produit
        </button>
      </div>
    </div>
  );
}