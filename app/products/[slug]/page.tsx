import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCustomizer from "@/components/ProductCustomizer";

export const dynamic = "force-dynamic";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePackOptions(
  value: unknown
): { label: string; price: number }[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is { label: string; price: number } =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "price" in item
    )
    .map((item) => ({
      label: String(item.label),
      price: Number(item.price),
    }))
    .filter((item) => item.label && !Number.isNaN(item.price));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return (
      <div className="empty-state">
        <h1 className="empty-title">Produit introuvable</h1>

        <p className="empty-subtitle">
          Ce produit n'existe plus ou a été supprimé.
        </p>

        <div className="empty-state-action">
          <Link href="/products" className="btn btn-primary">
            Retour boutique
          </Link>
        </div>
      </div>
    );
  }

  const packOptions = normalizePackOptions(product.packOptions);
  const displayPrice = packOptions.length > 0 ? packOptions[0].price : product.price;

  return (
    <div className="product-page">
      <div className="product-grid">
        <ProductCustomizer
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image ?? undefined,
            customizableText: product.customizableText,
            customizationPrice: product.customizationPrice,
            availableColors: normalizeStringArray(product.availableColors),
            unavailableColors: normalizeStringArray(product.unavailableColors),
            colorZones: normalizeStringArray(product.colorZones),
            packOptions,
          }}
        />

        <div>
          {product.category && (
            <p className="product-category">{product.category}</p>
          )}

          <h1>{product.name}</h1>

          {product.description && <p>{product.description}</p>}

          <h2>
            {packOptions.length > 0
              ? `À partir de ${Number(displayPrice).toFixed(2)} €`
              : `${Number(product.price).toFixed(2)} €`}
          </h2>
        </div>
      </div>
    </div>
  );
}