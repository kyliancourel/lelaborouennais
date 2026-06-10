import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string | null;
  isArchived: boolean;
  inStock: boolean;
  customizableText: boolean;
  colorZones: unknown;
  packOptions: unknown;
};

function isArrayWithItems(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

export default async function AdminProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeProducts = products.filter((p) => !p.isArchived).length;
  const archivedProducts = products.filter((p) => p.isArchived).length;
  const outOfStockProducts = products.filter((p) => !p.inStock).length;

  return (
    <div className="admin-page admin-products-page">
      <div className="admin-products-hero">
        <div>
          <p className="admin-eyebrow">Catalogue</p>
          <h1 className="admin-title">Produits</h1>
          <p className="admin-subtitle">
            Gérez vos produits, stocks, personnalisations et packs.
          </p>
        </div>

        <Link href="/admin/products/new" className="btn btn-primary">
          + Ajouter produit
        </Link>
      </div>

      <div className="admin-products-stats">
        <div className="admin-stat-card">
          <span>Total</span>
          <strong>{products.length}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Actifs</span>
          <strong>{activeProducts}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Archivés</span>
          <strong>{archivedProducts}</strong>
        </div>

        <div className="admin-stat-card danger">
          <span>Rupture</span>
          <strong>{outOfStockProducts}</strong>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty admin-products-empty">
          Aucun produit pour le moment.
        </div>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => {
            const hasColors = isArrayWithItems(product.colorZones);
            const hasPacks = isArrayWithItems(product.packOptions);

            return (
              <article
                key={product.id}
                className={`admin-product-card ${
                  product.isArchived ? "is-archived" : ""
                }`}
              >
                <div className="admin-product-image-wrap">
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    className="admin-product-image"
                  />

                  <span
                    className={
                      product.isArchived
                        ? "status-badge status-cancelled"
                        : product.inStock
                          ? "status-badge status-paid"
                          : "status-badge status-pending"
                    }
                  >
                    {product.isArchived
                      ? "Archivé"
                      : product.inStock
                        ? "Actif"
                        : "Rupture"}
                  </span>
                </div>

                <div className="admin-product-content">
                  {product.category && (
                    <span className="admin-product-category">
                      {product.category}
                    </span>
                  )}

                  <h2>{product.name}</h2>

                  <p className="admin-product-slug">/{product.slug}</p>

                  <div className="admin-product-meta">
                    <span>{Number(product.price).toFixed(2)} €</span>

                    {product.customizableText && <small>Texte</small>}
                    {hasColors && <small>Couleurs</small>}
                    {hasPacks && <small>Sets/Packs</small>}
                  </div>

                  <Link
                    className="btn btn-outline admin-product-action"
                    href={`/admin/products/${product.id}`}
                  >
                    {product.isArchived ? "Restaurer / Modifier" : "Modifier"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}