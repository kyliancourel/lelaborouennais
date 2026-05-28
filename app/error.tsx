"use client";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          Oups 😵
        </h1>

        <p className="auth-subtitle">
          Une erreur est survenue.
        </p>

        <button
          className="btn btn-primary"
          onClick={() => reset()}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}