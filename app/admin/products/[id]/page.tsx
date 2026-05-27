"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        })
      );
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);
    router.push("/admin/products");
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Supprimer ce produit ?");
    if (!confirmDelete) return;

    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    router.push("/admin/products");
  };

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
            placeholder="Prix"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />

          <input
            className="input"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Mise à jour..." : "Modifier"}
          </button>
        </form>

        <button className="btn btn-danger mt-3" onClick={handleDelete}>
          Supprimer le produit
        </button>
      </div>
    </div>
  );
}