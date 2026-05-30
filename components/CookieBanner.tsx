"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_KEY = "cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);

    if (!consent) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function rejectCookies() {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <div>
          <h3>Gestion des cookies</h3>

          <p>
            Nous utilisons uniquement les cookies nécessaires au fonctionnement
            du site, du panier, de la connexion et du paiement.{" "}
            <Link href="/cookie-policy">En savoir plus</Link>
          </p>
        </div>

        <div className="cookie-actions">
          <button className="btn btn-outline" onClick={rejectCookies}>
            Refuser
          </button>

          <button className="btn btn-primary" onClick={acceptCookies}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}