import Skeleton from "@/components/Skeleton";

export default function LoadingProducts() {
  return (
    <div className="products-page">
      <h1 className="page-title">Produits</h1>

      <div className="products-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-card">
            <Skeleton className="skeleton-lg" />

            <div style={{ padding: 14 }}>
              <Skeleton className="skeleton-md" />
              <div style={{ height: 10 }} />
              <Skeleton className="skeleton-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}