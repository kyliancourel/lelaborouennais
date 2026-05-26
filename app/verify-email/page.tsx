"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "error" | "expired";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // ======================
  // VERIFY EMAIL
  // ======================
  async function verifyEmail() {
    if (!token) {
      setStatus("error");
      setMessage("Token manquant");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Token expiré") {
          setStatus("expired");
        } else {
          setStatus("error");
        }

        setMessage(data.error || "Erreur de vérification");
        return;
      }

      setStatus("success");
      setMessage("Ton compte est maintenant activé !");
    } catch {
      setStatus("error");
      setMessage("Erreur serveur");
    }
  }

  useEffect(() => {
    verifyEmail();
  }, [token]);

  // ======================
  // COOLDOWN TIMER
  // ======================
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // ======================
  // RESEND EMAIL
  // ======================
  async function resendEmail() {
    const email = prompt("Entre ton email pour renvoyer le lien :");

    if (!email) return;

    try {
      setResending(true);

      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }

      alert("Email envoyé !");
      setCooldown(60); // 🔥 start cooldown
    } catch {
      alert("Erreur serveur");
    } finally {
      setResending(false);
    }
  }

  // ======================
  // UI
  // ======================
  return (
    <div className="auth-page">
      <div className="auth-container text-center">

        {/* LOADING */}
        {status === "loading" && (
          <div>
            <div className="spinner" />
            <h1 className="auth-title">Vérification en cours</h1>
            <p>Merci de patienter...</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div>
            <h1 className="auth-title">🎉 Compte activé</h1>
            <p className="success-text">{message}</p>

            <a href="/login" className="btn btn-primary">
              Se connecter
            </a>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div>
            <h1 className="auth-title">❌ Erreur</h1>
            <p className="auth-error">{message}</p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <a href="/register" className="btn btn-outline">
                Réessayer
              </a>

              <button
                onClick={resendEmail}
                className="btn btn-primary"
                disabled={cooldown > 0 || resending}
              >
                {resending
                  ? "Envoi..."
                  : cooldown > 0
                  ? `Attendre ${cooldown}s`
                  : "Renvoyer email"}
              </button>
            </div>
          </div>
        )}

        {/* EXPIRED */}
        {status === "expired" && (
          <div>
            <h1 className="auth-title">⌛ Lien expiré</h1>
            <p className="auth-error">{message}</p>

            <button
              onClick={resendEmail}
              className="btn btn-primary"
              disabled={cooldown > 0 || resending}
            >
              {resending
                ? "Envoi..."
                : cooldown > 0
                ? `Attendre ${cooldown}s`
                : "Renvoyer un email"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}