import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Mes commandes</h1>
          <p className="auth-subtitle">
            Connecte-toi pour voir ton historique.
          </p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
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

      <div className="orders-list">
        {user.orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <span className="order-number">
                  #{order.orderNumber}
                </span>

                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              <span
                className={`status-badge status-${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>

            <div className="order-footer">
              <strong>{order.total.toFixed(2)} €</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}