// hooks/useUserLoyalty.ts

"use client";

import { useEffect, useState } from "react";

type LoyaltyUser = {
  id: string;
  email: string;
  name: string;
  points: number;
  loyaltyTier: "BRONZE" | "SILVER" | "GOLD" | "VIP";
};

export function useUserLoyalty() {
  const [user, setUser] = useState<LoyaltyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data.user);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { user, loading };
}