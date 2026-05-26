import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!id) {
    return <div className="page-container">Commande introuvable</div>;
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return <div className="page-container">Commande introuvable</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Commande #{order.orderNumber}</h1>

      <p className="order-meta">
        <strong>Client :</strong> {order.user?.email ?? "—"}
      </p>

      <p className="order-meta">
        <strong>Total :</strong> {order.total}€
      </p>

      <h3 style={{ marginTop: 20 }}>Produits</h3>

      <ul className="order-items">
        {order.items.map(
          (
            item: {
              id: string;
              quantity: number;
              price: number;
              product: { name: string };
            }
          ) => (
            <li key={item.id}>
              {item.product.name} × {item.quantity} — {item.price}€
            </li>
          )
        )}
      </ul>

      <Link href="/orders" className="btn btn-outline">
        ← Retour
      </Link>
    </div>
  );
}