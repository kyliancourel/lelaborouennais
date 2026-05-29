"use client";

import { signOut } from "next-auth/react";
import { useUserLoyalty } from "@/hooks/useUserLoyalty";
import { useState } from "react";

export default function DeleteAccountPage() {
  const { user } = useUserLoyalty();

  const [choice, setChoice] = useState<"TRANSFER" | "LOSE">("LOSE");
  const [transferEmail, setTransferEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const points = user?.points ?? 0;
  const hasPoints = points > 0;

  async function deleteAccount() {
    if (confirmText !== "SUPPRIMER") {
      alert("Écris SUPPRIMER pour confirmer.");
      return;
    }

    if (hasPoints && choice === "TRANSFER" && !transferEmail) {
      alert("Indique l'email du compte qui recevra les points.");
      return;
    }

    const ok = confirm(
      "Confirmer la suppression immédiate du compte ? Cette action est irréversible."
    );

    if (!ok) return;

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

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Erreur suppression compte");
      return;
    }

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <div className="account-danger-page">
      <div className="account-danger-card">
        <h1>Supprimer mon compte</h1>

        <p className="text-muted">
          La suppression est immédiate et irréversible.
        </p>

        <div className="danger-summary">
          <p>
            Points actuels : <strong>{points}</strong>
          </p>

          <p>
            Ton compte, ta session, tes récompenses et ton historique fidélité
            seront supprimés.
          </p>
        </div>

        {hasPoints && (
          <div className="form">
            <h2>Que faire de tes points ?</h2>

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
              Perdre définitivement mes points
            </label>
          </div>
        )}

        <div className="delete-confirm-box">
          <p>
            Pour confirmer, écris : <strong>SUPPRIMER</strong>
          </p>

          <input
            className="input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SUPPRIMER"
          />
        </div>

        <button
          className="btn btn-danger"
          disabled={loading}
          onClick={deleteAccount}
        >
          {loading ? "Suppression..." : "Supprimer définitivement mon compte"}
        </button>
      </div>
    </div>
  );
}