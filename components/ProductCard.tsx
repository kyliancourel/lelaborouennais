"use client";

import Link from "next/link";
import AddToCart from "@/components/AddToCart";

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

      <AddToCart
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image ?? undefined,
        }}
      />
    </div>
  );
}