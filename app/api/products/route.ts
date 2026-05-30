import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    console.log("📦 CREATE PRODUCT BODY:", data);

    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        price: Number(data.price),
        image: data.image ?? "",
        category: data.category ?? "",
        customizableText: Boolean(data.customizableText),
        customizationPrice: Number(data.customizationPrice || 4),
        availableColors: data.availableColors || [],
        unavailableColors: data.unavailableColors || [],
      },
    });

    console.log("✅ PRODUCT CREATED:", product.id);

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("❌ CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}