const pool = require("../db/pool");

const ANNOUNCEMENT_FIELDS = `
  id,
  title,
  description,
  type,
  latitude,
  longitude,
  active,
  created_at,
  expires_at
`;

async function getAllAnnouncements() {
  const result = await pool.query(`
    SELECT
      ${ANNOUNCEMENT_FIELDS}
    FROM announcements
    WHERE active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
  `);

  return result.rows;
}

async function getAnnouncementById(id) {
  const result = await pool.query(
    `
    SELECT
      ${ANNOUNCEMENT_FIELDS}
    FROM announcements
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

async function createAnnouncement(data) {
  const {
    title,
    description = null,
    type = "info",
    latitude,
    longitude,
    expires_at = null,
  } = data;

  const result = await pool.query(
    `
    INSERT INTO announcements (
      title,
      description,
      type,
      latitude,
      longitude,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      ${ANNOUNCEMENT_FIELDS}
    `,
    [title, description, type, latitude, longitude, expires_at]
  );

  return result.rows[0];
}

async function deleteAnnouncement(id) {
  const result = await pool.query(
    `
    DELETE FROM announcements
    WHERE id = $1
    RETURNING
      ${ANNOUNCEMENT_FIELDS}
    `,
    [id]
  );

  return result.rows[0];
}

async function deactivateAnnouncement(id) {
  const result = await pool.query(
    `
    UPDATE announcements
    SET active = false
    WHERE id = $1
    RETURNING
      ${ANNOUNCEMENT_FIELDS}
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  deleteAnnouncement,
  deactivateAnnouncement,
};
