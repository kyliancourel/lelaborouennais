import { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin</div>

        <nav className="admin-nav">
          <Link className="admin-link" href="/admin">
            Dashboard
          </Link>

          <Link className="admin-link" href="/admin/products">
            Produits
          </Link>

          <Link className="admin-link" href="/admin/orders">
            Commandes
          </Link>
        </nav>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}