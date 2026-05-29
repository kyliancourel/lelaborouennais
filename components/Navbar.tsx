"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useUserLoyalty } from "@/hooks/useUserLoyalty";

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session, status } = useSession();
  const { user } = useUserLoyalty();

  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  const loyaltyPoints = user?.points ?? 0;

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

          <div className="navbar-links desktop-only">
            <Link href="/products">Produits</Link>
            <Link href="/orders">Mes commandes</Link>
            <Link href="/cart">Panier ({cartCount})</Link>

            {isLoggedIn && (
              <Link href="/account/loyalty" className="navbar-loyalty-pill">
                💚 {loyaltyPoints} pts
              </Link>
            )}

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

          <button className="burger" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-overlay" onClick={closeMenu} />

        <div className="mobile-panel">
          <button className="close-btn" onClick={closeMenu}>
            ✕
          </button>

          {isLoggedIn && (
            <Link
              href="/account/loyalty"
              className="mobile-loyalty-card"
              onClick={closeMenu}
            >
              <span>🌟 Programme fidélité</span>
              <strong>{loyaltyPoints} points</strong>
            </Link>
          )}

          <Link href="/products" onClick={closeMenu}>
            Produits
          </Link>

          <Link href="/orders" onClick={closeMenu}>
            Mes commandes
          </Link>

          <Link href="/cart" onClick={closeMenu}>
            Panier ({cartCount})
          </Link>

          {isLoggedIn && isAdmin && (
            <Link href="/admin" onClick={closeMenu}>
              Admin
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link href="/login" onClick={closeMenu}>
                Connexion
              </Link>

              <Link href="/register" onClick={closeMenu}>
                Inscription
              </Link>
            </>
          ) : (
            <button
              className="mobile-menu-btn"
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