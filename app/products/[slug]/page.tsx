import { prisma } from "@/lib/prisma";
import AddToCart from "@/components/AddToCart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return (
      <div className="empty-state">
        <h1 className="empty-title">Produit introuvable</h1>

        <p className="empty-subtitle">
          Ce produit n'existe plus ou a été supprimé.
        </p>

        <div className="empty-state-action">
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
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="product-image"
          />
        </div>

        <div>
          <h1>{product.name}</h1>

          {product.description && <p>{product.description}</p>}

          <h2>{product.price} €</h2>

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