import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const products = await prisma.product.findMany();

  return [
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
      lastModified: new Date(),
    },
    ...products.map((p) => ({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
    })),
  ];
}