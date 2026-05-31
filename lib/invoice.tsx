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
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  logo: {
    width: 58,
    height: 58,
    objectFit: "contain",
    marginBottom: 6,
  },

  brandName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },

  muted: {
    color: "#6b7280",
    lineHeight: 1.5,
  },

  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    textAlign: "right",
    marginBottom: 8,
  },

  invoiceMeta: {
    textAlign: "right",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  block: {
    marginBottom: 14,
  },

  blockTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },

  customerBox: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },

  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  productCell: {
    flex: 2,
  },

  qtyCell: {
    flex: 0.6,
    textAlign: "center",
  },

  priceCell: {
    flex: 0.8,
    textAlign: "right",
  },

  rewardBox: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },

  rewardTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },

  totalBox: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 230,
    padding: 12,
    backgroundColor: "#111111",
    color: "#ffffff",
    borderRadius: 10,
  },

  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  totalLabel: {
    fontSize: 10,
    color: "#d1d5db",
  },

  totalValueSmall: {
    fontSize: 10,
    color: "#ffffff",
  },

  totalFinalLabel: {
    fontSize: 10,
    color: "#d1d5db",
    marginTop: 6,
    marginBottom: 5,
  },

  totalValue: {
    fontSize: 22,
    fontWeight: 700,
  },

  message: {
    marginTop: 18,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    lineHeight: 1.4,
    color: "#374151",
  },

  legal: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 22,
    fontSize: 7,
    color: "#6b7280",
    lineHeight: 1.3,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getSubtotal(order: any) {
  return order.items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );
}

function InvoiceDocument({ order }: any) {
  const subtotal = getSubtotal(order);
  const discount = Number(order.discount || 0);
  const totalPaid = Number(order.total || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Image
              src="https://lelaborouennais.vercel.app/logo_clair.png"
              style={styles.logo}
            />

            <Text style={styles.brandName}>Le Labo Rouennais</Text>
            <Text style={styles.muted}>Rouen — Normandie — France</Text>
            <Text style={styles.muted}>Site actuellement en phase de test</Text>
          </View>

          <View>
            <Text style={styles.invoiceTitle}>Facture</Text>
            <Text style={styles.invoiceMeta}>N° {order.orderNumber}</Text>
            <Text style={styles.invoiceMeta}>
              Date : {formatDate(order.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Client</Text>

          <View style={styles.customerBox}>
            <Text>
              {`${order.user?.firstname || ""} ${order.user?.lastname || ""}`.trim() ||
                order.user?.username ||
                "Client invité"}
            </Text>
            <Text style={styles.muted}>{order.email}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Détail de la commande</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.productCell}>Produit</Text>
              <Text style={styles.qtyCell}>Qté</Text>
              <Text style={styles.priceCell}>Prix</Text>
            </View>

            {order.items.map((item: any) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.productCell}>
                  {item.product?.name ?? "Produit"}
                </Text>

                <Text style={styles.qtyCell}>{item.quantity}</Text>

                <Text style={styles.priceCell}>
                  {Number(item.price).toFixed(2)} €
                </Text>
              </View>
            ))}
          </View>
        </View>

        {order.rewardTitle && (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardTitle}>Récompense utilisée</Text>

            <Text>{order.rewardTitle}</Text>

            {order.rewardSelectedOption && (
              <Text style={styles.muted}>
                Choix : {order.rewardSelectedOption}
              </Text>
            )}

            {discount > 0 && (
              <Text style={styles.muted}>
                Remise appliquée : {discount.toFixed(2)} €
              </Text>
            )}
          </View>
        )}

        <View style={styles.totalBox}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total avant remise</Text>
            <Text style={styles.totalValueSmall}>
              {subtotal.toFixed(2)} €
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Remise</Text>
              <Text style={styles.totalValueSmall}>
                -{discount.toFixed(2)} €
              </Text>
            </View>
          )}

          <Text style={styles.totalFinalLabel}>Total payé</Text>
          <Text style={styles.totalValue}>{totalPaid.toFixed(2)} €</Text>
        </View>

        <View style={styles.message}>
          <Text>
            Chaque création est produite avec soin à Rouen. Merci de soutenir
            une fabrication locale et une sélection d’objets imprimés en 3D avec
            exigence.
          </Text>
        </View>

        <View style={styles.legal}>
          <Text>
            Le Labo Rouennais — Rouen, Normandie, France. Site en phase de test.
            Produits fabriqués à la commande. Aucun service de livraison
            actuellement. Retours acceptés pendant un mois après commande. Toute
            commande implique l’acceptation des CGV.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(order: any) {
  const instance = pdf(<InvoiceDocument order={order} />);
  const stream = await instance.toBuffer();

  const chunks: Buffer[] = [];

  for await (const chunk of stream as any) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}