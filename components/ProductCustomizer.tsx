"use client";

import { useMemo, useState } from "react";
import AddToCart from "@/components/AddToCart";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  customizableText: boolean;
  customizationPrice: number;
  availableColors: string[];
  unavailableColors: string[];
};

const colorMap: Record<string, string> = {
  Noir: "#111111",
  Blanc: "#f8fafc",
  Rouge: "#ef4444",
  Bleu: "#3b82f6",
  Vert: "#22c55e",
  Jaune: "#eab308",
  Orange: "#f97316",
  Rose: "#ec4899",
  Violet: "#8b5cf6",
  Gris: "#6b7280",
  Marron: "#92400e",
  Beige: "#d6b98c",
  "Bleu Glacier": "#9bdaf2",
};

export default function ProductCustomizer({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(
    product.availableColors[0] || ""
  );

  const [customText, setCustomText] = useState("");

  const finalPrice = useMemo(() => {
    return product.customizableText && customText.trim()
      ? product.price + product.customizationPrice
      : product.price;
  }, [product, customText]);

  const previewColor = colorMap[selectedColor] || "#1f2937";

  return (
    <div className="product-customizer">
      <div
        className="product-preview-frame"
        style={{
          background: `radial-gradient(circle, ${previewColor}55, transparent 62%)`,
          borderColor: `${previewColor}88`,
        }}
      >
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="product-image"
        />
      </div>

      {product.availableColors.length > 0 && (
        <div className="product-option-block">
          <h3>Couleur</h3>

          <div className="color-grid">
            {product.availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-choice ${
                  selectedColor === color ? "active" : ""
                }`}
                onClick={() => setSelectedColor(color)}
              >
                <span
                  className="color-dot"
                  style={{ background: colorMap[color] || "#999" }}
                />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.unavailableColors.length > 0 && (
        <div className="product-option-block">
          <h3>Couleurs indisponibles</h3>

          <div className="color-grid">
            {product.unavailableColors.map((color) => (
              <button key={color} type="button" className="color-choice disabled" disabled>
                <span
                  className="color-dot"
                  style={{ background: colorMap[color] || "#999" }}
                />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.customizableText && (
        <div className="product-option-block">
          <h3>Texte personnalisé</h3>

          <p className="text-muted">
            Ajoute un texte personnalisé pour +{product.customizationPrice} €.
          </p>

          <input
            className="input"
            placeholder="Ex : Kylian, Le Labo..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={40}
          />
        </div>
      )}

      <div className="product-final-price">
        <span>Prix final</span>
        <strong>{finalPrice} €</strong>
      </div>

      <AddToCart
        product={{
          id: product.id,
          name: product.name,
          price: finalPrice,
          image: product.image,
          selectedColor,
          customText: customText.trim() || undefined,
        }}
      />
    </div>
  );
}