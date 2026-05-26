"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyRequestPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [cooldown, setCooldown] = useState(30);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    async function resendEmail() {
        if (!email) return;

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.error || "Erreur envoi email");
                return;
            }

            setMessage("Un nouvel email de vérification a été envoyé.");
            setCooldown(30);
        } catch (error) {
            console.error(error);
            setMessage("Erreur serveur");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container text-center">
                <h1 className="auth-title">📩 Vérifie ton email</h1>

                <p style={{ marginTop: 10 }}>
                    Un email de confirmation a été envoyé à :
                </p>

                <p style={{ fontWeight: 600 }}>{email}</p>

                <p style={{ marginTop: 20 }}>
                    Clique sur le lien dans l’email pour activer ton compte.
                </p>

                {message && <p className="auth-error">{message}</p>}

                <button
                    className="btn btn-primary"
                    onClick={resendEmail}
                    disabled={loading || cooldown > 0}
                    style={{ marginTop: 20 }}
                >
                    {loading
                        ? "Envoi..."
                        : cooldown > 0
                            ? `Renvoyer (${cooldown}s)`
                            : "Renvoyer email"}
                </button>

                {cooldown > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        Nouveau lien disponible dans {cooldown}s
                    </p>
                )}

            </div>
        </div>
    );
}