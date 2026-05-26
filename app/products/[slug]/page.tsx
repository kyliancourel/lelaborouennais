import { prisma } from "@/lib/prisma";
import AddToCart from "@/components/AddToCart";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) return notFound();

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return (
      <div className="empty-product">
        <div className="empty-product-content">
          <div className="empty-product-icon">📦</div>

          <h1 className="empty-product-title">
            Produit introuvable
          </h1>

          <p className="empty-product-text">
            Ce produit n'existe plus ou a été supprimé.
          </p>

          <Link href="/products" className="btn btn-primary">
            Retour boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-grid">
        <div>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          )}
        </div>

        <div>
          <h1 className="product-title">{product.name}</h1>

          <p className="product-description">
            {product.description}
          </p>

          <h2 className="product-price">
            {product.price}€
          </h2>

          <p className="product-stock">
            En stock {product.stock}
          </p>

          <AddToCart
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image ?? undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}