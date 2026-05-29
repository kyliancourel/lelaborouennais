"use client";

import { useEffect, useState } from "react";

type LoyaltyUser = {
  id: string;
  email: string;
  name: string | null;
  points: number;
  loyaltyTier: "BRONZE" | "SILVER" | "GOLD" | "VIP";
};

export function useUserLoyalty() {
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { user, loading };
}