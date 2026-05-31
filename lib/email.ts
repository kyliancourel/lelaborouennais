import { resend } from "./resend";
import { generateInvoicePDF } from "./invoice";

const resendClient = resend();

const from = process.env.EMAIL_FROM!;
const replyTo = process.env.EMAIL_REPLY_TO || "sav@lelaborouennais.fr";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const html = `
    <div style="background:#0b0d11;padding:40px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:560px;margin:auto;background:#141922;border:1px solid #232936;border-radius:20px;padding:32px;">
        <h1 style="margin:0 0 12px;font-size:28px;">Confirme ton email</h1>

        <p style="color:#a1a8b3;line-height:1.6;">
          Merci pour ton inscription au Labo Rouennais.
          Clique sur le bouton ci-dessous pour activer ton compte.
        </p>

        <a href="${verifyUrl}"
          style="display:inline-block;margin-top:22px;padding:13px 18px;background:#fff;color:#000;text-decoration:none;border-radius:12px;font-weight:700;">
          Vérifier mon email
        </a>

        <p style="margin-top:28px;color:#6b7280;font-size:12px;">
          Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.
        </p>
      </div>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from,
    to,
    replyTo,
    subject: "Confirme ton email - Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    throw new Error("Verification email failed");
  }
}

export async function sendEmailChangeVerificationEmail(
  to: string,
  verifyUrl: string
) {
  const html = `
    <div style="background:#0b0d11;padding:40px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:560px;margin:auto;background:#141922;border:1px solid #232936;border-radius:20px;padding:32px;">
        <h1 style="margin:0 0 12px;font-size:28px;">Confirme ton nouvel email</h1>

        <p style="color:#a1a8b3;line-height:1.6;">
          Tu as demandé à modifier l'adresse email de ton compte Le Labo Rouennais.
          Clique sur le bouton ci-dessous pour confirmer ce nouvel email.
        </p>

        <a href="${verifyUrl}"
          style="display:inline-block;margin-top:22px;padding:13px 18px;background:#fff;color:#000;text-decoration:none;border-radius:12px;font-weight:700;">
          Confirmer mon nouvel email
        </a>

        <p style="margin-top:28px;color:#6b7280;font-size:12px;">
          Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.
          Ton email actuel restera inchangé.
        </p>
      </div>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from,
    to,
    replyTo,
    subject: "Confirme ton nouvel email - Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("EMAIL CHANGE VERIFICATION ERROR:", error);
    throw new Error("Email change verification failed");
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  const html = `
    <div style="background:#0b0d11;padding:40px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:560px;margin:auto;background:#141922;border:1px solid #232936;border-radius:20px;padding:32px;">
        <h1 style="margin:0 0 12px;font-size:28px;">
          Réinitialisation du mot de passe
        </h1>

        <p style="color:#a1a8b3;line-height:1.6;">
          Une demande de réinitialisation du mot de passe a été effectuée pour votre compte Le Labo Rouennais.
        </p>

        <a href="${resetUrl}"
          style="display:inline-block;margin-top:22px;padding:13px 18px;background:#fff;color:#000;text-decoration:none;border-radius:12px;font-weight:700;">
          Réinitialiser mon mot de passe
        </a>

        <p style="margin-top:24px;color:#a1a8b3;">
          Ce lien est valable pendant 1 heure.
        </p>

        <p style="margin-top:24px;color:#6b7280;font-size:12px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
        </p>
      </div>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from,
    to,
    replyTo,
    subject: "Réinitialisation du mot de passe - Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("PASSWORD RESET EMAIL ERROR:", error);
    throw new Error("Password reset email failed");
  }
}

export async function sendWelcomeOfferEmail(
  to: string,
  offer: {
    code: string;
    value: number;
    type?: string;
  }
) {
  const html = `
    <div style="background:#0b0d11;padding:40px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:560px;margin:auto;background:#141922;border:1px solid #232936;border-radius:20px;padding:32px;">
        <p style="color:#a1a8b3;margin:0 0 8px;">Offre de bienvenue</p>

        <h1 style="margin:0 0 12px;font-size:28px;">
          Bienvenue au Labo Rouennais
        </h1>

        <p style="color:#a1a8b3;line-height:1.6;">
          Voici ta récompense de bienvenue à utiliser lors de ta première commande.
        </p>

        <div style="margin:24px 0;padding:18px;background:#0b0d11;border:1px solid #232936;border-radius:16px;text-align:center;">
          <p style="margin:0 0 8px;color:#a1a8b3;">Ton code</p>

          <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:0.08em;">
            ${offer.code}
          </p>
        </div>

        <p style="color:#a1a8b3;line-height:1.6;">
          Avantage :
          <strong style="color:#fff;">
            ${offer.value} % de réduction
          </strong>
        </p>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart"
          style="display:inline-block;margin-top:20px;padding:13px 18px;background:#fff;color:#000;text-decoration:none;border-radius:12px;font-weight:700;">
          Utiliser mon code
        </a>

        <p style="margin-top:28px;color:#6b7280;font-size:12px;">
          Offre valable une seule fois, uniquement lors de la première commande.
          Pour toute question, répondez simplement à cet email.
        </p>
      </div>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from,
    to,
    replyTo,
    subject: "Ton offre de bienvenue - Le Labo Rouennais",
    html,
  });

  if (error) {
    console.error("WELCOME OFFER EMAIL ERROR:", error);
    throw new Error("Welcome offer email failed");
  }
}

