import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="card">
        <h2 className="card-title">Bienvenue 👋</h2>

        <p className="card-text">
          Voici les informations de ton compte.
        </p>

        <div className="user-info">
          <p><strong>Nom :</strong> {session.user.name}</p>
          <p><strong>Email :</strong> {session.user.email}</p>
          <p><strong>Rôle :</strong> {(session.user as any).role ?? "USER"}</p>
        </div>
      </div>
    </div>
  );
}