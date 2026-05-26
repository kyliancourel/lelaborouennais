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
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur création produit");
      return;
    }

    router.push("/admin/products");
  };

  return (
    <div className="admin-main">
      <h1 className="admin-title">Créer un produit</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input className="input" name="name" placeholder="Nom" onChange={handleChange} />
        <input className="input" name="slug" placeholder="Slug (unique)" onChange={handleChange} />
        <input className="input" name="price" type="number" placeholder="Prix" onChange={handleChange} />
        <input className="input" name="image" placeholder="Image URL" onChange={handleChange} />

        <textarea
          className="input"
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
}