import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1 className="auth-title">Mes commandes</h1>
          <p>Tu dois être connecté.</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { orders: true },
  });

  if (!user || user.orders.length === 0) {
    return (
      <div className="orders-page">
        <h1 className="page-title">Mes commandes</h1>
        <p>Aucune commande pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">Mes commandes</h1>

      {user.orders.map((order: typeof user.orders[number]) => (
        <div className="order-card" key={order.id}>
          <div className="order-header">
            <span>#{order.orderNumber}</span>

            <span className={`status-badge status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <p className="order-total">{order.total}€</p>
        </div>
      ))}
    </div>
  );
}