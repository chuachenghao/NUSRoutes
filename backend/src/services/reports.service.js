const pool = require("../db/pool");

// Number of "no longer relevant" votes that retires a report from the map.
const IRRELEVANT_THRESHOLD = 3;

// Type-based lifetime (in hours) used to compute expires_at on insert.
const EXPIRY_HOURS = {
  crowded: 3,
  obstruction: 24,
  hazard: 24,
  closure: 72,
  other: 24,
};

// Report fields plus computed vote aggregates. $1 is the current voter id
// (may be null for guests, in which case the has_* flags are just false).
const REPORTS_SELECT = `
  SELECT * FROM (
    SELECT
      r.id,
      r.type,
      r.description,
      r.latitude,
      r.longitude,
      r.reporter_id,
      r.reporter_name,
      r.status,
      r.created_at,
      r.expires_at,
      COALESCE(u.cnt, 0) AS upvotes,
      COALESCE(f.cnt, 0) AS irrelevant_count,
      COALESCE(mv.upvoted, false) AS has_upvoted,
      COALESCE(mv.flagged, false) AS has_flagged
    FROM reports r
    LEFT JOIN (
      SELECT report_id, COUNT(*) AS cnt
      FROM report_votes WHERE vote_type = 'upvote'
      GROUP BY report_id
    ) u ON u.report_id = r.id
    LEFT JOIN (
      SELECT report_id, COUNT(*) AS cnt
      FROM report_votes WHERE vote_type = 'irrelevant'
      GROUP BY report_id
    ) f ON f.report_id = r.id
    LEFT JOIN (
      SELECT
        report_id,
        bool_or(vote_type = 'upvote') AS upvoted,
        bool_or(vote_type = 'irrelevant') AS flagged
      FROM report_votes
      WHERE voter_id = $1
      GROUP BY report_id
    ) mv ON mv.report_id = r.id
    WHERE r.status = 'active'
      AND (r.expires_at IS NULL OR r.expires_at > NOW())
  ) x
`;

async function getAllReports(voterId = null) {
  const result = await pool.query(
    `
    ${REPORTS_SELECT}
    WHERE x.irrelevant_count < $2
    ORDER BY x.created_at DESC
    `,
    [voterId, IRRELEVANT_THRESHOLD]
  );

  return result.rows;
}

async function getReportById(id, voterId = null) {
  const result = await pool.query(
    `
    ${REPORTS_SELECT}
    WHERE x.id = $2
    `,
    [voterId, id]
  );

  return result.rows[0];
}

async function createReport(data) {
  const {
    type = "obstruction",
    description = null,
    latitude,
    longitude,
    reporter_id = null,
    reporter_name = null,
  } = data;

  const expiryHours = EXPIRY_HOURS[type] ?? EXPIRY_HOURS.other;

  const result = await pool.query(
    `
    INSERT INTO reports (
      type,
      description,
      latitude,
      longitude,
      reporter_id,
      reporter_name,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW() + ($7 || ' hours')::interval)
    RETURNING id
    `,
    [type, description, latitude, longitude, reporter_id, reporter_name, expiryHours]
  );

  // Re-read through the aggregate select so the shape matches getAllReports.
  return getReportById(result.rows[0].id, reporter_id);
}

// Toggle a vote for a voter, keeping upvote/irrelevant mutually exclusive.
// Returns the report's refreshed counts + this voter's flags.
async function castVote(reportId, voterId, voteType) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const oppositeType = voteType === "upvote" ? "irrelevant" : "upvote";

    // Remove any opposing vote by this voter first.
    await client.query(
      `DELETE FROM report_votes
       WHERE report_id = $1 AND voter_id = $2 AND vote_type = $3`,
      [reportId, voterId, oppositeType]
    );

    // Toggle the requested vote: delete if present, otherwise insert.
    const existing = await client.query(
      `DELETE FROM report_votes
       WHERE report_id = $1 AND voter_id = $2 AND vote_type = $3
       RETURNING id`,
      [reportId, voterId, voteType]
    );

    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO report_votes (report_id, voter_id, vote_type)
         VALUES ($1, $2, $3)`,
        [reportId, voterId, voteType]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getReportById(reportId, voterId);
}

async function deleteReport(id, requesterId) {
  const result = await pool.query(
    `
    DELETE FROM reports
    WHERE id = $1 AND reporter_id = $2
    RETURNING id
    `,
    [id, requesterId]
  );

  return result.rows[0];
}

module.exports = {
  IRRELEVANT_THRESHOLD,
  getAllReports,
  getReportById,
  createReport,
  castVote,
  deleteReport,
};
