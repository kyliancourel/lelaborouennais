import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { headers } from "next/headers";
import { resend } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  if (!userId) return NextResponse.json({ received: true });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return NextResponse.json({ received: true });

  const cart = session.metadata?.cart
    ? JSON.parse(session.metadata.cart)
    : [];

  // 🔢 ORDER NUMBER
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;

  if (lastOrder?.orderNumber) {
    const last = lastOrder.orderNumber.split("-").pop();
    nextNumber = Number(last) + 1;
  }

  const name = (user.name || "CLIENT")
    .toUpperCase()
    .replace(/\s+/g, "-");

  const date = new Date();
  const orderNumber = `LR-${name}-${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(nextNumber).padStart(3, "0")}`;

  // 🧾 CREATE ORDER
  const createdOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      total: (session.amount_total ?? 0) / 100,
      status: "PAID",
      items: {
        create: cart.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // 📧 EMAIL PRO SIMPLE (SHOPIFY STYLE)
  await resend.emails.send({
    from: "Laboratoire de la Seine <onboarding@resend.dev>",
    to: user.email,
    subject: `Commande confirmée ${orderNumber}`,
    html: `
      <div style="font-family: Arial; padding:20px;">
        <h1>Merci pour votre commande 🎉</h1>

        <p>Bonjour ${user.name || "Client"},</p>

        <p>Nous avons bien reçu votre commande.</p>

        <h2>Résumé</h2>

        <p><strong>Commande :</strong> ${orderNumber}</p>
        <p><strong>Total :</strong> ${(session.amount_total ?? 0) / 100}€</p>

        <p>
          Vous pouvez suivre votre commande depuis votre espace client.
        </p>

        <hr />

        <p style="color:gray;">
          Laboratoire de la Seine — Merci pour votre confiance
        </p>
      </div>
    `,
  });

  console.log("✅ ORDER CREATED:", orderNumber);

  return NextResponse.json({ received: true });
}