"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "welcome-offer-popup-closed-session";

export default function WelcomeOfferPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const closedThisSession = sessionStorage.getItem(STORAGE_KEY);

    if (!closedThisSession) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function close() {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const res = await fetch("/api/welcome-offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'envoi.");

      if (res.status === 409) {
        sessionStorage.setItem(STORAGE_KEY, "true");
      }

      return;
    }

    setMessage(data.message || "Offre envoyée par email.");

    sessionStorage.setItem(STORAGE_KEY, "true");

    setTimeout(() => {
      setOpen(false);
    }, 1800);
  }

  if (!open) return null;

  return (
    <div className="welcome-offer-overlay">
      <div className="welcome-offer-card">
        <button className="welcome-offer-close" onClick={close}>
          ✕
        </button>

        <span className="welcome-offer-badge">Offre de bienvenue</span>

        <h2>Bienvenue au Labo Rouennais</h2>

        <p className="text-muted">
          Reçois 10 % de réduction par email à utiliser lors de ta première
          commande.
        </p>

        <form onSubmit={handleSubmit} className="form mt-3">
          <input
            className="input"
            type="email"
            placeholder="Ton adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {message && <p className="auth-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Recevoir mon offre"}
          </button>
        </form>
      </div>
    </div>
  );
}