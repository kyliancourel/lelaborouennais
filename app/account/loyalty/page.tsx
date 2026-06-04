import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LoyaltyWallet from "@/components/LoyaltyWallet";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import { syncUserPoints } from "@/lib/loyalty";

function normalizeOptions(options: unknown): string[] | null {
  if (!Array.isArray(options)) return null;

  const cleanOptions = options
    .filter((option): option is string => typeof option === "string")
    .map((option) => option.trim())
    .filter(Boolean);

  return cleanOptions.length > 0 ? cleanOptions : null;
}

export default async function LoyaltyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const realPoints = await syncUserPoints(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      loyaltyHistory: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      loyaltyRewards: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          source: true,
          status: true,
          selectedOption: true,
          usedAt: true,
        },
      },
    },
  });

  const rulesFromDb = await prisma.loyaltyRewardRule.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      pointsCost: "asc",
    },
  });

  const rules = rulesFromDb.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    icon: rule.icon,
    pointsCost: rule.pointsCost,
    type: rule.type,
    value: rule.value,
    options: normalizeOptions(rule.options),
  }));

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="loyalty-page">
      <LoyaltyWallet points={realPoints} />

      <LoyaltyRewards
        userPoints={realPoints}
        rules={rules}
        userRewards={user.loyaltyRewards}
      />

      <div className="loyalty-history card">
        <h2>Historique récent</h2>

        {user.loyaltyHistory.length === 0 ? (
          <p className="text-muted">Aucun mouvement pour le moment.</p>
        ) : (
          <div className="loyalty-history-list">
            {user.loyaltyHistory.map((log) => {
              const isWelcomeOffer =
                log.source?.startsWith("welcome_offer_");

              const isCancelledOrder =
                log.source?.startsWith("cancel_order_");

              const label = isWelcomeOffer
                ? "Offre de bienvenue utilisée"
                : isCancelledOrder
                ? "Points retirés suite à annulation"
                : log.type === "EARNED"
                ? "Points gagnés"
                : log.type === "USED"
                ? "Points utilisés"
                : log.type === "BONUS"
                ? "Bonus"
                : "Points expirés";

              const pointsLabel =
                log.points === 0
                  ? "Utilisée"
                  : `${log.points > 0 ? "+" : ""}${log.points} pts`;

              return (
                <div
                  key={log.id}
                  className="loyalty-history-item"
                >
                  <span>{label}</span>

                  <strong>{pointsLabel}</strong>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}