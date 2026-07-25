import { useEffect, useState } from "react";

import { getAdminAnalytics } from "../api/adminApi";
import type { AdminAnalytics } from "../types/admin";

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      const data = await getAdminAnalytics();
      setAnalytics(data);
    }

    loadAnalytics();
  }, []);

  return {
    analytics,
  };
}
