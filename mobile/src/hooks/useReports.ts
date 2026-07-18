import { useCallback, useEffect, useState } from "react";

import {
  getReports,
  createReport,
  voteReport,
  deleteReport,
} from "../api/reportsApi";
import { useProfile } from "../context/ProfileContext";
import type { Report, ReportType, VoteType } from "../types/report";

export function useReports() {
  const { profile } = useProfile();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // use the local profile id so the backend knows who voted
  const voterId = profile?.id ?? null;

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getReports(voterId);
    setReports(data);
    setLoading(false);
  }, [voterId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submitReport(input: {
    type: ReportType;
    description?: string | null;
    latitude: number;
    longitude: number;
  }) {
    const created = await createReport({
      ...input,
      reporter_id: voterId,
      reporter_name: profile?.name ?? null,
    });
    if (created) {
      // just reload so counts/order stay correct
      await refresh();
    }
    return created;
  }

  async function vote(id: string, voteType: VoteType) {
    if (!voterId) return; // need a profile to vote
    const updated = await voteReport(id, voterId, voteType);
    if (updated) {
      // swap the one report we changed
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }

  async function remove(id: string) {
    if (!voterId) return;
    const ok = await deleteReport(id, voterId);
    if (ok) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
    return ok;
  }

  return { reports, loading, refresh, submitReport, vote, remove };
}
