"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  points: number;
  loyaltyTier: "BRONZE" | "SILVER" | "GOLD" | "VIP";
};

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
    return (
      <div className="p-10 text-center">
        Chargement du dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="card">
        <h2>👋 Bienvenue {user.name}</h2>

        <p><strong>Email :</strong> {user.email}</p>

        <p><strong>🏆 Points :</strong> {user.points}</p>

        <p><strong>🎖 Niveau :</strong> {user.loyaltyTier}</p>
      </div>
    </div>
  );
}