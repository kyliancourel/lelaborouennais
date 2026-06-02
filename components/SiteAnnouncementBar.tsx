import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SiteAnnouncementBar() {
  const announcement = await prisma.siteAnnouncement.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!announcement || !announcement.message.trim()) {
    return null;
  }

  return (
    <div className="site-announcement-bar">
      <p>{announcement.message}</p>
    </div>
  );
}