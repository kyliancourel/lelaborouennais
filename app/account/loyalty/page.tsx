import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LoyaltyWallet from "@/components/LoyaltyWallet";
import LoyaltyRewards from "@/components/LoyaltyRewards";

export default async function LoyaltyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      points: true,
      loyaltyHistory: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      loyaltyRewards: true,
    },
  });

  const rules = await prisma.loyaltyRewardRule.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: "asc" },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="loyalty-page">
      <LoyaltyWallet points={user.points} />

      <LoyaltyRewards
        userPoints={user.points}
        rules={rules}
        userRewards={user.loyaltyRewards}
      />

      <div className="loyalty-history card">
        <h2>Historique récent</h2>

        {user.loyaltyHistory.length === 0 ? (
          <p className="text-muted">Aucun mouvement pour le moment.</p>
        ) : (
          <div className="loyalty-history-list">
            {user.loyaltyHistory.map((log) => (
              <div key={log.id} className="loyalty-history-item">
                <span>
                  {log.type === "EARNED" && "Points gagnés"}
                  {log.type === "USED" && "Points utilisés"}
                  {log.type === "BONUS" && "Bonus"}
                  {log.type === "EXPIRED" && "Points expirés"}
                </span>

                <strong>
                  {log.type === "USED" || log.type === "EXPIRED" ? "-" : "+"}
                  {log.points} pts
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}