"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session, status } = useSession();

  console.log("SESSION:", session);
  console.log("SESSION ROLE:", session?.user?.role);
  
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link href="/" className="navbar-logo">
          Laboratoire de la Seine
        </Link>

        {/* LINKS */}
        <div className="navbar-links">
          <Link href="/products">Produits</Link>
          <Link href="/orders">Mes commandes</Link>

          <Link href="/cart">
            Panier ({cartCount})
          </Link>

          {/* ADMIN */}
          {isLoggedIn && isAdmin && (
            <Link href="/admin">Admin</Link>
          )}

          {/* AUTH */}
          {isLoading ? null : !isLoggedIn ? (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register">Inscription</Link>
            </>
          ) : (
            <button onClick={() => signOut()}>
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}