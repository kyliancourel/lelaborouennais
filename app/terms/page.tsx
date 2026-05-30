export const metadata = {
    title: "Conditions générales",
  };
  
  export default function TermsPage() {
    return (
      <main className="legal-page">
        <h1>Conditions générales de vente</h1>
  
        <p>
          Les présentes conditions générales concernent Le Labo Rouennais, boutique
          actuellement en phase de test.
        </p>
  
        <section>
          <h2>Produits</h2>
          <p>
            Le Labo Rouennais propose des objets décoratifs et accessoires de
            bureau fabriqués par impression 3D à Rouen en Normandie. Les produits
            sont fabriqués à la commande.
          </p>
        </section>
  
        <section>
          <h2>Zone de vente</h2>
          <p>
            La vente est actuellement limitée à la France, principalement à la
            métropole rouennaise.
          </p>
        </section>
  
        <section>
          <h2>Livraison</h2>
          <p>
            Aucun service de livraison n’est actuellement proposé. Les modalités de
            remise ou de retrait sont précisées au client selon la commande.
          </p>
        </section>
  
        <section>
          <h2>Prix et paiement</h2>
          <p>
            Les prix sont affichés en euros. Le paiement est réalisé en ligne via
            Stripe. La commande est validée après confirmation du paiement.
          </p>
        </section>
  
        <section>
          <h2>Programme fidélité</h2>
          <p>
            Les clients peuvent gagner des points après leurs commandes. Ces points
            permettent de débloquer des récompenses. Les points ne sont pas
            convertibles en argent et ne peuvent pas être remboursés.
          </p>
        </section>
  
        <section>
          <h2>Retours et rétractation</h2>
          <p>
            Le Labo Rouennais accepte les retours pendant un délai d’un mois après
            la commande, y compris pour les produits personnalisés. Le produit doit
            être retourné dans un état permettant sa vérification.
          </p>
        </section>
  
        <section>
          <h2>Phase de test</h2>
          <p>
            Le site étant en phase de test, certaines informations légales
            définitives, comme le SIRET, l’adresse professionnelle ou l’email SAV
            officiel, seront ajoutées lorsque l’activité sera déclarée.
          </p>
        </section>
      </main>
    );
  }