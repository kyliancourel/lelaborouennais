"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    setSuccess(
      "Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé."
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Mot de passe oublié</h1>

        <p className="auth-subtitle">
          Saisis ton adresse email pour recevoir un lien de réinitialisation.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Adresse email</label>

            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>

          {success && <p className="auth-success">{success}</p>}

          <div className="auth-links">
            <Link href="/login">Retour à la connexion</Link>
          </div>
        </form>
      </div>
    </div>
  );
}