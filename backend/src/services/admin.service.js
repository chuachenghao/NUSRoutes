const pool = require("../db/pool");

const emptyAnalytics = {
  summary: {
    total_route_searches: 0,
    recent_route_searches: 0,
    fastest_searches: 0,
    sheltered_searches: 0,
    avg_distance_m: 0,
    avg_sheltered_ratio: 0,
    busiest_hour: {
      label: "-",
      searches: 0,
    },
  },
  top_destinations: [],
  route_pairs: [],
  peak_usage_times: [],
  heat_points: [],
};

function hourLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

async function logRouteSearch(route) {
  await pool.query(
    `
    INSERT INTO route_search_events (
      start_place_id,
      end_place_id,
      start_name,
      end_name,
      route_mode,
      distance_m,
      sheltered_ratio
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      route.start_place.id,
      route.end_place.id,
      route.start_place.name,
      route.end_place.name,
      route.route_mode,
      route.distance_m,
      route.sheltered_ratio,
    ]
  );
}

async function getSummary() {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_route_searches,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_route_searches,
      COUNT(*) FILTER (WHERE route_mode = 'fastest') AS fastest_searches,
      COUNT(*) FILTER (WHERE route_mode = 'sheltered') AS sheltered_searches,
      COALESCE(AVG(distance_m), 0) AS avg_distance_m,
      COALESCE(AVG(sheltered_ratio), 0) AS avg_sheltered_ratio
    FROM route_search_events
  `);

  const row = result.rows[0];
  const busiestHour = await getBusiestHour();

  return {
    total_route_searches: Number(row.total_route_searches),
    recent_route_searches: Number(row.recent_route_searches),
    fastest_searches: Number(row.fastest_searches),
    sheltered_searches: Number(row.sheltered_searches),
    avg_distance_m: Math.round(Number(row.avg_distance_m)),
    avg_sheltered_ratio: Math.round(Number(row.avg_sheltered_ratio)),
    busiest_hour: busiestHour,
  };
}

async function getBusiestHour() {
  const result = await pool.query(`
    SELECT
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Singapore')::INTEGER AS hour,
      COUNT(*) AS searches
    FROM route_search_events
    GROUP BY hour
    ORDER BY searches DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return { label: "-", searches: 0 };
  }

  const hour = Number(result.rows[0].hour);

  return {
    label: hourLabel(hour),
    searches: Number(result.rows[0].searches),
  };
}

async function getPeakUsageTimes() {
  const result = await pool.query(`
    SELECT
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Singapore')::INTEGER AS hour,
      COUNT(*) AS searches
    FROM route_search_events
    GROUP BY hour
    ORDER BY hour ASC
  `);

  return result.rows.map((row) => {
    const hour = Number(row.hour);

    return {
      hour,
      label: hourLabel(hour),
      searches: Number(row.searches),
    };
  });
}

async function getRoutePairs() {
  const result = await pool.query(`
    SELECT
      start_name,
      end_name,
      COUNT(*) AS searches,
      COALESCE(AVG(distance_m), 0) AS avg_distance_m
    FROM route_search_events
    GROUP BY start_name, end_name
    ORDER BY searches DESC
    LIMIT 8
  `);

  return result.rows.map((row) => ({
    start_name: row.start_name,
    end_name: row.end_name,
    searches: Number(row.searches),
    avg_distance_m: Math.round(Number(row.avg_distance_m)),
  }));
}

async function getTopDestinations() {
  const result = await pool.query(`
    SELECT
      end_place_id AS place_id,
      end_name AS name,
      COUNT(*) AS searches
    FROM route_search_events
    GROUP BY end_place_id, end_name
    ORDER BY searches DESC
    LIMIT 8
  `);

  return result.rows.map((row) => ({
    place_id: row.place_id ? String(row.place_id) : null,
    name: row.name,
    searches: Number(row.searches),
  }));
}

async function getHeatPoints() {
  const result = await pool.query(`
    SELECT
      place_id,
      name,
      SUM(searches) AS searches
    FROM (
      SELECT start_place_id AS place_id, start_name AS name, COUNT(*) AS searches
      FROM route_search_events
      GROUP BY start_place_id, start_name

      UNION ALL

      SELECT end_place_id AS place_id, end_name AS name, COUNT(*) AS searches
      FROM route_search_events
      GROUP BY end_place_id, end_name
    ) all_points
    GROUP BY place_id, name
    ORDER BY searches DESC
    LIMIT 8
  `);

  const maxSearches = Math.max(1, ...result.rows.map((row) => Number(row.searches)));

  return result.rows.map((row) => ({
    place_id: row.place_id ? String(row.place_id) : null,
    name: row.name,
    searches: Number(row.searches),
    intensity: Number(row.searches) / maxSearches,
  }));
}

async function getAnalytics() {
  const summary = await getSummary();
  const topDestinations = await getTopDestinations();
  const routePairs = await getRoutePairs();
  const peakUsageTimes = await getPeakUsageTimes();
  const heatPoints = await getHeatPoints();

  return {
    summary,
    top_destinations: topDestinations,
    route_pairs: routePairs,
    peak_usage_times: peakUsageTimes,
    heat_points: heatPoints,
  };
}

module.exports = {
  emptyAnalytics,
  getAnalytics,
  logRouteSearch,
};
