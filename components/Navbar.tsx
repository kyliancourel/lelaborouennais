"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useUserLoyalty } from "@/hooks/useUserLoyalty";

function getTierColor(tier?: string) {
  switch (tier) {
    case "VIP":
      return "#a855f7";
    case "GOLD":
      return "#facc15";
    case "SILVER":
      return "#94a3b8";
    default:
      return "#a3a3a3";
  }
}

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session, status } = useSession();

  const { user } = useUserLoyalty();

  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <Link href="/" className="navbar-logo">
            <div className="logo-wrapper">
              <Image
                src="/logo_clair.png"
                alt="Le Labo Rouennais"
                width={32}
                height={32}
              />
              <span>Le Labo Rouennais</span>
            </div>
          </Link>

          {/* LOYALTY MINI WIDGET */}
          {isLoggedIn && user && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginLeft: "20px",
                padding: "6px 10px",
                borderRadius: "10px",
                background: "#11141a",
                border: "1px solid #232936",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: getTierColor(user.loyaltyTier),
                }}
              />
              <span style={{ fontSize: 13 }}>
                {user.points} pts
              </span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                {user.loyaltyTier}
              </span>
            </div>
          )}

          {/* DESKTOP LINKS */}
          <div className="navbar-links desktop-only">
            <Link href="/products">Produits</Link>
            <Link href="/orders">Mes commandes</Link>

            <Link href="/cart">Panier ({cartCount})</Link>

            {isLoggedIn && isAdmin && <Link href="/admin">Admin</Link>}

            {isLoading ? null : !isLoggedIn ? (
              <>
                <Link href="/login">Connexion</Link>
                <Link href="/register">Inscription</Link>
              </>
            ) : (
              <button onClick={() => signOut()}>Déconnexion</button>
            )}
          </div>

          {/* BURGER */}
          <button className="burger" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE MENU (inchangé) */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-overlay" onClick={closeMenu} />

        <div className="mobile-panel">
          <button className="close-btn" onClick={closeMenu}>✕</button>

          <Link href="/products" onClick={closeMenu}>Produits</Link>
          <Link href="/orders" onClick={closeMenu}>Mes commandes</Link>
          <Link href="/cart" onClick={closeMenu}>Panier ({cartCount})</Link>

          {isLoggedIn && isAdmin && (
            <Link href="/admin" onClick={closeMenu}>Admin</Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link href="/login" onClick={closeMenu}>Connexion</Link>
              <Link href="/register" onClick={closeMenu}>Inscription</Link>
            </>
          ) : (
            <button
              onClick={() => {
                signOut();
                closeMenu();
              }}
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </>
  );
}