import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Le Labo Rouennais</p>

        <div className="footer-links">
          <Link href="/privacy-policy">Confidentialité</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/terms">Conditions générales</Link>
        </div>
      </div>
    </footer>
  );
}