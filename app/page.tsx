import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <h1 className="home-title">Le Labo Rouennais</h1>

        <p className="home-subtitle">
          Objets 3D premium imprimés en France.
        </p>

        <div className="home-actions">
          <Link href="/products" className="btn btn-primary">
            Voir la boutique
          </Link>

          <Link href="/about" className="btn btn-outline">
            En savoir plus
          </Link>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="home-features">
        <div className="home-feature">
          <h3>🇫🇷 Fabrication locale</h3>
          <p>Impression 3D réalisée en France avec soin.</p>
        </div>

        <div className="home-feature">
          <h3>⚙️ Haute précision</h3>
          <p>Pièces propres, finitions modernes et solides.</p>
        </div>

        <div className="home-feature">
          <h3>✅ Sélection unique</h3>
          <p>Une sélection d’objets décoratifs et d’accessoires de bureau</p>
        </div>
      </section>

    </div>
  );
}