import { prisma } from "@/lib/prisma";

export default async function AdminLoyaltyPage() {
  const users = await prisma.user.findMany({
    include: {
      loyaltyRewards: true,
      loyaltyHistory: true,
    },
    orderBy: {
      points: "desc",
    },
  });

  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);

  const totalRewards = await prisma.loyaltyReward.count();

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">💚 Loyalty Dashboard</h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p>Total users points</p>
          <h2 className="text-xl font-bold">{totalPoints}</h2>
        </div>

        <div className="card">
          <p>Total rewards</p>
          <h2 className="text-xl font-bold">{totalRewards}</h2>
        </div>

        <div className="card">
          <p>Active users</p>
          <h2 className="text-xl font-bold">{users.length}</h2>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Users</h2>

        <table className="w-full text-left">
          <thead>
            <tr>
              <th>User</th>
              <th>Points</th>
              <th>Rewards</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td>{u.email}</td>
                <td>{u.points}</td>
                <td>{u.loyaltyRewards.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}