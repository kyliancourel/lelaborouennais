import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Laboratoire de la Seine",
    template: "%s | Labo Seine",
  },

  description:
    "Boutique premium de création et impression 3D en France.",

  keywords: [
    "3D printing",
    "impression 3D",
    "France",
    "design",
    "objets 3D",
  ],

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL!
  ),

  openGraph: {
    title: "Le Labo Rouennais",
    description:
      "Objets 3D premium fabriqués en France",
    url: "/",
    siteName: "Labo Seine",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="site-body">
        <Providers>
          <CartProvider>
            <Navbar />

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  background: "#111",
                  color: "#fff",
                },
              }}
            />

            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}