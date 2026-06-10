"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

type Props = {
  id: string;
  orderNumber?: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export default function OrderItem({
  id,
  orderNumber,
  total,
  status,
  createdAt,
}: Props) {
  const statusLabel = {
    PENDING: "En attente",
    PAID: "Payée",
    PREPARING : "En préparation",
    SHIPPED: "Expédiée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  }[status];

  return (
    <Card className="order-card">
      {/* HEADER */}
      <div className="order-header">
        <div>
          <span className="order-number">
            #{orderNumber ?? id.slice(0, 8)}
          </span>

          <p className="order-date">
            {new Date(createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <span className={`status-badge status-${status.toLowerCase()}`}>
          {statusLabel}
        </span>
      </div>

      {/* FOOTER */}
      <div className="order-footer">
        <strong>{total.toFixed(2)} €</strong>
      </div>

      {/* ACTION */}
      <div className="mt-3">
        <Link href={`/orders/${id}`}>
          <Button variant="secondary">Voir détail</Button>
        </Link>
      </div>
    </Card>
  );
}