import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  slug: string;
  category?: string | null;
  customizableText: boolean;
  colorZones: unknown;
  packOptions: unknown;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params?.search?.trim() || "";

  const products: Product[] = await prisma.product.findMany({
    where: {
      isArchived: false,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="products-page">
      <h1 className="page-title">
        {search ? `Recherche : ${search}` : "Produits"}
      </h1>

      {products.length === 0 ? (
        <div className="products-empty">
          <h2>Aucun produit trouvé</h2>
          <p>Essaie avec un autre mot-clé.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}