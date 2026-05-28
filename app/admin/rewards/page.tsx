import { prisma } from "@/lib/prisma";

export default async function AdminRewardsPage() {
  const rewards = await prisma.loyaltyReward.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">🎁 Rewards</h1>

      <a href="/admin/rewards/new" className="btn">
        + Nouvelle reward
      </a>

      <div className="grid gap-4 mt-6">
        {rewards.map((r) => (
          <div key={r.id} className="card">
            <p>Type: {r.type}</p>
            <p>Value: {r.value}</p>
            <p>Status: {r.status}</p>

            <a href={`/admin/rewards/${r.id}`}>
              Modifier
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}