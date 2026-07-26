import { useCallback, useEffect, useState } from "react";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
} from "../api/announcementsApi";
import type { Announcement, NewAnnouncement } from "../types/announcement";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const refresh = useCallback(async () => {
    const data = await getAnnouncements();
    setAnnouncements(data);
  }, []);

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

  // used by the admin screen to post a new announcement
  async function addAnnouncement(input: NewAnnouncement) {
    const created = await createAnnouncement(input);

    if (!created) return false;

    setAnnouncements((prev) => [created, ...prev]);
    return true;
  }

  async function removeAnnouncement(id: string) {
    const ok = await deleteAnnouncement(id);

    if (!ok) return false;

    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    return true;
  }

  return {
    announcements,
    refresh,
    addAnnouncement,
    removeAnnouncement,
  };
}
