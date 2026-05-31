"use client";

import Link from "next/link";

export default function ProductCard({ product }: any) {
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

        <p className="product-card-price">{product.price}€</p>
      </Link>

      <Link href={`/products/${product.slug}`} className="add-to-cart-btn product-customize-link">
        Personnaliser
      </Link>
    </div>
  );
}