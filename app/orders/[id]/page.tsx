import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
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
    return <div className="order-page">Commande introuvable</div>;
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="order-page">
      <h1 className="page-title">
        Commande #{order.orderNumber ?? order.id}
      </h1>

      <Card>
        <p><strong>Client :</strong> {order.user?.email ?? "—"}</p>
        <p><strong>Total avant remise :</strong> {subtotal.toFixed(2)} €</p>

        {order.discount > 0 && (
          <p><strong>Remise :</strong> -{order.discount.toFixed(2)} €</p>
        )}

        <p><strong>Total payé :</strong> {Number(order.total).toFixed(2)} €</p>
        <p><strong>Statut :</strong> {order.status}</p>

        {order.rewardTitle && (
          <p>
            <strong>Récompense utilisée :</strong> {order.rewardTitle}
            {order.rewardSelectedOption ? ` — ${order.rewardSelectedOption}` : ""}
          </p>
        )}
      </Card>

      <h3 className="section-title">Produits</h3>

      <div className="orders-list">
        {order.items.map((item) => (
          <Card key={item.id}>
            <div className="card-row">
              <span>{item.product?.name ?? "Produit supprimé"}</span>
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