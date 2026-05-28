import { resend } from "./resend";
import { generateInvoicePDF } from "./invoice";

const resendClient = resend();

/* =========================
   EMAIL COMMANDE + FACTURE
========================= */
export async function sendOrderEmail(to: string, order: any) {
  const invoicePdf = await generateInvoicePDF(order);

  const html = `
    <h2>Commande confirmée 🎉</h2>

    <p><strong>Commande :</strong> ${order.orderNumber}</p>
    <p><strong>Total :</strong> ${order.total.toFixed(2)} €</p>

    <p>Votre facture PDF est jointe à cet email.</p>
  `;

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Commande ${order.orderNumber} - confirmation`,
    html,

    attachments: [
      {
        filename: `facture-${order.orderNumber}.pdf`,

        // ✅ FIX CRUCIAL
        content: invoicePdf.toString("base64"),
      },
    ],
  });

  if (error) {
    console.error("ORDER EMAIL ERROR:", error);
    throw new Error("Order email failed");
  }
}