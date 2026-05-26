import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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

  // =========================
  // SERVER ACTION
  // =========================
  async function updateStatus(formData: FormData) {
    "use server";

    const status = formData.get("status");

    if (!status) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${order.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    // 🔥 refresh page data après update
    revalidatePath(`/admin/orders/${order.id}`);
  }

  return (
    <div>
      <h1>Commande #{order.orderNumber}</h1>

      <p>
        <strong>Client:</strong> {order.user?.email ?? "—"}
      </p>

      <p>
        <strong>Total:</strong> {order.total}€
      </p>

      <p>
        Statut : <strong>{order.status}</strong>
      </p>

      {/* ========================= */}
      {/* UPDATE STATUS FORM */}
      {/* ========================= */}
      <form action={updateStatus}>
        <select name="status" defaultValue={order.status}>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button type="submit">
          Mettre à jour
        </button>
      </form>

      {/* ========================= */}
      {/* ITEMS */}
      {/* ========================= */}
      <h3 style={{ marginTop: 20 }}>
        Produits
      </h3>

      <ul>
        {order.items.map(
          (item: {
            id: string;
            quantity: number;
            price: number;
            product: {
              name: string;
            };
          }) => (
          <li key={item.id}>
            {item.product.name} × {item.quantity} — {item.price}€
          </li>
        ))}
      </ul>

      {/* ========================= */}
      {/* BACK */}
      {/* ========================= */}
      <div className="mt-5">
        <Link href="/admin/orders">
          ← Retour commandes
        </Link>
      </div>
    </div>
  );
}