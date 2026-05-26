import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  slug: string;
};

export default async function ProductsPage() {
  const products: Product[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="products-page">
      <h1 className="page-title">Produits</h1>

      {products.length === 0 ? (
        <div className="products-empty">
          <h2>Aucun produit</h2>
          <p>Reviens bientôt 👀</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}