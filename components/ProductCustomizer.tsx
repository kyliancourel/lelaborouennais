"use client";

import { useMemo, useState } from "react";
import AddToCart from "@/components/AddToCart";

type ColorOption = {
  name: string;
  hex: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  customizableText: boolean;
  customizationPrice: number;
  availableColors: string[];
  unavailableColors: string[];
  colorZones: string[];
};

function parseColor(value: string): ColorOption {
  const [name, hex] = value.split("|").map((part) => part.trim());

  return {
    name: name || value,
    hex: hex || "#999999",
  };
}

export default function ProductCustomizer({ product }: { product: Product }) {
  const availableColors = product.availableColors.map(parseColor);
  const unavailableColors = product.unavailableColors.map(parseColor);

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(
    availableColors[0] || null
  );

  const [selectedColors, setSelectedColors] = useState<
    Record<string, string>
  >({});

  const [customText, setCustomText] = useState("");

  const hasCustomText =
    product.customizableText && customText.trim().length > 0;

  const finalPrice = useMemo(() => {
    return hasCustomText
      ? product.price + product.customizationPrice
      : product.price;
  }, [product.price, product.customizationPrice, hasCustomText]);

  const previewColor = selectedColor?.hex || "#ffffff";

  return (
    <div className="product-customizer">
      <div
        className="product-preview-frame"
        style={{
          background: `
            radial-gradient(circle at center, ${previewColor}cc 0%, ${previewColor}88 35%, transparent 72%),
            linear-gradient(135deg, ${previewColor}55, rgba(255,255,255,0.04))
          `,
          borderColor: previewColor,
          boxShadow: `0 0 45px ${previewColor}88`,
        }}
      >
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="product-image"
        />
      </div>

      {availableColors.length > 0 && (
        <div className="product-option-block">
          <h3>Couleur(s) disponible(s)</h3>

          <div className="color-grid">
            {availableColors.map((color) => (
              <button
                key={`${color.name}-${color.hex}`}
                type="button"
                className={`color-choice ${selectedColor?.name === color.name ? "active" : ""
                  }`}
                onClick={() => setSelectedColor(color)}
              >
                <span
                  className="color-dot"
                  style={{ background: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {unavailableColors.length > 0 && (
        <div className="product-option-block">
          <h3>Couleur(s) non disponible(s)</h3>

          <div className="color-grid">
            {unavailableColors.map((color) => (
              <button
                key={`${color.name}-${color.hex}`}
                type="button"
                className="color-choice disabled"
                disabled
              >
                <span
                  className="color-dot"
                  style={{ background: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colorZones.length > 0 && (
        <div className="product-option-block">

          <h3>Personnalisation couleurs</h3>

          {product.colorZones.map((zone) => (
            <div key={zone} className="zone-selector">

              <label>{zone}</label>

              <select
                className="input"
                value={selectedColors[zone] || ""}
                onChange={(e) =>
                  setSelectedColors({
                    ...selectedColors,
                    [zone]: e.target.value,
                  })
                }
              >
                <option value="">
                  Choisir une couleur
                </option>

                {product.availableColors.map((color) => (
                  <option
                    key={color}
                    value={color}
                  >
                    {color}
                  </option>
                ))}
              </select>

            </div>
          ))}
        </div>
      )}


      {product.customizableText && (
        <div className="product-option-block">
          <h3>Texte personnalisable</h3>

          <p className="text-muted">
            Ajout d’un texte personnalisé : +{product.customizationPrice} €.
          </p>

          <input
            className="input"
            placeholder="Ex : prénom, mot court, date..."
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
          selectedColor: selectedColor?.name || undefined,
          selectedColors,
          customText: customText.trim() || undefined,
        }}
      />
    </div>
  );
}