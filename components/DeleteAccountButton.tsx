"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

type Props = {
  points: number;
  email: string;
};

export default function DeleteAccountButton({ points, email }: Props) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<"LOSE" | "TRANSFER">("LOSE");
  const [transferEmail, setTransferEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  async function deleteAccount() {
    if (confirmText !== "SUPPRIMER") {
      alert("Tu dois écrire SUPPRIMER pour confirmer.");
      return;
    }

    if (points > 0 && choice === "TRANSFER" && !transferEmail.trim()) {
      alert("Indique l'email du compte qui recevra les points.");
      return;
    }

    const confirmFinal = confirm(
      `Confirmation suppression immédiate\n\nCompte : ${email}\nPoints : ${points}\nChoix : ${
        points > 0 && choice === "TRANSFER"
          ? `Transférer vers ${transferEmail}`
          : "Perdre les points"
      }\n\nCette action est définitive.`
    );

    if (!confirmFinal) return;

    setLoading(true);

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        choice,
        transferEmail,
        confirmText,
      }),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur lors de la suppression");
      return;
    }

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <div className="delete-account-zone">
      {!open ? (
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setOpen(true)}
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="delete-account-card">
          <h3>Supprimer mon compte</h3>

          <p className="text-muted">
            Cette action est immédiate et définitive. Ton compte sera supprimé.
            Tes commandes resteront conservées côté boutique mais détachées de
            ton compte.
          </p>

          {points > 0 ? (
            <>
              <p>
                Tu as actuellement <strong>{points} points</strong>.
              </p>

              <label className="radio-row">
                <input
                  type="radio"
                  checked={choice === "TRANSFER"}
                  onChange={() => setChoice("TRANSFER")}
                />
                Transférer mes points vers un compte existant
              </label>

              {choice === "TRANSFER" && (
                <input
                  className="input"
                  type="email"
                  placeholder="Email du compte destinataire"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                />
              )}

              <label className="radio-row">
                <input
                  type="radio"
                  checked={choice === "LOSE"}
                  onChange={() => setChoice("LOSE")}
                />
                Supprimer mon compte et perdre mes points
              </label>
            </>
          ) : (
            <p className="text-muted">
              Tu n'as aucun point fidélité à transférer.
            </p>
          )}

          <div className="delete-summary">
            <strong>Récapitulatif</strong>
            <p>Email : {email}</p>
            <p>Points : {points}</p>
            <p>
              Choix :{" "}
              {points > 0 && choice === "TRANSFER"
                ? `transfert vers ${transferEmail || "email non renseigné"}`
                : "perte des points"}
            </p>
          </div>

          <input
            className="input"
            placeholder='Écris "SUPPRIMER" pour confirmer'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={deleteAccount}
              disabled={loading}
            >
              {loading ? "Suppression..." : "Confirmer la suppression"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}