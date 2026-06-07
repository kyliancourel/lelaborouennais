"use client";

import Link from "next/link";
import AddToCart from "@/components/AddToCart";

function hasArray(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function getPackButtonLabel(packOptions: unknown) {
  if (!Array.isArray(packOptions) || packOptions.length === 0) {
    return "Personnaliser";
  }

  const first = packOptions[0];

  const label =
    typeof first === "string"
      ? first
      : typeof first === "object" && first !== null && "label" in first
        ? String(first.label)
        : "";

  if (label.toLowerCase().includes("pack")) {
    return "Choisir son pack";
  }

  return "Choisir son set";
}

export default function ProductCard({ product }: any) {
  const hasPacks = hasArray(product.packOptions);

  const mustCustomize =
    Boolean(product.customizableText) ||
    hasArray(product.colorZones) ||
    hasPacks;

  return (
    <div className="product-card">
      <div className="product-card-glow" />

      <Link href={`/products/${product.slug}`} className="product-card-link">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
          />
        )}

        <h3 className="product-card-title">{product.name}</h3>

        <p className="product-card-price">
          {hasPacks
            ? `À partir de ${Number(product.price).toFixed(2)} €`
            : `${Number(product.price).toFixed(2)} €`}
        </p>
      </Link>
      {!product.inStock ? (
        <button className="add-to-cart-btn btn-disabled" disabled>
          Rupture de stock
        </button>
      ) : mustCustomize ? (
        <Link
          href={`/products/${product.slug}`}
          className="add-to-cart-btn product-customize-link"
        >
          {hasPacks ? getPackButtonLabel(product.packOptions) : "Personnaliser"}
        </Link>
      ) : (
        <AddToCart
          product={{
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image ?? undefined,
          }}
        />
      )}
    </div>
  );
}