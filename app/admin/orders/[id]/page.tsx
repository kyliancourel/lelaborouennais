import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    return <div>Commande introuvable</div>;
  }

  async function updateStatus(formData: FormData) {
    "use server";

    const status = formData.get("status");

    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${order.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
  }

  return (
    <div>
      <h1>Commande #{order.orderNumber}</h1>

      <p>Client: {order.user?.email ?? "—"}</p>
      <p>Total: {order.total}€</p>

      <p>
        Statut : <strong>{order.status}</strong>
      </p>

      <form action={updateStatus}>
        <select name="status" defaultValue={order.status}>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button>
          Mettre à jour
        </button>
      </form>

      <h3 style={{ marginTop: 20 }}>Produits</h3>

      <ul>
        {order.items.map((item: any) => (
          <li key={item.id}>
            {item.product.name} × {item.quantity} — {item.price}€
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Link href="/admin/orders"> ← Retour commandes </Link>
      </div>
    </div>
  );
}