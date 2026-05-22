const pool = require("../db/pool");
const dijkstra = require("../utils/dijkstra");

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

    const shortestRoute = dijkstra(graph, start, end);

    if (shortestRoute.path.length === 0) {
        throw new Error("No route found");
    }

    return {
        start,
        end,
        distance_m: shortestRoute.distance,
        path: shortestRoute.path
    };
}

module.exports = {
    getShortestRoute
};