import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // ✅ SIMPLE ET CORRECT
    const session = await auth();

    console.log("SESSION DEBUG:", session);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { cart } = await req.json();

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email!;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      customer_email: email,

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
        userId,
        cart: JSON.stringify(cart),
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}