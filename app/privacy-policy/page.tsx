export const metadata = {
    title: "Politique de confidentialité",
  };
  
  export default function PrivacyPolicyPage() {
    return (
      <main className="legal-page">
        <h1>Politique de confidentialité</h1>
  
        <p>
          Le Labo Rouennais est actuellement un site en phase de test. Cette
          politique explique comment les données sont utilisées sur la boutique.
        </p>
  
        <section>
          <h2>Données collectées</h2>
          <p>
            Nous pouvons collecter les informations nécessaires à la création du
            compte, au suivi des commandes et au programme fidélité : nom, prénom,
            email, historique de commandes, points fidélité et récompenses.
          </p>
        </section>
  
        <section>
          <h2>Utilisation des données</h2>
          <p>
            Les données sont utilisées pour gérer le compte client, les commandes,
            les paiements, les emails de confirmation, les factures et le programme
            fidélité.
          </p>
        </section>
  
        <section>
          <h2>Paiement</h2>
          <p>
            Les paiements sont traités par Stripe. Le Labo Rouennais ne stocke pas
            les coordonnées bancaires complètes des clients.
          </p>
        </section>
  
        <section>
          <h2>Durée de conservation</h2>
          <p>
            Les données sont conservées le temps nécessaire à la gestion du compte,
            des commandes, du service client et des obligations légales applicables.
          </p>
        </section>
  
        <section>
          <h2>Droits utilisateur</h2>
          <p>
            Chaque utilisateur peut demander l’accès, la rectification ou la
            suppression de ses données. Une fonctionnalité de suppression de compte
            est disponible depuis l’espace client.
          </p>
        </section>
  
        <section>
          <h2>Contact</h2>
          <p>
            Le Labo Rouennais étant en phase de test, un email de contact officiel
            sera ajouté prochainement.
          </p>
        </section>
      </main>
    );
  }