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

      <div>
        {products.map((p) => (
          <div
            key={p.id}
          >
            <h3>{p.name}</h3>

            <p>
              {p.price}€
            </p>

            <p>
              Stock: {p.stock}
            </p>

            <div>
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