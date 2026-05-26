import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  title: { fontSize: 20, marginBottom: 15 },
  section: { marginBottom: 10 },
});

export function InvoicePDF({ order }: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>
          FACTURE {order.orderNumber}
        </Text>

        <View style={styles.section}>
          <Text>Client: {order.user.name}</Text>
          <Text>Email: {order.user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text>Total: {order.total}€</Text>
        </View>

        <View style={styles.section}>
          <Text>Produits :</Text>

          {order.items.map((item: any) => (
            <Text key={item.id}>
              {item.quantity} × {item.product.name} — {item.price}€
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}