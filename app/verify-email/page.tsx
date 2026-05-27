"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  async function verify() {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error);
      return;
    }

    setStatus("success");
    setMessage("Compte activé !");
  }

  useEffect(() => {
    if (!token) return;

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
            <h1 className="auth-title">🎉 Activé</h1>
            <p className="auth-success">{message}</p>
            <a className="btn btn-primary" href="/login">Connexion</a>
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