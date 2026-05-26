"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  // ESC + LOCK SCROLL
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEsc);

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <Link href="/" className="navbar-logo">
            Laboratoire de la Seine
          </Link>

          {/* DESKTOP LINKS */}
          <div className="navbar-links">
            <Link href="/products" className="navbar-link">Produits</Link>
            <Link href="/orders" className="navbar-link">Mes commandes</Link>

            <Link href="/cart" className="navbar-link navbar-cart">
              🛒 Panier
              {cartCount > 0 && (
                <span className="navbar-badge">{cartCount}</span>
              )}
            </Link>

            {isAdmin && (
              <Link href="/admin/products" className="navbar-link navbar-admin">
                Admin
              </Link>
            )}

            {!session ? (
              <>
                <Link href="/login" className="navbar-link">Connexion</Link>
                <Link href="/register" className="navbar-link">Inscription</Link>
              </>
            ) : (
              <button onClick={() => signOut()} className="navbar-logout">
                Déconnexion
              </button>
            )}
          </div>

          {/* BURGER */}
          <button
            onClick={() => setOpen(true)}
            className="navbar-mobile-button"
          >
            ☰
          </button>

        </div>
      </nav>

      {/* OVERLAY */}
      <div
        className={`nav-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* DRAWER */}
      <aside className={`nav-drawer ${open ? "open" : ""}`}>
        <div className="nav-drawer-header">
          <span>Menu</span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="nav-drawer-links">
          <Link href="/products" onClick={() => setOpen(false)}>Produits</Link>
          <Link href="/orders" onClick={() => setOpen(false)}>Mes commandes</Link>

          <Link href="/cart" onClick={() => setOpen(false)}>
            Panier ({cartCount})
          </Link>

          {isAdmin && (
            <Link href="/admin/products" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}

          {!session ? (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Connexion</Link>
              <Link href="/register" onClick={() => setOpen(false)}>Inscription</Link>
            </>
          ) : (
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="drawer-logout"
            >
              Déconnexion
            </button>
          )}
        </div>
      </aside>
    </>
  );
}