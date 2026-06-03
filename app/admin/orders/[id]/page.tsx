import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    PAID: "Payée",
    SHIPPED: "Expédiée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    CANCELLED_REFUNDED: "Annulée et remboursée",
  };

  return labels[status] || status;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    return (
      <div className="admin-page">
        <p className="admin-empty">Commande introuvable</p>
      </div>
    );
  }

  async function updateStatus(formData: FormData) {
    "use server";

    const status = String(formData.get("status") || "");

    if (!status) return;

    await prisma.order.update({
      where: { id },
      data: {
        status: status as any,
      },
    });

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">
          Commande #{order.orderNumber ?? order.id}
        </h1>
      </div>

      <div className="card">
        <p>
          <strong>Client :</strong> {order.user?.email ?? "—"}
        </p>

        <p>
          <strong>Total avant remise :</strong> {subtotal.toFixed(2)} €
        </p>

        {order.discount > 0 && (
          <p>
            <strong>Remise :</strong> -{order.discount.toFixed(2)} €
          </p>
        )}

        <p>
          <strong>Total payé :</strong> {order.total.toFixed(2)} €
        </p>

        <p>
          <strong>Statut :</strong>{" "}
          <span className={`badge status-${order.status.toLowerCase()}`}>
            {getStatusLabel(order.status)}
          </span>
        </p>

        {order.rewardTitle && (
          <p>
            <strong>Récompense utilisée :</strong> {order.rewardTitle}
            {order.rewardSelectedOption
              ? ` — ${order.rewardSelectedOption}`
              : ""}
          </p>
        )}

        {order.welcomeOfferCode && (
          <p>
            <strong>Offre de bienvenue :</strong> {order.welcomeOfferCode}
          </p>
        )}

        <form className="status-form mt-3" action={updateStatus}>
          <select name="status" defaultValue={order.status} className="input">
            <option value="PENDING">En attente</option>
            <option value="PAID">Payée</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="COMPLETED">Terminée</option>
            <option value="CANCELLED">Annulée</option>
            <option value="CANCELLED_REFUNDED">Annulée et Remboursée</option>
          </select>

          <button className="btn btn-primary" type="submit">
            Mettre à jour
          </button>
        </form>

        <div className="order-items mt-3">
          <h3 className="section-title">Produits</h3>

          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product?.name ?? "Produit supprimé"} × {item.quantity} —{" "}
                {item.price.toFixed(2)} €
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <Link className="btn btn-outline" href="/admin/orders">
            ← Retour commandes
          </Link>
        </div>
      </div>
    </div>
  );
}