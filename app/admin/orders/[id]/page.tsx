import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type OrderItemWithProduct = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string | null;
  } | null;
};

export default async function AdminOrderDetailPage({
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
    return (
      <div className="admin-page">
        <p className="admin-empty">Commande introuvable</p>
      </div>
    );
  }

  const orderId = order.id;

  async function updateStatus(formData: FormData) {
    "use server";

    const status = formData.get("status");

    if (!status) return;

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    revalidatePath(`/admin/orders/${orderId}`);
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">
          Commande #{order.orderNumber ?? order.id}
        </h1>
      </div>

      <div className="card">
        <div className="order-info">
          <p>
            <span className="label">Client :</span>{" "}
            {order.user?.email ?? "—"}
          </p>

          <p>
            <span className="label">Total :</span>{" "}
            <strong>{order.total}€</strong>
          </p>

          <p>
            <span className="label">Statut :</span>{" "}
            <span className={`badge status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </p>
        </div>

        <form className="status-form" action={updateStatus}>
          <select name="status" defaultValue={order.status} className="input">
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button className="btn btn-primary" type="submit">
            Mettre à jour
          </button>
        </form>

        <div className="order-items">
          <h3 className="section-title">Produits</h3>

          <ul>
            {order.items.map((item: OrderItemWithProduct) => (
              <li key={item.id}>
                {item.product?.name ?? "Produit supprimé"} × {item.quantity} —{" "}
                {item.price}€
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <Link className="btn btn-secondary" href="/admin/orders">
            ← Retour commandes
          </Link>
        </div>
      </div>
    </div>
  );
}