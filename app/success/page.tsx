"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clear } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clear();
  }, []);

  if (loading) {
    return (
      <div className="success-loading">
        <h1 className="success-loading-title">
          Confirmation du paiement...
        </h1>
      </div>
    );
  }

  return (
    <div className="success-page">
      <h1 className="success-title">🎉 Paiement confirmé</h1>

      <p className="success-text">
        Merci pour ta commande ! Elle est en cours de traitement.
      </p>

      <div className="success-actions">
        <Link href="/orders" className="btn btn-primary">
          Voir mes commandes
        </Link>
      </div>

      <div className="success-secondary">
        <Link href="/products">Continuer mes achats</Link>
      </div>
    </div>
  );
}