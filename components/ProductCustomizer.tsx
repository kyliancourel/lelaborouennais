"use client";

import { useMemo, useState } from "react";
import AddToCart from "@/components/AddToCart";

type ColorOption = {
  name: string;
  hex: string;
};

type PackOption = {
  label: string;
  price: number;
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
  packOptions: PackOption[];
  inStock: boolean;
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

  const hasColorZones = product.colorZones.length > 0;

  const [selectedPack, setSelectedPack] = useState<PackOption | null>(
    product.packOptions[0] || null
  );

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(
    availableColors[0] || null
  );

  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(
    {}
  );

  const [customText, setCustomText] = useState("");

  const hasCustomText =
    product.customizableText && customText.trim().length > 0;

  const allColorZonesSelected =
    !hasColorZones || product.colorZones.every((zone) => selectedColors[zone]);

  const canAddToCart =
    product.inStock &&
    (!product.customizableText || hasCustomText) &&
    allColorZonesSelected;

  const disabledMessage =
    product.customizableText && !hasCustomText
      ? "Ajoute un texte personnalisé avant d'ajouter au panier."
      : "Choisis toutes les couleurs avant d'ajouter au panier.";

  const basePrice = selectedPack ? selectedPack.price : product.price;

  const finalPrice = useMemo(() => {
    return hasCustomText
      ? basePrice + product.customizationPrice
      : basePrice;
  }, [basePrice, product.customizationPrice, hasCustomText]);

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

      {product.packOptions.length > 0 && (
        <div className="product-option-block">
          <h3>Choisir un set</h3>

          <div className="color-grid">
            {product.packOptions.map((pack) => (
              <button
                key={pack.label}
                type="button"
                className={`color-choice ${selectedPack?.label === pack.label ? "active" : ""
                  }`}
                onClick={() => setSelectedPack(pack)}
              >
                {pack.label} — {Number(pack.price).toFixed(2)} €
              </button>
            ))}
          </div>
        </div>
      )}

      {availableColors.length > 0 && !hasColorZones && (
        <div className="product-option-block">
          <h4 className="color-section-title">
            Couleur(s) disponible(s)
          </h4>

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
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasColorZones && (
        <div className="product-option-block">
          <h3>Personnalisation des couleurs</h3>

          {product.colorZones.map((zone) => (
            <div key={zone} className="zone-selector">
              <label className="input-label">{zone}</label>

              <div className="color-grid">
                {availableColors.map((color) => (
                  <button
                    key={`${zone}-${color.name}`}
                    type="button"
                    className={`color-choice ${selectedColors[zone] === color.name ? "active" : ""
                      }`}
                    onClick={() => {
                      setSelectedColors({
                        ...selectedColors,
                        [zone]: color.name,
                      });

                      setSelectedColor(color);
                    }}
                  >
                    <span
                      className="color-dot"
                      style={{ background: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>

              {unavailableColors.length > 0 && (
                <div className="color-grid mt-2">
                  {unavailableColors.map((color) => (
                    <button
                      key={`${zone}-${color.name}-${color.hex}-disabled`}
                      type="button"
                      className="color-choice disabled"
                      disabled
                    >
                      <span
                        className="color-dot"
                        style={{ background: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {unavailableColors.length > 0 && !hasColorZones && (
        <div className="product-option-block">
          <h4 className="color-section-title unavailable">
            Couleur(s) indisponible(s)
          </h4>

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
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {product.customizableText && (
        <div className="product-option-block">
          <h3>Texte personnalisable</h3>

          <p className="text-muted">
            {product.customizationPrice > 0
              ? `Ajout d’un texte personnalisé : +${product.customizationPrice.toFixed(
                2
              )} €.`
              : "Texte personnalisé inclus dans le prix."}
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
        <strong>{Number(finalPrice).toFixed(2)} €</strong>
      </div>

      {!canAddToCart && (
        <p className="auth-error">
          Personnalisation obligatoire avant ajout au panier.
        </p>
      )}

      <AddToCart
        disabled={!canAddToCart}
        disabledMessage={
          !product.inStock
            ? "Ce produit est actuellement en rupture de stock."
            : disabledMessage
        }
        label={!product.inStock ? "Rupture de stock" : "Ajouter au panier"}
        product={{
          id: product.id,
          name: product.name,
          price: finalPrice,
          image: product.image,
          selectedColor: !hasColorZones ? selectedColor?.name : undefined,
          selectedColors: hasColorZones ? selectedColors : undefined,
          customText: customText.trim() || undefined,
          packLabel: selectedPack?.label,
        }}
      />
    </div>
  );
}