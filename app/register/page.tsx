"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError("Les emails ne correspondent pas.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        firstname,
        email,
        emailConfirm,
        password,
        passwordConfirm,
      }),
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
      <div className="auth-card">
        <h1 className="auth-title">Créer un compte</h1>

        <p className="auth-subtitle">Rejoignez le programme fidélité</p>

        <Form onSubmit={handleSubmit}>
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} />

          <Input
            label="Prénom"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Confirmer l'email"
            type="email"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
        </Form>
      </div>
    </div>
  );
}