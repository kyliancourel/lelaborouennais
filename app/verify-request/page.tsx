"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyRequestPage() {
  const email = useSearchParams().get("email");

  const [cooldown, setCooldown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function resendEmail() {
    if (!email) {
      return (
        <div className="auth-page">
          <div className="auth-container verify-box">
            <h1 className="auth-title">Lien invalide</h1>
          </div>
        </div>
      );
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Email renvoyé !");
    setCooldown(30);
  }

  return (
    <div className="auth-page">
      <div className="auth-container verify-box">
        <h1 className="auth-title">📩 Vérifie ton email</h1>

        <p className="verify-text">
          Un email a été envoyé à <strong>{email}</strong>
        </p>

        {message && <p className="auth-error">{message}</p>}

        <button className="btn btn-primary" onClick={resendEmail} disabled={loading || cooldown > 0}>
          {loading ? "Envoi..." : cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
        </button>

        <p className="verify-timer">
          {cooldown > 0 && `Disponible dans ${cooldown}s`}
        </p>
      </div>
    </div>
  );
}