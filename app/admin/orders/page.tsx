import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
  discount: number;
  createdAt: Date;
  user: {
    email: string | null;
  } | null;
  items: OrderItem[];
};

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    PAID: "Payée",
    PREPARING: "En préparation",
    SHIPPED: "Expédiée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    CANCELLED_REFUNDED: "Annulée et remboursée",
  };

  return labels[status] || status;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOrdersPage() {
  const orders: Order[] = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const paidOrders = orders.filter((order) => order.status === "PAID").length;
  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;
  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "CANCELLED" ||
      order.status === "CANCELLED_REFUNDED"
  ).length;

  const totalRevenue = orders
    .filter(
      (order) =>
        order.status !== "CANCELLED" &&
        order.status !== "CANCELLED_REFUNDED"
    )
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="admin-page admin-orders-page">
      <div className="admin-orders-hero">
        <div>
          <p className="admin-eyebrow">Commandes</p>
          <h1 className="admin-title">Gestion des commandes</h1>
          <p className="admin-subtitle">
            Suivez les commandes clients, les paiements, les préparations et les
            expéditions.
          </p>
        </div>

        <div className="admin-orders-revenue">
          <span>Chiffre encaissé</span>
          <strong>{totalRevenue.toFixed(2)} €</strong>
        </div>
      </div>

      <div className="admin-orders-stats">
        <div className="admin-stat-card">
          <span>Total</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="admin-stat-card success">
          <span>Payées</span>
          <strong>{paidOrders}</strong>
        </div>

        <div className="admin-stat-card warning">
          <span>En préparation</span>
          <strong>{preparingOrders}</strong>
        </div>

        <div className="admin-stat-card blue">
          <span>Expédiées</span>
          <strong>{shippedOrders}</strong>
        </div>

        <div className="admin-stat-card danger">
          <span>Annulées</span>
          <strong>{cancelledOrders}</strong>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty admin-orders-empty">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <article key={order.id} className="admin-order-card">
              <div className="admin-order-header">
                <div>
                  <p className="admin-order-number">
                    #{order.orderNumber ?? order.id.slice(0, 8)}
                  </p>

                  <p className="admin-order-date">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`status-badge status-${order.status.toLowerCase()}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="admin-order-body">
                <div className="admin-order-info">
                  <span>Client</span>
                  <strong>{order.user?.email ?? "Client invité"}</strong>
                </div>

                <div className="admin-order-info">
                  <span>Total payé</span>
                  <strong>{order.total.toFixed(2)} €</strong>
                </div>

                <div className="admin-order-info">
                  <span>Remise</span>
                  <strong>
                    {order.discount > 0
                      ? `-${order.discount.toFixed(2)} €`
                      : "—"}
                  </strong>
                </div>

                <div className="admin-order-info">
                  <span>Articles</span>
                  <strong>
                    {order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-order-products">
                <p>Produits</p>

                <ul>
                  {order.items.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      {item.product?.name ?? "Produit supprimé"} ×{" "}
                      {item.quantity}
                    </li>
                  ))}
                </ul>

                {order.items.length > 3 && (
                  <small>+{order.items.length - 3} autre(s) produit(s)</small>
                )}
              </div>

              <Link
                className="btn btn-primary admin-order-action"
                href={`/admin/orders/${order.id}`}
              >
                Gérer la commande →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}