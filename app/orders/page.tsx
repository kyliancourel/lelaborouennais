import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="page-container">
        <h1 className="page-title">Mes commandes</h1>

        <p>Tu dois être connecté.</p>

        <Link className="btn btn-outline" href="/login">
          Se connecter
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user || user.orders.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Mes commandes</h1>
        <p>Aucune commande.</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1 className="page-title">Mes commandes</h1>

      {user.orders.map((order: typeof user.orders[number]) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-title">
              Commande #{order.orderNumber}
            </span>

            <span className={`badge badge-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <p className="order-meta">
            <strong>Total :</strong> {order.total}€
          </p>

          <div>
            <strong>Produits :</strong>

            <ul className="order-items">
              {order.items.map((item: typeof order.items[number]) => (
                <li key={item.id}>
                  {item.product.name} × {item.quantity} — {item.price}€
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`/orders/${order.id}`}
            className="btn btn-primary order-link"
          >
            Voir détails →
          </Link>
        </div>
      ))}
    </div>
  );
}