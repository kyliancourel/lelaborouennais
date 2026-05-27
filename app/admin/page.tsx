import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>

        <p className="admin-page-subtitle">
          Gérez votre boutique Laboratoire de la Seine
        </p>
      </div>

      <div className="admin-grid">
        <Link href="/admin/products" className="admin-card">
          <div className="admin-card-icon">📦</div>

          <div>
            <h2>Produits</h2>
            <p>Créer et modifier les produits</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="admin-card">
          <div className="admin-card-icon">🧾</div>

          <div>
            <h2>Commandes</h2>
            <p>Suivre les commandes clients</p>
          </div>
        </Link>
      </div>
    </div>
  );
}