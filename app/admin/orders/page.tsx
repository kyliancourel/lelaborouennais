import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Type simple (sans Prisma import problématique)
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
    <div style={{ padding: 20 }}>
      <h1>Commandes</h1>

      <div style={{ marginTop: 20 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 15,
            }}
          >
            <h3>
              Commande #{order.orderNumber ?? order.id}
            </h3>

            <p>Client: {order.user?.email ?? "Inconnu"}</p>

            <p>Total: {order.total}€</p>

            <p>Statut: {order.status}</p>

            <div style={{ marginTop: 10 }}>
              <strong>Produits :</strong>

              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product?.name ?? "Produit supprimé"} x{" "}
                    {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <Link href={`/admin/orders/${order.id}`}>
              Gérer commande
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}