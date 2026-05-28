import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function LoyaltyPage() {
  const session = await auth();

  if (!session?.user?.id) return <div>Not logged in</div>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { loyaltyRewards: true },
  });

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">💚 Tes points fidélité</h1>

      <div className="card">
        <p>Points: {user?.points}</p>
        <p>Rewards actives: {user?.loyaltyRewards.length}</p>
      </div>

      <div className="grid gap-3">
        {user?.loyaltyRewards.map((r) => (
          <div key={r.id} className="card">
            <p>{r.type}</p>
            <p>{r.value}</p>
            <p>{r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}