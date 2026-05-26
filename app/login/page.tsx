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
      <div className="auth-container">
        <h1 className="auth-title">Connexion</h1>

        <Form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          {error && <p className="auth-error">{error}</p>}
        </Form>
      </div>
    </div>
  );
}