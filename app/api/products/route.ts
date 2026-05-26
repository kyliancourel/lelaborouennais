import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =========================
// GET ALL PRODUCTS
// =========================
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

// =========================
// CREATE PRODUCT (FIXED + SAFE)
// =========================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔥 VALIDATION MINIMALE (IMPORTANT)
    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Missing fields (name, slug, price)" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description || "",
        price: Number(data.price),
        image: data.image || "",
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    // 🔥 CAS TRÈS IMPORTANT (slug duplicate)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Slug déjà utilisé" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}