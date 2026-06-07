"use client";

import { useEffect, useState } from "react";

type ColorOption = {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
  inStock: boolean;
};

export default function AdminColorsPage() {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#111111");
  const [isActive, setIsActive] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadColors() {
    const res = await fetch("/api/admin/colors", {
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();
    setColors(data.colors || []);
  }

  useEffect(() => {
    loadColors();
  }, []);

  async function createColor(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/admin/colors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        hex,
        isActive,
        inStock,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erreur création couleur");
      return;
    }

    setName("");
    setHex("#111111");
    setIsActive(true);
    setInStock(true);

    loadColors();
  }

  async function updateColor(color: ColorOption, patch: Partial<ColorOption>) {
    await fetch(`/api/admin/colors/${color.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...color,
        ...patch,
      }),
    });

    loadColors();
  }

  async function deleteColor(id: string) {
    const ok = confirm("Supprimer cette couleur ?");
    if (!ok) return;

    await fetch(`/api/admin/colors/${id}`, {
      method: "DELETE",
    });

    loadColors();
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Couleurs globales</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={createColor}>
          <input
            className="input"
            placeholder="Nom de la couleur ex: Noir"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
          />

          <label className="radio-row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Couleur active
          </label>

          <label className="radio-row">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            Couleur en stock
          </label>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Ajouter la couleur"}
          </button>
        </form>
      </div>

      <div className="orders-list mt-3">
        {colors.map((color) => (
          <div key={color.id} className="order-card">
            <div className="card-row">
              <div>
                <h3>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: color.hex,
                      marginRight: 8,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  />
                  {color.name}
                </h3>

                <p className="text-muted">{color.hex}</p>

                <p>
                  Statut :{" "}
                  <strong>
                    {color.isActive ? "Active" : "Masquée"} /{" "}
                    {color.inStock ? "En stock" : "Indisponible"}
                  </strong>
                </p>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    updateColor(color, { inStock: !color.inStock })
                  }
                >
                  {color.inStock ? "Mettre indisponible" : "Remettre en stock"}
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() =>
                    updateColor(color, { isActive: !color.isActive })
                  }
                >
                  {color.isActive ? "Masquer" : "Afficher"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteColor(color.id)}
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