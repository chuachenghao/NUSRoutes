const pool = require("./pool");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Rough NUS area
const query = `
[out:json][timeout:25];

(
  way["highway"~"footway|path|pedestrian|steps|service|residential|living_street"]
    (1.287,103.770,1.305,103.787);
);

out body;
>;
out skel qt;
`;

async function ensureShelterColumn() {
  await pool.query(`
    ALTER TABLE route_edges
    ADD COLUMN IF NOT EXISTS is_sheltered BOOLEAN NOT NULL DEFAULT false
  `);
}

function isSheltered(way) {
  const tags = way.tags || {};

  return tags.covered === "yes" || tags.tunnel === "yes" || tags.indoor === "yes";
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const toRad = (num) => num * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchOsmData() {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "User-Agent": "NUSRoutes student project",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      data: query
    })
  });

  const text = await response.text();

  if (!response.ok) {
    console.log(text);
    throw new Error("Failed to fetch OSM data");
  }

  return JSON.parse(text);
}

async function importOsm() {
  await ensureShelterColumn();

  console.log("Fetching OSM data...");
  const data = await fetchOsmData();

  const nodes = new Map();
  const ways = [];

  for (const item of data.elements) {
    if (item.type === "node") {
      nodes.set(item.id, {
        id: item.id,
        lat: item.lat,
        lon: item.lon
      });
    }

    if (item.type === "way") {
      ways.push(item);
    }
  }

  console.log("Nodes:", nodes.size);
  console.log("Ways:", ways.length);

  await pool.query("DELETE FROM route_edges WHERE source = 'osm'");
  await pool.query("DELETE FROM osm_nodes");

  for (const node of nodes.values()) {
    await pool.query(
      `
      INSERT INTO osm_nodes (osm_id, lat, lon)
      VALUES ($1, $2, $3)
      ON CONFLICT (osm_id)
      DO UPDATE SET
        lat = EXCLUDED.lat,
        lon = EXCLUDED.lon
      `,
      [node.id, node.lat, node.lon]
    );
  }

  let edgeCount = 0;

  for (const way of ways) {
    for (let i = 0; i < way.nodes.length - 1; i++) {
      const fromId = way.nodes[i];
      const toId = way.nodes[i + 1];

      const fromNode = nodes.get(fromId);
      const toNode = nodes.get(toId);

      if (!fromNode || !toNode) continue;

      const distance = getDistanceMeters(
        fromNode.lat,
        fromNode.lon,
        toNode.lat,
        toNode.lon
      );

      await pool.query(
        `
        INSERT INTO route_edges (
          from_node_id,
          to_node_id,
          distance_m,
          source,
          way_id,
          highway,
          is_sheltered
        )
        VALUES ($1, $2, $3, 'osm', $4, $5, $6)
        `,
        [
          fromId,
          toId,
          distance,
          way.id,
          way.tags?.highway || null,
          isSheltered(way)
        ]
      );

      await pool.query(
        `
        INSERT INTO route_edges (
          from_node_id,
          to_node_id,
          distance_m,
          source,
          way_id,
          highway,
          is_sheltered
        )
        VALUES ($1, $2, $3, 'osm', $4, $5, $6)
        `,
        [
          toId,
          fromId,
          distance,
          way.id,
          way.tags?.highway || null,
          isSheltered(way)
        ]
      );

      edgeCount += 2;
    }
  }

  console.log("Inserted edges:", edgeCount);
  console.log("OSM import complete");

  await pool.end();
}

importOsm();
