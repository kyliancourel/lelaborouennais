import Skeleton from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="orders-page">
      <h1 className="page-title">Mes commandes</h1>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="order-card">
          <Skeleton className="skeleton-md" />
          <div style={{ height: 12 }} />
          <Skeleton className="skeleton-sm" />
        </div>
      ))}
    </div>
  );
}