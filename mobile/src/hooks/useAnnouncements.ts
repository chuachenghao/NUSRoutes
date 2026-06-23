import { useEffect, useState } from "react";

import { getAnnouncements } from "../api/announcementsApi";
import type { Announcement } from "../types/announcement";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      setLoadingAnnouncements(true);

      const data = await getAnnouncements();

      if (!isMounted) return;

      setAnnouncements(data);
      setLoadingAnnouncements(false);
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    announcements,
    loadingAnnouncements,
  };
}
