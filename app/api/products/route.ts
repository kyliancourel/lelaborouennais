import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// =========================
// GET ALL PRODUCTS
// =========================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
// CREATE PRODUCT
// =========================
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        image: data.image || "",
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}