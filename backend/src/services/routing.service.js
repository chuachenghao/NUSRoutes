const pool = require("../db/pool");
const axios = require("axios");
const dijkstra = require("../utils/dijkstra");
const placesService = require("./places.service");

const WEATHER_URL = "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast";

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

function isWetWeather(forecast) {
  return /rain|shower|thunder|drizzle/i.test(forecast || "");
}

async function getWeatherSuggestion() {
  const response = await axios.get(WEATHER_URL, { timeout: 5000 });
  const item = response.data?.data?.items?.[0];
  const forecasts = item?.forecasts || [];
  const weather = forecasts.find((forecast) => forecast.area === "Queenstown") ||
    forecasts.find((forecast) => forecast.area === "Clementi");

  if (!weather?.forecast) {
    return null;
  }

  const wetWeather = isWetWeather(weather.forecast);

  return {
    area: weather.area,
    forecast: weather.forecast,
    suggested_mode: wetWeather ? "sheltered" : "fastest",
    reason: wetWeather
      ? "Raining bro get under shelter."
      : "Sunny skies today."
  };
}

async function getRouteBetweenPlaces(startPlaceName, endPlaceName, mode = "fastest") {
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

  const routeMode = mode === "sheltered" ? "sheltered" : "fastest";
  const route = await getShortestRoute(startNode.osm_id, endNode.osm_id, routeMode);
  const weatherSuggestion = await getWeatherSuggestion().catch((err) => {
    console.error("Weather suggestion error:", err.message);
    return null;
  });

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
    coordinates: route.coordinates,
    route_segments: route.route_segments,
    route_mode: routeMode,
    sheltered_ratio: route.sheltered_ratio,
    weather_suggestion: weatherSuggestion
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

async function getShortestRoute(startNodeId, endNodeId, mode = "fastest") {
    const start = String(startNodeId);
    const end = String(endNodeId);
    const result = await pool.query(
        `
        SELECT
        from_node_id,
        to_node_id,
        distance_m,
        is_sheltered
        FROM route_edges
        `
    );

    const graph = {};

    for (const row of result.rows) {
        const from = String(row.from_node_id);
        const to = String(row.to_node_id);
        const distance = Number(row.distance_m);
        const sheltered = Boolean(row.is_sheltered);
        const weight = mode === "sheltered" && !sheltered ? distance * 3 : distance;

        if (!graph[from]) {
            graph[from] = [];
        }

        const existingEdge = graph[from].find((edge) => edge.node === to);

        if (!existingEdge || weight < existingEdge.weight) {
          const edge = {
            node: to,
            weight,
            distance_m: distance,
            is_sheltered: sheltered
          };

          if (existingEdge) {
            Object.assign(existingEdge, edge);
          } else {
            graph[from].push(edge);
          }
        }
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

    let distanceM = 0;
    let shelteredDistanceM = 0;
    const routeSegments = [];

    for (let i = 0; i < shortestRoute.path.length - 1; i++) {
      const from = shortestRoute.path[i];
      const to = shortestRoute.path[i + 1];
      const edge = graph[from].find((item) => item.node === to);

      if (!edge) continue;

      distanceM += edge.distance_m;

      if (edge.is_sheltered) {
        shelteredDistanceM += edge.distance_m;
      }

      const lastSegment = routeSegments[routeSegments.length - 1];

      if (lastSegment && lastSegment.is_sheltered === edge.is_sheltered) {
        lastSegment.coordinates.push(coordinates[i + 1]);
      } else {
        routeSegments.push({
          is_sheltered: edge.is_sheltered,
          coordinates: [coordinates[i], coordinates[i + 1]]
        });
      }
    }

    return {
        distance_m: distanceM,
        path: shortestRoute.path,
        coordinates,
        route_segments: routeSegments,
        sheltered_ratio: distanceM > 0
          ? Math.round((shelteredDistanceM / distanceM) * 100)
          : 0
    };
}

module.exports = {
    getRouteBetweenPlaces,
};
