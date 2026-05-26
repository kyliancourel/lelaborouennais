import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div>
        <Link href="/admin/products">📦 Produits</Link>
      </div>
    </div>
  );
}