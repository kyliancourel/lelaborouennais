"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Lien invalide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
        passwordConfirm,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Impossible de modifier le mot de passe.");
      return;
    }

    setSuccess(
      "Mot de passe modifié avec succès. Tu peux maintenant te connecter."
    );

    setPassword("");
    setPasswordConfirm("");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Nouveau mot de passe</h1>

        <p className="auth-subtitle">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Nouveau mot de passe</label>

            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Confirmer le mot de passe</label>

            <input
              className="input"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Modification..." : "Modifier le mot de passe"}
          </button>

          {success && (
            <div className="auth-links">
              <Link href="/login">Se connecter</Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-card">
            <p className="auth-subtitle">Chargement...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}