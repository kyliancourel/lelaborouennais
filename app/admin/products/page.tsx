import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Produits (Admin)</h1>

      <Link href="/admin/products/new">
        ➕ Créer un produit
      </Link>

      <div style={{ marginTop: 20 }}>
        {products.map((p: any) => (
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

            <p style={{ margin: "4px 0" }}>
              {p.price}€
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
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