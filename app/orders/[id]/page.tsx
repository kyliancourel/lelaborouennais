import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatEuro(value: number) {
  return Number(value).toFixed(2) + " €";
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    PAID: "Payé",
    SHIPPED: "Expédié",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
  };

  return labels[status] || status;
}

function formatSelectedColors(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).map(
    ([zone, color]) => ({
      zone,
      color: String(color),
    })
  );
}

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
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div className="order-page">
      <h1 className="page-title">
        Commande #{order.orderNumber ?? order.id}
      </h1>

      <div className="order-card">
        <div className="order-header">
          <div>
            <p className="order-date">Date : {formatDate(order.createdAt)}</p>

            <p>
              <strong>Client :</strong> {order.user?.email ?? "—"}
            </p>
          </div>

          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="order-summary-preview">
          <p>
            Total avant remise : <strong>{formatEuro(subtotal)}</strong>
          </p>

          {order.discount > 0 && (
            <p>
              Remise totale : <strong>-{formatEuro(order.discount)}</strong>
            </p>
          )}

          {order.rewardTitle && (
            <p>
              Récompense utilisée :{" "}
              <strong>
                {order.rewardTitle}
                {order.rewardSelectedOption
                  ? ` — ${order.rewardSelectedOption}`
                  : ""}
              </strong>
            </p>
          )}

          {order.welcomeOfferCode && (
            <p>
              Offre de bienvenue utilisée :{" "}
              <strong>{order.welcomeOfferCode}</strong>
            </p>
          )}

          {order.welcomeOfferValue && (
            <p>
              Valeur offre bienvenue :{" "}
              <strong>{Number(order.welcomeOfferValue).toFixed(0)}%</strong>
            </p>
          )}

          <p className="final-total">Total payé : {formatEuro(order.total)}</p>
        </div>
      </div>

      <h3 className="section-title mt-3">Produits commandés</h3>

      <div className="orders-list">
        {order.items.map((item) => (
          <div key={item.id} className="order-card">
            <div className="card-row">
              <div>
                <strong>{item.product?.name ?? "Produit supprimé"}</strong>

                <p className="text-muted">Quantité : {item.quantity}</p>

                <p className="text-muted">
                  Prix unitaire : {formatEuro(item.price)}
                </p>

                {item.selectedColor && (
                  <p className="text-muted">Couleur : {item.selectedColor}</p>
                )}

                {formatSelectedColors(item.selectedColors).map(
                  ({ zone, color }) => (
                    <p key={zone} className="text-muted">
                      {zone} : {color}
                    </p>
                  )
                )}

                {item.customText && (
                  <p className="text-muted">Texte : {item.customText}</p>
                )}
              </div>

              <strong>{formatEuro(item.price * item.quantity)}</strong>
            </div>
          </div>
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