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

      <!-- HEADER -->
      <div style="
        background:#0a0a0a;
        padding:24px;
        text-align:center;
      ">
        <h1 style="
          margin:0;
          color:white;
          font-size:20px;
          letter-spacing:0.5px;
        ">
          Le Labo Rouennais
        </h1>
      </div>

      <!-- CONTENT -->
      <div style="padding:40px 32px;">
        ${content}
      </div>

      <!-- FOOTER -->
      <div style="
        padding:24px;
        text-align:center;
        background:#fafafa;
        font-size:12px;
        color:#888;
      ">
        © ${new Date().getFullYear()} Le Labo Rouennais
      </div>

    </div>
  </div>
  `;
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  const html = baseTemplate(`
    <h2 style="
      margin-top:0;
      font-size:26px;
      color:#111;
    ">
      Confirme ton email 👋
    </h2>

    <p style="
      font-size:16px;
      line-height:1.7;
      color:#444;
    ">
      Merci pour ton inscription sur
      <strong>Le Labo Rouennais</strong>.
    </p>

    <p style="
      font-size:16px;
      line-height:1.7;
      color:#444;
    ">
      Clique sur le bouton ci-dessous pour activer ton compte.
    </p>

    <div style="text-align:center;margin:40px 0;">
      <a
        href="${verifyUrl}"
        style="
          display:inline-block;
          background:#000;
          color:#fff;
          text-decoration:none;
          padding:14px 22px;
          border-radius:12px;
          font-weight:600;
          font-size:15px;
        "
      >
        Vérifier mon email
      </a>
    </div>

    <p style="
      font-size:13px;
      color:#777;
      line-height:1.6;
    ">
      Ce lien expirera dans 24 heures.
    </p>

    <p style="
      font-size:12px;
      color:#999;
      word-break:break-all;
      margin-top:20px;
    ">
      ${verifyUrl}
    </p>
  `);

  const { error } = await resend.emails.send({
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