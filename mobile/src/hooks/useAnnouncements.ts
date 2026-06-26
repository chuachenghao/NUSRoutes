import { useEffect, useState } from "react";

import { getAnnouncements } from "../api/announcementsApi";
import type { Announcement } from "../types/announcement";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      const data = await getAnnouncements();

      if (!isMounted) return;

      setAnnouncements(data);
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    announcements,
  };
}
