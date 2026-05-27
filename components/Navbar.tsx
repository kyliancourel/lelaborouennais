"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

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

  const closeMenu = () => setOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* LOGO */}
          <Link href="/logo_clair.png" className="navbar-logo">
            Le Labo Rouennais
          </Link>

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

          {/* BURGER BUTTON */}
          <button className="burger" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-overlay" onClick={closeMenu} />

        <div className="mobile-panel">
          <button className="close-btn" onClick={closeMenu}>
            ✕
          </button>

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