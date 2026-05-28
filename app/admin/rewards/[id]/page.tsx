import { prisma } from "@/lib/prisma";

export default async function RewardDetail({
  params,
}: {
  params: { id: string };
}) {
  const reward = await prisma.loyaltyReward.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!reward) return <div>Reward not found</div>;

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">🎁 Reward Detail</h1>

      <div className="card">
        <p><strong>User:</strong> {reward.user.email}</p>
        <p><strong>Type:</strong> {reward.type}</p>
        <p><strong>Value:</strong> {reward.value}</p>
        <p><strong>Status:</strong> {reward.status}</p>
        <p><strong>Source:</strong> {reward.source}</p>
      </div>
    </div>
  );
}