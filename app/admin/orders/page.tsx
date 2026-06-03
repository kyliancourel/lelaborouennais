import { prisma } from "@/lib/prisma";
import Link from "next/link";

type OrderItem = {
  id: string;
  quantity: number;
  product: {
    name: string | null;
  } | null;
};

type Order = {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number;
  user: {
    email: string | null;
  } | null;
  items: OrderItem[];
};

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    PAID: "Payée",
    SHIPPED: "Expédiée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    CANCELLED_REFUNDED: "Annulée et remboursée",
  };

  return labels[status] || status;
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  return (
    <div className="admin-page">
      <div className="card card-soft">
        <h1 className="page-title">📦 Admin — Commandes</h1>
        <p className="text-muted">
          Gestion des commandes en temps réel
        </p>
      </div>

      <div className="admin-grid mt-3">
        {orders.map((order) => (
          <div key={order.id} className="card">
            {/* HEADER */}
            <div className="card-row">
              <strong>#{order.orderNumber ?? order.id.slice(0, 6)}</strong>

              <span className={`status-badge status-${order.status.toLowerCase()}`}>
              {getStatusLabel(order.status)}
              </span>
            </div>

            {/* CLIENT */}
            <p className="mt-3">
              👤 {order.user?.email ?? "Inconnu"}
            </p>

            {/* TOTAL */}
            <p className="mt-3">
              💰 <strong>{order.total.toFixed(2)} €</strong>
            </p>

            {/* ITEMS */}
            <div className="mt-3">
              <p className="section-title">Produits</p>

              <ul className="text-muted">
                {order.items.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.product?.name ?? "Produit supprimé"} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTION */}
            <Link
              className="btn btn-primary mt-3"
              href={`/admin/orders/${order.id}`}
            >
              Gérer →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}