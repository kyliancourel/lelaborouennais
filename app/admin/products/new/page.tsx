"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert("Erreur: " + err.error);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Créer un produit</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            name="name"
            placeholder="Nom du produit"
            onChange={handleChange}
          />

          <input
            className="input"
            name="slug"
            placeholder="Slug (ex: vase-3d)"
            onChange={handleChange}
          />

          <textarea
            className="input"
            name="description"
            placeholder="Description du produit"
            onChange={handleChange}
          />

          <input
            className="input"
            name="price"
            placeholder="Prix (€)"
            onChange={handleChange}
          />

          <input
            className="input"
            name="image"
            placeholder="URL image"
            onChange={handleChange}
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer le produit"}
          </button>
        </form>
      </div>
    </div>
  );
}