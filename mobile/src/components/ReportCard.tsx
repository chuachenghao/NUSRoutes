import { Pressable, StyleSheet, Text, View } from "react-native";

import { useProfile } from "../context/ProfileContext";
import type { Report } from "../types/report";

// nice labels for each report type
const TYPE_LABELS: Record<Report["type"], string> = {
  obstruction: "🚧 Pathway obstruction",
  closure: "⛔ Temporary closure",
  crowded: "👥 Crowded stop",
  hazard: "⚠️ Hazard",
  other: "📌 Report",
};

// rough "x min ago" text
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

type ReportCardProps = {
  report: Report;
  onUpvote: () => void;
  onFlag: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function ReportCard({
  report,
  onUpvote,
  onFlag,
  onDelete,
  onClose,
}: ReportCardProps) {
  const { profile } = useProfile();
  const isMine = profile != null && report.reporterId === profile.id;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>{TYPE_LABELS[report.type]}</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      {report.description ? (
        <Text style={styles.desc}>{report.description}</Text>
      ) : (
        <Text style={styles.descMuted}>No description</Text>
      )}

      <Text style={styles.meta}>
        {report.reporterName ? `by ${report.reporterName} · ` : ""}
        {timeAgo(report.createdAt)}
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.voteBtn, report.hasUpvoted && styles.voteBtnActive]}
          onPress={onUpvote}
        >
          <Text
            style={[styles.voteText, report.hasUpvoted && styles.voteTextActive]}
          >
            👍 Still here ({report.upvotes})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.voteBtn, report.hasFlagged && styles.flagBtnActive]}
          onPress={onFlag}
        >
          <Text
            style={[styles.voteText, report.hasFlagged && styles.voteTextActive]}
          >
            🚫 Not relevant ({report.irrelevantCount})
          </Text>
        </Pressable>
      </View>

      {isMine ? (
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete my report</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    fontSize: 17,
    fontWeight: "900",
  },
  close: {
    fontSize: 18,
    color: "#94a3b8",
    paddingHorizontal: 6,
  },
  desc: {
    fontSize: 15,
    color: "#334155",
    marginTop: 8,
  },
  descMuted: {
    fontSize: 14,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
    color: "#777777",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  voteBtnActive: {
    backgroundColor: "#dcfce7",
  },
  flagBtnActive: {
    backgroundColor: "#fee2e2",
  },
  voteText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  voteTextActive: {
    color: "#111827",
  },
  deleteBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
  },
});
