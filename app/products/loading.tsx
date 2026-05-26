export default function LoadingProducts() {
  return (
    <div className="products-loading">
      <div className="skeleton products-loading-title" />

      <div className="products-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-skeleton-card">
            <div className="skeleton product-skeleton-image" />

            <div className="skeleton product-skeleton-title" />

            <div className="skeleton product-skeleton-price" />

            <div className="skeleton product-skeleton-button" />
          </div>
        ))}
      </div>
    </div>
  );
}