export async function sendOrderEmail(to: string, order: any) {
  const invoicePdf = await generateInvoicePDF(order);

  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #232936;color:#fff;">
            ${item.product?.name ?? "Produit"}
          </td>

          <td style="padding:12px 0;border-bottom:1px solid #232936;color:#a1a8b3;text-align:center;">
            ${item.quantity}
          </td>

          <td style="padding:12px 0;border-bottom:1px solid #232936;color:#fff;text-align:right;">
            ${Number(item.price).toFixed(2)} €
          </td>
        </tr>
      `
    )
    .join("");

  const rewardHtml = order.rewardTitle
    ? `
      <div style="margin:24px 0;background:#11141a;border:1px solid #232936;border-radius:16px;padding:18px;">
        <p style="color:#a1a8b3;margin:0 0 6px;">Récompense utilisée</p>

        <p style="margin:0;color:#fff;font-weight:700;">
          ${order.rewardTitle}
        </p>

        ${
          order.rewardSelectedOption
            ? `<p style="margin:8px 0 0;color:#a1a8b3;">Choix : ${order.rewardSelectedOption}</p>`
            : ""
        }

        ${
          order.discount > 0
            ? `<p style="margin:8px 0 0;color:#a1a8b3;">Remise appliquée : ${Number(
                order.discount
              ).toFixed(2)} €</p>`
            : ""
        }
      </div>
    `
    : "";

  const welcomeOfferHtml = order.welcomeOfferCode
    ? `
      <div style="margin:24px 0;background:#11141a;border:1px solid #232936;border-radius:16px;padding:18px;">
        <p style="color:#a1a8b3;margin:0 0 6px;">Offre de bienvenue utilisée</p>

        <p style="margin:0;color:#fff;font-weight:700;">
          Code : ${order.welcomeOfferCode}
        </p>

        ${
          order.welcomeOfferValue > 0
            ? `<p style="margin:8px 0 0;color:#a1a8b3;">Réduction : ${Number(
                order.welcomeOfferValue
              ).toFixed(0)} %</p>`
            : ""
        }
      </div>
    `
    : "";

  const html = `
    <div style="background:#0b0d11;padding:40px;font-family:Arial,sans-serif;color:#fff;">
      <div style="max-width:680px;margin:auto;background:#141922;border:1px solid #232936;border-radius:24px;overflow:hidden;">
        <div style="padding:32px;border-bottom:1px solid #232936;">
          <h1 style="margin:0;font-size:30px;letter-spacing:-0.04em;">
            Commande confirmée
          </h1>

          <p style="margin:12px 0 0;color:#a1a8b3;line-height:1.6;">
            Merci pour votre commande. Chaque création est produite avec soin à Rouen en Normandie.
          </p>
        </div>

        <div style="padding:32px;">
          <p style="color:#a1a8b3;margin:0 0 6px;">Numéro de commande</p>

          <p style="font-size:20px;font-weight:700;margin:0 0 24px;">
            ${order.orderNumber}
          </p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr>
                <th style="text-align:left;color:#6b7280;font-size:12px;padding-bottom:10px;">Produit</th>
                <th style="text-align:center;color:#6b7280;font-size:12px;padding-bottom:10px;">Qté</th>
                <th style="text-align:right;color:#6b7280;font-size:12px;padding-bottom:10px;">Prix</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          ${rewardHtml}

          ${welcomeOfferHtml}

          <div style="display:flex;justify-content:space-between;align-items:center;background:#11141a;border:1px solid #232936;border-radius:16px;padding:18px;">
            <span style="color:#a1a8b3;">Total payé</span>

            <strong style="font-size:22px;">
              ${Number(order.total).toFixed(2)} €
            </strong>
          </div>

          <p style="margin-top:24px;color:#a1a8b3;line-height:1.6;">
            Votre facture PDF est jointe à cet email.
          </p>

          <p style="margin-top:12px;color:#a1a8b3;line-height:1.6;">
            Besoin d'aide ? Répondez à cet email ou contactez-nous à
            <strong style="color:#fff;"> ${replyTo}</strong>.
          </p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
            style="display:inline-block;margin-top:12px;padding:13px 18px;background:#fff;color:#000;text-decoration:none;border-radius:12px;font-weight:700;">
            Voir mes commandes
          </a>
        </div>

        <div style="padding:24px 32px;border-top:1px solid #232936;color:#6b7280;font-size:12px;line-height:1.6;">
          Le Labo Rouennais — Rouen, Normandie, France<br />
          Contact / SAV : ${replyTo}<br />
          Site actuellement en phase de test.
        </div>
      </div>
    </div>
  `;

  const { error } = await resendClient.emails.send({
    from,
    to,
    replyTo,
    subject: `Commande ${order.orderNumber} confirmée - Le Labo Rouennais`,
    html,
    attachments: [
      {
        filename: `facture-${order.orderNumber}.pdf`,
        content: invoicePdf.toString("base64"),
      },
    ],
  });

  if (error) {
    console.error("ORDER EMAIL ERROR:", error);
    throw new Error("Order email failed");
  }
}