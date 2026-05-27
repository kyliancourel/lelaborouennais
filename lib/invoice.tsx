import React from "react";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image, // ✅ IMPORTANT ICI
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#111",
  },

  header: {
    marginBottom: 30,
  },

  logo: {
    width: 120,
    height: 60,
    marginBottom: 12,
  },

  brand: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    marginBottom: 4,
  },

  muted: {
    color: "#666",
    fontSize: 11,
  },

  section: {
    marginBottom: 24,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "solid",
    borderRadius: 6,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
  },

  rowHeader: {
    backgroundColor: "#f5f5f5",
  },

  cell: {
    flex: 1,
    padding: 10,
    fontSize: 11,
  },

  totalContainer: {
    marginTop: 24,
    alignItems: "flex-end",
  },

  total: {
    fontSize: 18,
    fontWeight: 700,
  },

  footer: {
    marginTop: 40,
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },

  legal: {
    marginTop: 30,
    fontSize: 9,
    color: "#777",
    lineHeight: 1.4,
  },
});

function InvoiceDocument({ order }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          
          <Image
            src="https://lelaborouennais.vercel.app/logo_clair.png" // ✅ IMPORTANT: URL publique (Vercel-safe)
            style={styles.logo}
          />

          <Text style={styles.brand}>
            Le Labo Rouennais
          </Text>

          <Text style={styles.title}>
            Facture #{order.orderNumber}
          </Text>

          <Text style={styles.muted}>
            Date :{" "}
            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>

        {/* CLIENT */}
        <View style={styles.section}>
          <Text>
            Client : {order.user?.name || "Client invité"}
          </Text>

          <Text>
            Email : {order.email}
          </Text>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={[styles.row, styles.rowHeader]}>
            <Text style={styles.cell}>Produit</Text>
            <Text style={styles.cell}>Qté</Text>
            <Text style={styles.cell}>Prix</Text>
          </View>

          {order.items.map((item: any) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>
                {item.product.name}
              </Text>

              <Text style={styles.cell}>
                {item.quantity}
              </Text>

              <Text style={styles.cell}>
                {item.price.toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        {/* TOTAL */}
        <View style={styles.totalContainer}>
          <Text style={styles.total}>
            Total : {order.total.toFixed(2)} €
          </Text>
        </View>

        {/* CONDITIONS DE VENTE */}
        <View style={styles.legal}>
          <Text>
            Garantie légale de conformité de 2 ans (UE).{"\n"}
            Droit de rétractation de 14 jours à compter de la réception.{"\n"}
            Les produits doivent être retournés en état d'origine.{"\n"}
            Les frais de retour peuvent être à la charge du client.{"\n"}
            Toute commande implique l'acceptation des conditions de vente.
          </Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Merci pour votre commande 🙌
        </Text>

      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(order: any) {
  const instance = pdf(<InvoiceDocument order={order} />);

  const buffer = await instance.toBuffer();

  return Buffer.from(buffer as any);
}