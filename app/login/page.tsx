"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    router.push("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Connexion</h1>

        <p className="auth-subtitle">
          Accède à ton espace client
        </p>

        <Form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mot de passe"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-links">
            <a href="/forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          {error && <p className="auth-error">{error}</p>}
        </Form>
      </div>
    </div>
  );
}