const pool = require("../db/pool");
const dijkstra = require("../utils/dijkstra");
const placesService = require("./places.service");

async function findNearestOsmNode(lat, lon) {
  const result = await pool.query(`
    SELECT osm_id, lat, lon
    FROM osm_nodes
  `);

  let nearestNode = null;
  let shortestDistance = Infinity;

  for (const row of result.rows) {
    const distance = getDistanceMeters(
      Number(lat),
      Number(lon),
      Number(row.lat),
      Number(row.lon)
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestNode = row;
    }
  }

  if (!nearestNode) {
    throw new Error("No OSM nodes available");
  }

  return {
    osm_id: String(nearestNode.osm_id),
    distance_m: shortestDistance
  };
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

async function getRouteBetweenPlaces(startPlaceName, endPlaceName) {
  if (!startPlaceName || !endPlaceName) {
    throw new Error("Start and end places are required");
  }

  const startResults = await placesService.searchPlaces(startPlaceName);
  const endResults = await placesService.searchPlaces(endPlaceName);

  const startPlace = startResults[0];
  const endPlace = endResults[0];

  if (!startPlace) {
    throw new Error("Start place not found");
  }

  if (!endPlace) {
    throw new Error("End place not found");
  }

  const startNode = await findNearestOsmNode(
    startPlace.latitude,
    startPlace.longitude
  );

  const endNode = await findNearestOsmNode(
    endPlace.latitude,
    endPlace.longitude
  );

  const route = await getShortestRoute(
    startNode.osm_id,
    endNode.osm_id
  );

  return {
    start_place: {
      id: startPlace.id,
      name: startPlace.name,
      latitude: startPlace.latitude,
      longitude: startPlace.longitude,
      nearest_osm_node: startNode.osm_id
    },

    end_place: {
      id: endPlace.id,
      name: endPlace.name,
      latitude: endPlace.latitude,
      longitude: endPlace.longitude,
      nearest_osm_node: endNode.osm_id
    },

    distance_m: route.distance_m,
    path: route.path,
    coordinates: route.coordinates
  };
}

async function getCoordinatesForPath(path) {
  const numericPath = path.map(Number);

  const result = await pool.query(
    `
    SELECT osm_id, lat, lon
    FROM osm_nodes
    WHERE osm_id = ANY($1::bigint[])
    `,
    [numericPath]
  );

  const coordinatesById = {};

  for (const row of result.rows) {
    coordinatesById[String(row.osm_id)] = {
      latitude: Number(row.lat),
      longitude: Number(row.lon)
    };
  }

  const coordinates = [];

  for (const nodeId of path) {
    const c = coordinatesById[String(nodeId)];

    if (!c) {
      throw new Error(`Missing coordinates for osm node ${nodeId}`);
    }

    coordinates.push(c);
  }

  return coordinates;
}

async function getShortestRoute(startNodeId, endNodeId) {
    const start = String(startNodeId);
    const end = String(endNodeId);
    const result = await pool.query(
        `
        SELECT
        from_node_id,
        to_node_id,
        distance_m,
        source
        FROM route_edges
        `
    );

    const graph = {};

    for (const row of result.rows) {
        const from = String(row.from_node_id);
        const to = String(row.to_node_id);
        const weight = Number(row.distance_m);

        if (!graph[from]) {
            graph[from] = [];
        }

        graph[from].push({
            node: to,
            weight: weight
        });
    }

    // Ensure nodes that only appear as `to` are present in the graph
    for (const row of result.rows) {
      const to = String(row.to_node_id);
      if (!graph[to]) graph[to] = [];
    }

    // Ensure start and end nodes exist in graph
    if (!graph[start]) {
      throw new Error("Start node not found in routing graph");
    }

    if (!graph[end]) {
      throw new Error("End node not found in routing graph");
    }

    const shortestRoute = dijkstra(graph, start, end);

    if (shortestRoute.path.length === 0) {
        throw new Error("No route found");
    }

    const coordinates = await getCoordinatesForPath(shortestRoute.path);

    return {
        start,
        end,
        distance_m: shortestRoute.distance,
        path: shortestRoute.path,
        coordinates
    };
}

module.exports = {
    getShortestRoute,
    getRouteBetweenPlaces,
};