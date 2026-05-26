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
      </div>

      <div className="admin-table">
        {products.map((p: Product) => (
          <div className="card" key={p.id}>
            <strong>{p.name}</strong>
            <p>{p.price}€</p>
          </div>
        ))}
      </div>
    </div>
  );
}