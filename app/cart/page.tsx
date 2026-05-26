"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function CartPage() {
  const { cart, addToCart, removeOne, remove, clear, total } = useCart();

  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur Stripe checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>

          <h1 className="empty-cart-title">
            Ton panier est vide
          </h1>

          <p className="empty-cart-text">
            Découvre nos créations premium imprimées en 3D.
          </p>

          <Link
            href="/products"
            className="btn btn-primary"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Panier</h1>

      <div className="cart-list">
        {cart.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="cart-item"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="cart-image"
              />
            )}

            <div className="cart-item-content">
              <h3 className="cart-item-title">
                {item.name}
              </h3>

              <p className="cart-item-price">
                {item.price}€
              </p>

              <p className="cart-item-quantity">
                Quantité : {item.quantity}
              </p>

              <div className="cart-actions">
                <Button
                  variant="secondary"
                  onClick={() => removeOne(item.id)}
                >
                  -
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => addToCart(item)}
                >
                  +
                </Button>

                <Button
                  variant="danger"
                  onClick={() => remove(item.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <hr className="cart-divider" />

      <h2 className="cart-total">
        Total : {total}€
      </h2>

      <div className="cart-footer">
        <Button variant="secondary" onClick={clear}>
          Vider le panier
        </Button>

        <Button
          variant="primary"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading
            ? "Redirection vers Stripe..."
            : "Payer"}
        </Button>
      </div>
    </div>
  );
}