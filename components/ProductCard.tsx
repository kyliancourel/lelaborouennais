"use client";

import Link from "next/link";
import AddToCart from "@/components/AddToCart";

function hasColorZones(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

export default function ProductCard({ product }: any) {
  const mustCustomize =
    Boolean(product.customizableText) || hasColorZones(product.colorZones);

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
          {Number(product.price).toFixed(2)} €
        </p>
      </Link>

      {mustCustomize ? (
        <Link
          href={`/products/${product.slug}`}
          className="add-to-cart-btn product-customize-link"
        >
          Personnaliser
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