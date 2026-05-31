"use client";

import { useState } from "react";

type Props = {
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  usernameUpdatedAt?: string | null;
};

function getNextUsernameDate(date?: string | null) {
  if (!date) return null;

  const next = new Date(date);
  next.setMonth(next.getMonth() + 6);

  return next;
}

export default function ProfileSettingsForm({
  firstname,
  lastname,
  username,
  usernameUpdatedAt,
}: Props) {
  const [form, setForm] = useState({
    firstname: firstname || "",
    lastname: lastname || "",
    username: username || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const nextUsernameDate = getNextUsernameDate(usernameUpdatedAt);
  const canChangeUsername =
    !nextUsernameDate || new Date() >= nextUsernameDate || !username;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de la modification");
      return;
    }

    setMessage("Profil mis à jour.");
    window.location.reload();
  }

  return (
    <form className="form mt-3" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="Prénom"
        value={form.firstname}
        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
      />

      <input
        className="input"
        placeholder="Nom"
        value={form.lastname}
        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
      />

      <input
        className="input"
        placeholder="Pseudo"
        value={form.username}
        disabled={!canChangeUsername}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      {!username && (
        <p className="text-muted">
          Tu peux ajouter un pseudo si tu le souhaites.
        </p>
      )}

      {username && !canChangeUsername && nextUsernameDate && (
        <p className="text-muted">
          Prochain changement de pseudo possible le{" "}
          {nextUsernameDate.toLocaleDateString("fr-FR")}.
        </p>
      )}

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer mon profil"}
      </button>
    </form>
  );
}