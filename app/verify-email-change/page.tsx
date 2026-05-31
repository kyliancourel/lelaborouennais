"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailChangePage() {
  const token = useSearchParams().get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Token manquant.");
        return;
      }

      const res = await fetch("/api/account/verify-email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Erreur de vérification.");
        return;
      }

      setStatus("success");
      setMessage("Ton nouvel email a bien été confirmé.");
    }

    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-container text-center">
        {status === "loading" && (
          <>
            <div className="spinner" />
            <h1 className="auth-title">Vérification...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="auth-title">Email modifié ✅</h1>
            <p className="auth-success">{message}</p>
            <a className="btn btn-primary" href="/dashboard">
              Retour au compte
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="auth-title">Erreur</h1>
            <p className="auth-error">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}