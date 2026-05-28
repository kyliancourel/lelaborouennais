import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import OrderItem from "@/components/OrderItem";

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
          <OrderItem
            key={order.id}
            id={order.id}
            orderNumber={order.orderNumber}
            total={order.total}
            status={order.status}
            createdAt={order.createdAt.toISOString()}
          />
        ))}
      </div>
    </div>
  );
}