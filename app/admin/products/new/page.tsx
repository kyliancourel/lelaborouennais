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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    router.push("/admin/products");
  };

  return (
    <div className="admin-main">
      <h1 className="admin-title">Créer un produit</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input className="input" name="name" placeholder="Nom" onChange={handleChange} />
        <input className="input" name="slug" placeholder="Slug" onChange={handleChange} />
        <input className="input" name="price" type="number" placeholder="Prix" onChange={handleChange} />
        <input className="input" name="image" placeholder="Image URL" onChange={handleChange} />

        <textarea
          className="input"
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        <button className="btn btn-primary" type="submit">
          Créer
        </button>
      </form>
    </div>
  );
}