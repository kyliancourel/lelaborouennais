"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = typeof params?.id === "string" ? params.id : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError("Erreur chargement produit");
        return;
      }

      setForm(data);
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Erreur update");
      return;
    }

    router.push("/admin/products");
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Supprimer ?")) return;

    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    router.push("/admin/products");
  };

  if (!id) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Modifier produit</h1>

      <form onSubmit={handleUpdate}>
        <input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value })
          }
        />

        <input
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />

        <button disabled={loading}>
          {loading ? "..." : "Update"}
        </button>
      </form>

      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}