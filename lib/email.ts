import { resend } from "./resend";

function baseTemplate(content: string) {
  return `
  <div style="
    margin:0;
    padding:40px 20px;
    background:#f5f5f5;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  ">
    <div style="
      max-width:560px;
      margin:0 auto;
      background:#ffffff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,0.08);
    ">
      <div style="background:#0a0a0a;padding:24px;text-align:center;">
        <h1 style="margin:0;color:white;font-size:20px;">
          Le Labo Rouennais
        </h1>
      </div>

      <div style="padding:40px 32px;">
        ${content}
      </div>

      <div style="padding:24px;text-align:center;background:#fafafa;font-size:12px;color:#888;">
        © ${new Date().getFullYear()} Le Labo Rouennais
      </div>
    </div>
  </div>
  `;
}

/* =========================
   EMAIL COMMANDE
========================= */

export async function sendOrderEmail(
  to: string,
  order: {
    orderNumber: string;
    total: number;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }
) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;">${item.name}</td>
        <td style="text-align:center;">x${item.quantity}</td>
        <td style="text-align:right;">${item.price} €</td>
      </tr>
    `
    )
    .join("");

  const html = baseTemplate(`
    <h2>Commande confirmée 🎉</h2>

    <p>Merci pour ta commande <strong>#${order.orderNumber}</strong></p>

    <table style="width:100%;margin:20px 0;border-collapse:collapse;font-size:14px;">
      ${itemsHtml}
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

    <p style="font-size:16px;">
      <strong>Total : ${order.total} €</strong>
    </p>

    <p style="margin-top:30px;color:#666;font-size:13px;">
      Tu recevras un email dès que ta commande sera expédiée.
    </p>
  `);

  const resendClient = resend();

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Commande confirmée #${order.orderNumber}`,
    html,
  });

  if (error) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Erreur envoi email commande");
  }
}