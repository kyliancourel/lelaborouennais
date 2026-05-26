"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, firstname, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur inscription");
      return;
    }

    router.push(`/verify-request?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Créer un compte</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label className="input-label">Nom</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Prénom</label>
            <input className="input" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Mot de passe</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}