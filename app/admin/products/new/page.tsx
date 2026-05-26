"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/admin/products");
  };

  return (
    <div>
      <h1>Créer produit</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom" onChange={handleChange} />
        <input name="slug" placeholder="Slug" onChange={handleChange} />
        <input name="price" type="number" placeholder="Prix" onChange={handleChange} />
        <input name="image" placeholder="Image URL" onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />

        <button type="submit">Créer</button>
      </form>
    </div>
  );
}