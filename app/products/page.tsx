import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

// 👉 type propre basé sur la requête réelle
type Product = Awaited<
  ReturnType<typeof prisma.product.findMany>
>[number];

export default async function ProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="products-page">
      <h1 className="products-title">Produits</h1>

      <div className="products-grid-list">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}