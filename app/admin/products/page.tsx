import { prisma } from "@/lib/prisma";

type Product = {
  id: string;
  name: string;
  price: number;
};

export default async function AdminProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1 className="admin-title">Produits</h1>

        <a href="/admin/products/new" className="btn btn-primary">
          + Ajouter produit
        </a>
      </div>

      <div className="admin-table">
        {products.length === 0 ? (
          <p className="admin-empty">Aucun produit</p>
        ) : (
          products.map((p: Product) => (
            <div className="card" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <p>{p.price}€</p>
              </div>

              <a className="btn btn-outline" href={`/admin/products/${p.id}`}>
                Modifier
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}