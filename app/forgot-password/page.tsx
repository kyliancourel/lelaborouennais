"use client";

import { useState } from "react";

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
          Saisissez votre adresse email pour recevoir un lien de
          réinitialisation.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">
              Adresse email
            </label>

            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Envoi..."
              : "Envoyer le lien"}
          </button>

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}