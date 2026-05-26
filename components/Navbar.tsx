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
        <Link href="/" className="navbar-logo">
          Laboratoire de la Seine
        </Link>

        <div className="navbar-links">
          <Link href="/products">Produits</Link>
          <Link href="/orders">Mes commandes</Link>

          <Link href="/cart">
            Panier ({cartCount})
          </Link>

          {isAdmin && (
            <Link href="/admin">Admin</Link>
          )}

          {!session ? (
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