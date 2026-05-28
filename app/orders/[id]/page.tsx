import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
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

      <Card>
        <p>
          <strong>Client :</strong> {order.user?.email ?? "—"}
        </p>

        <p>
          <strong>Total :</strong> {order.total.toFixed(2)} €
        </p>

        <p>
          <strong>Statut :</strong> {order.status}
        </p>
      </Card>

      <h3 className="section-title">Produits</h3>

      <div className="orders-list">
        {order.items.map((item) => (
          <Card key={item.id}>
            <div className="card-row">
              <span>{item.product.name}</span>
              <span>x{item.quantity}</span>
              <strong>{item.price.toFixed(2)} €</strong>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-3">
        <Link href="/orders" className="btn btn-outline">
          ← Retour
        </Link>
      </div>
    </div>
  );
}