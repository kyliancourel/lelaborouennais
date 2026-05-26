import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  slug: string;
};

export default async function AdminProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1 className="admin-title">Produits</h1>

        <Link href="/admin/products/new" className="btn btn-primary">
          + Ajouter
        </Link>
      </div>

      <div className="admin-table">
        {products.map((p) => (
          <div className="card admin-card" key={p.id}>
            <div>
              <strong>{p.name}</strong>
              <p>{p.price}€</p>
            </div>

            <div className="admin-actions">
              <Link className="btn btn-outline" href={`/admin/products/${p.id}`}>
                Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}