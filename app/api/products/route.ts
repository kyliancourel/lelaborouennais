import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Nom, slug et prix requis" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: String(data.name).trim(),
        slug: String(data.slug).trim(),
        description: data.description ?? "",
        price: Number(data.price),
        image: data.image ?? "",
        category: data.category ?? "",
        customizableText: Boolean(data.customizableText),
        customizationPrice: Number(data.customizationPrice || 4),
        availableColors: normalizeStringArray(data.availableColors),
        unavailableColors: normalizeStringArray(data.unavailableColors),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}