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
    padding: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111111",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
    marginBottom: 5,
  },

  brandName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 3,
  },

  muted: {
    color: "#6b7280",
    lineHeight: 1.35,
  },

  invoiceTitle: {
    fontSize: 25,
    fontWeight: 700,
    textAlign: "right",
    marginBottom: 6,
  },

  invoiceMeta: {
    textAlign: "right",
    color: "#6b7280",
    lineHeight: 1.35,
  },

  block: {
    marginBottom: 10,
  },

  blockTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },

  infoBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    backgroundColor: "#fafafa",
    lineHeight: 1.35,
  },

  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    paddingVertical: 7,
    paddingHorizontal: 9,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  productCell: {
    flex: 2,
  },

  qtyCell: {
    flex: 0.5,
    textAlign: "center",
  },

  priceCell: {
    flex: 0.8,
    textAlign: "right",
  },

  rewardBox: {
    marginTop: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 9,
    backgroundColor: "#fafafa",
  },

  rewardTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },

  totalBox: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 220,
    padding: 10,
    backgroundColor: "#111111",
    color: "#ffffff",
    borderRadius: 9,
  },

  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  totalLabel: {
    fontSize: 9,
    color: "#d1d5db",
  },

  totalValueSmall: {
    fontSize: 9,
    color: "#ffffff",
  },

  totalFinalLabel: {
    fontSize: 9,
    color: "#d1d5db",
    marginTop: 5,
    marginBottom: 4,
  },

  totalValue: {
    fontSize: 20,
    fontWeight: 700,
  },

  message: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 9,
    lineHeight: 1.3,
    color: "#374151",
  },

  legal: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 20,
    fontSize: 6.5,
    color: "#6b7280",
    lineHeight: 1.25,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 7,
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

function getClientName(order: any) {
  const lastname = String(order.user?.lastname || "").trim().toUpperCase();
  const firstname = String(order.user?.firstname || "").trim();

  return `${lastname} ${firstname}`.trim() || "Client invité";
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

          <View style={styles.infoBox}>
            <Text>Nom / Prénom : {getClientName(order)}</Text>
            <Text>Email : {order.email}</Text>

            {order.user?.username && (
              <Text>Pseudo : {order.user.username}</Text>
            )}

            <Text>
              Points accumulés : {Number(order.pointsBeforeOrder || 0)} pts
            </Text>

            <Text>
              Points cumulés avec la commande :{" "}
              {Number(order.pointsEarned || 0)} pts
            </Text>

            <Text>
              Point total : {Number(order.pointsAfterOrder || 0)} pts
            </Text>

            <Text>
              Niveau actuel suite à cette commande :{" "}
              {order.loyaltyTierAfterOrder || order.user?.loyaltyTier || "BRONZE"}
            </Text>
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
          </View>
        )}

        {order.welcomeOfferCode && (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardTitle}>Offre de bienvenue utilisée</Text>
            <Text>Code : {order.welcomeOfferCode}</Text>

            {order.welcomeOfferValue > 0 && (
              <Text style={styles.muted}>
                Réduction : {Number(order.welcomeOfferValue).toFixed(0)} %
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