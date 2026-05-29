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

  async function refresh() {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
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

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();
    const onLoyaltyUpdate = () => refresh();

    window.addEventListener("focus", onFocus);
    window.addEventListener("loyalty:update", onLoyaltyUpdate);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("loyalty:update", onLoyaltyUpdate);
    };
  }, []);

  return { user, loading, refresh };
}