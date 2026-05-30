export const metadata = {
    title: "Politique des cookies",
  };
  
  export default function CookiePolicyPage() {
    return (
      <main className="legal-page">
        <h1>Politique des cookies</h1>
  
        <p>
          Cette page explique l’utilisation des cookies et traceurs sur Le Labo
          Rouennais.
        </p>
  
        <section>
          <h2>Cookies nécessaires</h2>
          <p>
            Certains cookies sont nécessaires au fonctionnement du site, notamment
            pour la session utilisateur, le panier et la sécurité du compte.
          </p>
        </section>
  
        <section>
          <h2>Cookies de paiement</h2>
          <p>
            Stripe peut utiliser des cookies ou technologies similaires pour
            sécuriser le paiement et prévenir la fraude.
          </p>
        </section>
  
        <section>
          <h2>Cookies statistiques ou marketing</h2>
          <p>
            À ce stade de test, Le Labo Rouennais n’utilise pas volontairement de
            cookies publicitaires. Si des outils statistiques ou marketing sont
            ajoutés plus tard, cette politique sera mise à jour.
          </p>
        </section>
  
        <section>
          <h2>Gestion des cookies</h2>
          <p>
            Vous pouvez configurer votre navigateur pour bloquer ou supprimer les
            cookies. Certains cookies nécessaires peuvent toutefois être
            indispensables au bon fonctionnement du site.
          </p>
        </section>
      </main>
    );
  }