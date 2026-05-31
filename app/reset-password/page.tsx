"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    const res = await fetch(
      "/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      }
    );

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(
        data.error ||
          "Impossible de modifier le mot de passe."
      );
      return;
    }

    setSuccess(
      "Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter."
    );

    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          Nouveau mot de passe
        </h1>

        <p className="auth-subtitle">
          Choisissez un nouveau mot de passe.
        </p>

        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <div className="input-wrapper">
            <label className="input-label">
              Nouveau mot de passe
            </label>

            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">
              Confirmer le mot de passe
            </label>

            <input
              className="input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Modification..."
              : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}