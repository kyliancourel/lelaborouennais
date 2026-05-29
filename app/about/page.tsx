import Link from "next/link";

export const metadata = {
  title: "À propos",
  description:
    "Découvrez Le Labo Rouennais, une marque premium d’objets 3D conçus et imprimés à Rouen en Normandie.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="about-eyebrow">À propos</p>

        <h1>Le Labo Rouennais</h1>

        <p>
          Des objets 3D premium, pensés pour sublimer le quotidien, conçus et
          imprimés à Rouen en Normandie.
        </p>

        <div className="about-actions">
          <Link href="/products" className="btn btn-primary">
            Découvrir la boutique
          </Link>

          <Link href="/account/loyalty" className="btn btn-outline">
            Programme fidélité
          </Link>
        </div>
      </section>

      <section className="about-section about-split">
        <div>
          <p className="about-eyebrow">Fabrication</p>
          <h2>Une production locale, précise et soignée</h2>
        </div>

        <p>
        Le Labo Rouennais propose une sélection d’objets décoratifs et
d’accessoires de bureau fabriqués par impression 3D. Nous privilégions
des créations au design soigné et aux lignes modernes, puis les
produisons avec exigence à Rouen en Normandie afin de garantir des
finitions de qualité et une expérience premium.
        </p>
      </section>

      <section className="about-values">
        <div className="about-value-card">
          <span>⚙️</span>
          <h3>Précision</h3>
          <p>
            Des objets imprimés avec soin, utiles et
            agréables à utiliser.
          </p>
        </div>

        <div className="about-value-card">
          <span>🖤</span>
          <h3>Design premium</h3>
          <p>
            Une esthétique sobre, moderne et élégante pour s’intégrer facilement
            dans un intérieur ou un bureau.
          </p>
        </div>

        <div className="about-value-card">
          <span>📍</span>
          <h3>Rouen, Normandie</h3>
          <p>
            Une marque locale, créée autour d’une production maîtrisée et proche
            de ses clients.
          </p>
        </div>
      </section>

      <section className="about-section about-loyalty">
        <div>
          <p className="about-eyebrow">Fidélité</p>
          <h2>Un programme pensé pour récompenser les clients</h2>
        </div>

        <p>
          À chaque commande, les clients gagnent des points fidélité. Ces points
          permettent ensuite de débloquer des récompenses, coupons et avantages
          exclusifs selon leur niveau : Bronze, Silver, Gold ou VIP.
        </p>
      </section>

      <section className="about-cta">
        <h2>Découvrez nos créations</h2>

        <p>
          Objets déco, accessoires de bureau et pièces design imprimées en 3D à
          Rouen.
        </p>

        <Link href="/products" className="btn btn-primary">
          Voir les produits
        </Link>
      </section>
    </div>
  );
}