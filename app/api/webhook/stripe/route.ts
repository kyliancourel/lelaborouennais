import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();

  const sig = req.headers.get(
    "stripe-signature"
  );

  if (!sig) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(
      "Webhook signature error:",
      err
    );

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (
    event.type !==
    "checkout.session.completed"
  ) {
    return NextResponse.json({
      received: true,
    });
  }

  const session =
    event.data.object as Stripe.Checkout.Session;

  const userId =
    session.metadata?.userId || null;

  const cartRaw =
    session.metadata?.cart;

  const cart = cartRaw
    ? JSON.parse(cartRaw)
    : [];

  /*
   * ✅ email utilisateur connecté
   * OU invité
   */
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    null;

  /* =========================
     ANTI DOUBLON
  ========================= */

  const existing =
    await prisma.order.findUnique({
      where: {
        stripeSessionId: session.id,
      },
    });

  if (existing) {
    console.log(
      "⚠️ Order already exists:",
      session.id
    );

    return NextResponse.json({
      received: true,
    });
  }

  try {
    /* =========================
       CREATE ORDER
    ========================= */

    const order =
      await prisma.order.create({
        data: {
          orderNumber: `LR-${Date.now()}`,

          stripeSessionId: session.id,

          ...(userId
            ? { userId }
            : {}),

          total:
            (session.amount_total ?? 0) /
            100,

          status: "PAID",

          items: {
            create: cart.map(
              (item: any) => ({
                productId: item.id,

                quantity:
                  item.quantity ?? 1,

                price:
                  item.price ?? 0,
              })
            ),
          },
        },
      });

    /* =========================
       GET ORDER + PRODUCTS
    ========================= */

    const fullOrder =
      await prisma.order.findUnique({
        where: {
          id: order.id,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    /* =========================
       SEND EMAIL
    ========================= */

    if (fullOrder && email) {
      await sendOrderEmail(email, {
        orderNumber:
          fullOrder.orderNumber!,

        total: fullOrder.total,

        items: fullOrder.items.map(
          (i) => ({
            name: i.product.name,

            quantity: i.quantity,

            price: i.price,
          })
        ),
      });

      console.log(
        "✅ EMAIL SENT TO:",
        email
      );
    }

    console.log(
      "✅ ORDER CREATED"
    );
  } catch (err) {
    console.error(
      "ORDER ERROR:",
      err
    );
  }

  return NextResponse.json({
    received: true,
  });
}