import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

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

function formatSelectedColors(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).map(([zone, color]) => ({
    zone,
    color: String(color),
  }));
}

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
    select: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const orders = user?.orders ?? [];

  if (orders.length === 0) {
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
        {orders.map((order) => {
          const subtotal = order.items.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
          );

          return (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <span className="order-number">
                    #{order.orderNumber ?? order.id.slice(0, 8)}
                  </span>

                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>

                <span
                  className={`status-badge status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-items-preview">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-preview">
                    <div>
                      <strong>{item.product?.name ?? "Produit supprimé"}</strong>

                      <p className="text-muted">
                        Quantité : {item.quantity} — Prix unitaire :{" "}
                        {formatEuro(item.price)}
                      </p>

                      {item.selectedColor && (
                        <p className="text-muted">
                          Couleur : {item.selectedColor}
                        </p>
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
                ))}
              </div>

              <div className="order-summary-preview">
                <p>
                  Total avant remise : <strong>{formatEuro(subtotal)}</strong>
                </p>

                {order.discount > 0 && (
                  <p>
                    Remise : <strong>-{formatEuro(order.discount)}</strong>
                  </p>
                )}

                {order.welcomeOfferCode && (
                  <p>
                    Offre de bienvenue :{" "}
                    <strong>{order.welcomeOfferCode}</strong>
                  </p>
                )}

                {order.rewardTitle && (
                  <p>
                    Récompense : <strong>{order.rewardTitle}</strong>
                  </p>
                )}

                <p className="final-total">
                  Total payé : {formatEuro(order.total)}
                </p>
              </div>

              <div className="order-footer">
                <Link href={`/orders/${order.id}`} className="btn btn-outline">
                  Voir le détail
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}