import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Order = {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number;
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return <p>Tu dois être connecté</p>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: true,
    },
  });

  if (!user) return <p>Aucune donnée</p>;

  return (
    <div className="orders-page">
      <h1 className="page-title">Mes commandes</h1>

      {user.orders.map((order: Order) => (
        <div className="order-card" key={order.id}>
          <div className="order-header">
            <span className="order-id">#{order.orderNumber}</span>

            <span className={`status-badge status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <p className="order-total">Total: {order.total}€</p>
        </div>
      ))}
    </div>
  );
}