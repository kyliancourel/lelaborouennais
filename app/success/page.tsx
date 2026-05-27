"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { clear } = useCart();

  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState<boolean | null>(null);

  useEffect(() => {
    clear();

    async function checkPayment() {
      try {
        const res = await fetch(
          `/api/stripe/session?session_id=${sessionId}`
        );

        const data = await res.json();

        setPaid(data.paid);
      } catch (err) {
        setPaid(false);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      checkPayment();
    } else {
      setPaid(false);
      setLoading(false);
    }
  }, [sessionId, clear]);

  if (loading) {
    return (
      <div className="success-loading">
        <div className="spinner" />
        <h1>Confirmation du paiement...</h1>
        <p>On vérifie avec ta banque 🔐</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="success-page">
        <h1>❌ Paiement non confirmé</h1>
        <p>Si ton paiement a été débité, contacte le support.</p>

        <Link href="/cart">Retour au panier</Link>
      </div>
    );
  }

  return (
    <div className="success-page">
      <h1 className="success-title">🎉 Paiement confirmé</h1>

      <p className="success-text">
        Merci ! Ta commande est en cours de préparation.
      </p>

      <div className="success-actions">
        <Link href="/orders" className="btn btn-primary">
          Voir mes commandes
        </Link>

        <Link href="/products" className="btn btn-secondary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}