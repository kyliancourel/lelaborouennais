import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
    marginBottom: 14,
  },
  section: { marginBottom: 20 },
  table: { marginTop: 10 },
  row: { flexDirection: "row" },
  cell: { flex: 1, padding: 5 },
  total: { marginTop: 20, fontSize: 16, fontWeight: 700 },
  legal: {
    marginTop: 30,
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
  },
});

function InvoiceDocument({ order }: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <Image
          src="https://lelaborouennais.vercel.app/logo_clair.png"
          style={styles.logo}
        />

        <Text>Facture #{order.orderNumber}</Text>

        <View style={styles.section}>
          <Text>Client: {order.user?.name || "Invité"}</Text>
          <Text>Email: {order.email}</Text>
        </View>

        <View style={styles.table}>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.product.name}</Text>
              <Text style={styles.cell}>{item.quantity}</Text>
              <Text style={styles.cell}>
                {item.price.toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>
          Total: {order.total.toFixed(2)} €
        </Text>

        <View style={styles.legal}>
          <Text>
            CONDITIONS GÉNÉRALES DE VENTE{"\n\n"}
            Garantie légale de conformité : 2 ans (UE).{"\n"}
            Droit de rétractation : 14 jours.{"\n"}
            Retour sous état d’origine requis.{"\n"}
            Les frais de retour peuvent être à la charge du client.{"\n\n"}
            Toute commande implique l’acceptation des CGV.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/* ✅ FIX IMPORTANT ICI */
export async function generateInvoicePDF(order: any) {
  const instance = pdf(<InvoiceDocument order={order} />);

  const stream = await instance.toBuffer();

  const chunks: Buffer[] = [];

  for await (const chunk of stream as any) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}