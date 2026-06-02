"use client";

import { useEffect, useState } from "react";

export default function AdminAnnouncementPage() {
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadAnnouncement() {
      const res = await fetch("/api/admin/announcement", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.announcement) {
        setMessage(data.announcement.message || "");
        setIsActive(Boolean(data.announcement.isActive));
      }
    }

    loadAnnouncement();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");

    const res = await fetch("/api/admin/announcement", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        isActive,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Erreur lors de l'enregistrement.");
      return;
    }

    setSuccess("Bandeau mis à jour.");
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Bandeau d'information</h1>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <textarea
            className="input"
            placeholder="Ex : 🎉 -10% sur toute la boutique ce week-end"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <label className="radio-row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Afficher le bandeau sur le site
          </label>

          {success && <p className="auth-success">{success}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}