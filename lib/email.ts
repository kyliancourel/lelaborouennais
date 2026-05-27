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

const resendClient = resend();

/* =========================
   EMAIL VERIFICATION
========================= */
export async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  const html = baseTemplate(`
    <h2>Confirme ton email 👋</h2>

    <p>Merci pour ton inscription.</p>

    <div style="text-align:center;margin:40px 0;">
      <a href="${verifyUrl}"
        style="background:#000;color:#fff;padding:14px 22px;border-radius:12px;text-decoration:none;">
        Vérifier mon email
      </a>
    </div>
  `);

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Confirme ton email — Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("RESEND ERROR:", error);
    throw new Error("Erreur envoi email");
  }
}

/* =========================
   EMAIL COMMANDE
========================= */
export async function sendOrderEmail(
  to: string,
  order: {
    orderNumber: string;
    total: number;
    items: { name: string; quantity: number; price: number }[];
  }
) {
  const html = baseTemplate(`
    <h2>Commande confirmée 🎉</h2>

    <p><strong>Commande :</strong> ${order.orderNumber}</p>
    <p><strong>Total :</strong> ${order.total.toFixed(2)} €</p>

    <hr style="margin:20px 0;" />

    <h3>Détails :</h3>

    ${order.items
      .map(
        (i) => `
        <p>
          ${i.name} — x${i.quantity} — ${i.price} €
        </p>
      `
      )
      .join("")}

    <p style="margin-top:30px;">
      Merci pour ta commande 🙌
    </p>
  `);

  const { error } = await resendClient.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Commande ${order.orderNumber} — confirmation`,
    html,
  });

  if (error) {
    console.error("RESEND ERROR:", error);
    throw new Error("Erreur envoi email commande");
  }
}