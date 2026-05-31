import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  price: number;
  isArchived: boolean;
};

export default async function AdminProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Produits</h1>

        <a href="/admin/products/new" className="btn btn-primary">
          + Ajouter produit
        </a>
      </div>

      <div className="card-list">
        {products.length === 0 ? (
          <div className="admin-empty">
            Aucun produit pour le moment
          </div>
        ) : (
          products.map((p: Product) => (
            <div className="card-row" key={p.id}>
              <div className="card-info">
                <strong className="card-title">{p.name}</strong>

                <span className="card-subtitle">
                  {p.price} €
                </span>

                <span
                  className={
                    p.isArchived
                      ? "status-badge status-cancelled"
                      : "status-badge status-paid"
                  }
                >
                  {p.isArchived ? "Archivé" : "Actif"}
                </span>
              </div>

              <div className="card-actions">
                <a className="btn btn-outline" href={`/admin/products/${p.id}`}>
                  {p.isArchived
                    ? "Restaurer / Modifier"
                    : "Modifier"}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}