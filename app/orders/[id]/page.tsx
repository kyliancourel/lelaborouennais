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
    <div className="order-page">
      <h1 className="page-title">
        Commande #{order.orderNumber}
      </h1>

      <div className="order-card">
        <p className="order-meta">
          <strong>Client :</strong> {order.user?.email ?? "—"}
        </p>

        <p className="order-meta">
          <strong>Total :</strong> {order.total} €
        </p>

        <p className="order-meta">
          <strong>Statut :</strong> {order.status}
        </p>
      </div>

      <h3 className="section-title">Produits</h3>

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item" key={item.id}>
            <span className="order-item-name">
              {item.product.name}
            </span>

            <span className="order-item-qty">
              x{item.quantity}
            </span>

            <span className="order-item-price">
              {item.price} €
            </span>
          </div>
        ))}
      </div>

      <Link href="/orders" className="btn btn-outline">
        ← Retour
      </Link>
    </div>
  );
}