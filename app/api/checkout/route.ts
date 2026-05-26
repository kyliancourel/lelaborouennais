import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { cart } = await req.json();

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    // 🚨 SAFE CART (ONLY WHAT WE NEED)
    const safeCart = cart.map((item: any) => ({
      id: item.id,
      q: item.quantity,
      p: item.price,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      customer_email: session.user.email,

      line_items: cart.map((item: any) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
        },
      })),

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,

      metadata: {
        userId: session.user.id,
        cart: JSON.stringify(safeCart), // 🔥 CLEAN + SMALL
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}