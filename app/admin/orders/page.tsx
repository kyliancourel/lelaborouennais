import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div>
        <h1>Mes commandes</h1>
        <p>Tu dois être connecté.</p>
        <Link href="/login">Se connecter</Link>
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
      <div>
        <h1>Mes commandes</h1>
        <p>Aucune commande.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mes commandes</h1>

      {user.orders.map(
        (order: {
          id: string;
          orderNumber: string;
          status: string;
          total: number;
          items: {
            id: string;
            quantity: number;
            price: number;
            product: { name: string };
          }[];
        }) => (
          <div
            key={order.id}
          >
            <p>Commande #{order.orderNumber}</p>
            <p>Statut: {order.status}</p>
            <p>Total: {order.total}€</p>

            <ul>
              {order.items.map(
                (item: {
                  id: string;
                  quantity: number;
                  price: number;
                  product: { name: string };
                }) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity}
                  </li>
                )
              )}
            </ul>

            <Link
              href={`/orders/${order.id}`}
            >
              Voir détails →
            </Link>
          </div>
        )
      )}
    </div>
  );
}