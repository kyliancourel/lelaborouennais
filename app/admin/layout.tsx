export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin</div>

        <nav className="admin-nav">
          <a className="admin-link" href="/admin">Dashboard</a>
          <a className="admin-link" href="/admin/products">Produits</a>
          <a className="admin-link" href="/admin/orders">Commandes</a>
        </nav>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}