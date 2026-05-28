"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    addToCart,
    removeOne,
    remove,
    total,
    pointsUsed,
    setPointsUsed,
    maxPoints,
  } = useCart();

  const [loading, setLoading] = useState(false);

  const discount = Math.min(pointsUsed, maxPoints);
  const finalTotal = Math.max(0, total - discount);

  async function handleCheckout() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          usedPoints: discount,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur checkout");
      }
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="p-10">
        <h2>Ton panier est vide</h2>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Panier</h1>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        {/* CART */}
        <div>
          {cart.map((item) => (
            <div key={item.id} className="border p-4 mb-4 rounded">
              <h3>{item.name}</h3>
              <p>{item.price} €</p>

              <div className="flex gap-2">
                <button onClick={() => removeOne(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>

              <button onClick={() => remove(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* LOYALTY */}
        <div className="border p-4 rounded">
          <h2 className="font-bold">💚 Loyalty</h2>

          <p>Max points: {maxPoints}</p>

          <input
            type="number"
            value={pointsUsed}
            onChange={(e) => setPointsUsed(Number(e.target.value))}
            max={maxPoints}
            min={0}
          />

          <p>Discount: {discount} €</p>
          <p>Total: {total} €</p>
          <p className="font-bold">Final: {finalTotal} €</p>

          <button
            className="mt-4 bg-black text-white px-4 py-2"
            onClick={handleCheckout}
          >
            {loading ? "Loading..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}