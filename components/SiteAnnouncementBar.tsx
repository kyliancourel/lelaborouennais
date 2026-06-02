"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  message: string;
  isActive: boolean;
};

export default function SiteAnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    async function loadAnnouncement() {
      const res = await fetch("/api/admin/announcement", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (
        data.announcement &&
        data.announcement.isActive &&
        data.announcement.message?.trim()
      ) {
        setAnnouncement(data.announcement);
      }
    }

    loadAnnouncement();
  }, []);

  if (!announcement) return null;

  return (
    <div className="site-announcement-bar">
      <div className="announcement-marquee">
        {announcement.message}
      </div>
    </div>
  );
}