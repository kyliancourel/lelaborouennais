"use client";

import { useEffect, useState } from "react";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import ChangeEmailForm from "@/components/ChangeEmailForm";

type User = {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  points: number;
  loyaltyTier: "BRONZE" | "SILVER" | "GOLD" | "VIP";
};

function getDisplayName(user: User) {
  if (user.username) return user.username;

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

  return fullName || user.email;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/me");
      if (!res.ok) return;

      const data = await res.json();
      setUser(data.user);
    }

    load();
  }, []);

  if (!user) {
    return <div className="p-10 text-center">Chargement du dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="card">
        <h2>👋 Bienvenue {getDisplayName(user)}</h2>

        <p>
          <strong>📧 Email :</strong> {user.email}
        </p>

        <p>
          <strong>👤 Prénom :</strong> {user.firstname || "Non renseigné"}
        </p>

        <p>
          <strong>👤 Nom :</strong> {user.lastname || "Non renseigné"}
        </p>

        <p>
          <strong>🏷️ Pseudo :</strong> {user.username || "Non renseigné"}
        </p>

        <p>
          <strong>🏆 Points :</strong> {user.points}
        </p>

        <p>
          <strong>🎖 Niveau :</strong> {user.loyaltyTier}
        </p>
      </div>

      <div className="card mt-3">
        <h2>Paramètres du compte</h2>

        <div className="mt-3">
          <h3>Changer mon email</h3>

          <p className="text-muted">
            Ton email actuel reste actif tant que le nouvel email n'est pas vérifié.
          </p>

          <ChangeEmailForm />
        </div>

        <p className="text-muted">
          Tu peux supprimer ton compte à tout moment.
        </p>

        <DeleteAccountButton points={user.points} email={user.email} />
      </div>
    </div>
  );
}