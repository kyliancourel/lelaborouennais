"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, addToCart, removeOne, remove, total } = useCart();

  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (loading) return; // 🔥 anti double click

    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur checkout");
      }
    } catch (err) {
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <h2>Ton panier est vide</h2>
        <p>Ajoute des produits pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Panier</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img className="cart-item-image" src={item.image} />

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{item.price} €</p>

                <div className="cart-qty">
                  <button onClick={() => removeOne(item.id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>

                <button className="btn btn-danger cart-remove-btn" onClick={() => remove(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Total</span>
            <strong>{total.toFixed(2)} €</strong>
          </div>

          <button
            className="checkout-btn"
            disabled={loading}
            onClick={handleCheckout}
          >
            {loading ? "Redirection..." : "Payer maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}