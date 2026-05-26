"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartPage() {
  const { cart, addToCart, removeOne, remove, total } = useCart();

  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
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
      console.error(err);
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Ton panier est vide</h2>
        <p className="empty-state-description">
          Ajoute des produits pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Panier</h1>

      <div className="cart-layout">

        {/* ITEMS */}
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img className="cart-item-image" src={item.image} />

              <div className="cart-item-info">
                <h3 className="cart-item-title">{item.name}</h3>

                <p className="cart-item-price">
                  {item.price}€
                </p>

                <div className="cart-item-actions">
                  <button
                    className="qty-btn"
                    onClick={() => removeOne(item.id)}
                  >
                    -
                  </button>

                  <span className="qty-value">
                    {item.quantity}
                  </span>

                  <button
                    className="qty-btn"
                    onClick={() => addToCart(item)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="cart-remove"
                  onClick={() => remove(item.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="cart-summary">
          <div className="cart-total-line">
            <span>Total</span>
            <strong>{total}€</strong>
          </div>

          <button
            className="checkout-btn"
            disabled={loading}
            onClick={handleCheckout}
          >
            {loading ? "Redirection..." : "Payer"}
          </button>
        </div>

      </div>
    </div>
  );
}