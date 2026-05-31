"use client";

import { useState } from "react";

export default function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState("");
  const [newEmailConfirm, setNewEmailConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newEmail.trim().toLowerCase() !== newEmailConfirm.trim().toLowerCase()) {
      setError("Les emails ne correspondent pas.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/account/change-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newEmail,
        newEmailConfirm,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la demande.");
      return;
    }

    setMessage(data.message || "Email envoyé.");
    setNewEmail("");
    setNewEmailConfirm("");
  }

  return (
    <form className="form mt-3" onSubmit={handleSubmit}>
      <input
        className="input"
        type="email"
        placeholder="Nouvel email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />

      <input
        className="input"
        type="email"
        placeholder="Confirmer le nouvel email"
        value={newEmailConfirm}
        onChange={(e) => setNewEmailConfirm(e.target.value)}
      />

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Envoi..." : "Changer mon email"}
      </button>
    </form>
  );
}