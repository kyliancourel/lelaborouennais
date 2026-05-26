import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div>
      <h1>Produits (Admin)</h1>

      <Link href="/admin/products/new">
        ➕ Créer un produit
      </Link>

      <div style={{ marginTop: 20 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 12,
              borderRadius: 6,
            }}
          >
            <h3>{p.name}</h3>

            <p>{p.price}€</p>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/admin/products/${p.id}`}>
                ✏️ Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}