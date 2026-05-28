import { resend } from "./resend";
import { generateInvoicePDF } from "./invoice";

const resendClient = resend();

/* =========================
   EMAIL VERIFICATION
========================= */
export async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  const html = `
    <h2>Confirme ton email 👋</h2>
    <p>Merci pour ton inscription.</p>

    <a href="${verifyUrl}"
       style="display:inline-block;margin-top:20px;padding:12px 18px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">
      Vérifier mon email
    </a>
  `;

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Confirme ton email - Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    throw new Error("Verification email failed");
  }
}

/* =========================
   EMAIL COMMANDE + FACTURE PDF
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
        content: invoicePdf,
      },
    ],
  });

  if (error) {
    console.error("ORDER EMAIL ERROR:", error);
    throw new Error("Order email failed");
  }
}