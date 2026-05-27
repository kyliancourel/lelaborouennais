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

export default async function AdminOrdersPage() {
  const orders = (await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })) as Order[];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Commandes</h1>
      </div>

      <div className="admin-grid">
        {orders.map((order) => (
          <div key={order.id} className="card order-card">
            <div className="order-top">
              <h3 className="order-number">
                #{order.orderNumber ?? order.id}
              </h3>

              <span className={`badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-info">
              <p>
                <span className="label">Client :</span>{" "}
                {order.user?.email ?? "Inconnu"}
              </p>

              <p>
                <span className="label">Total :</span>{" "}
                <strong>{order.total}€</strong>
              </p>
            </div>

            <div className="order-items">
              <p className="label">Produits :</p>

              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product?.name ?? "Produit supprimé"} ×{" "}
                    {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <Link className="btn btn-secondary" href={`/admin/orders/${order.id}`}>
              Gérer la commande
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}