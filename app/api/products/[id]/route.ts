import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePackOptions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => {
      const [label, price] = item.split("|").map((part) => part.trim());

      return {
        label,
        price: Number(price),
      };
    })
    .filter((item) => item.label && !Number.isNaN(item.price));
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: String(data.name || "").trim(),
        slug: String(data.slug || "").trim(),
        description: data.description ?? "",
        price: Number(data.price),
        image: data.image ?? "",
        category: data.category ?? "",
        customizableText: Boolean(data.customizableText),
        customizationPrice:
          data.customizationPrice === "" ||
          data.customizationPrice === null ||
          data.customizationPrice === undefined
            ? 0
            : Number(data.customizationPrice),
        availableColors: normalizeStringArray(data.availableColors),
        unavailableColors: normalizeStringArray(data.unavailableColors),
        colorZones: normalizeStringArray(data.colorZones),
        packOptions: normalizePackOptions(data.packOptions),
        inStock: data.inStock === undefined ? true : Boolean(data.inStock),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    await prisma.product.update({
      where: { id },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ARCHIVE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}