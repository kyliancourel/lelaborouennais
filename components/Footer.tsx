import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <p>© {new Date().getFullYear()} Le Labo Rouennais</p>

          <a className="footer-sav" href="mailto:sav@lelaborouennais.fr">
            Contact / SAV : sav@lelaborouennais.fr
          </a>
        </div>

        <div className="footer-links">
          <Link href="/privacy-policy">Confidentialité</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/terms">Conditions générales</Link>
        </div>
      </div>
    </footer>
  );
}