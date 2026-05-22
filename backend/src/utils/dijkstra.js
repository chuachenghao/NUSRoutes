function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  // Set all distances to infinity
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  // Distance from start to start is 0
  distances[start] = 0;

  // Visit all nodes
  while (visited.size < Object.keys(graph).length) {
    let currentNode = null;
    let smallestDistance = Infinity;

    // Find the unvisited node with the smallest distance
    for (const node in graph) {
      if (!visited.has(node) && distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    }

    // If no reachable node is left, stop
    if (currentNode === null) break;

    // If we reached the end, stop early
    if (currentNode === end) break;

    visited.add(currentNode);

    // Check all neighbours of currentNode
    for (const neighbour of graph[currentNode]) {
      const nextNode = neighbour.node;
      const weight = neighbour.weight;

      const newDistance = distances[currentNode] + weight;

      // If this route is shorter, update it
      if (newDistance < distances[nextNode]) {
        distances[nextNode] = newDistance;
        previous[nextNode] = currentNode;
      }
    }
  }

  // Rebuild the path from end back to start
  const path = [];
  let current = end;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // If the path does not start with start, no route exists
  if (path[0] !== start) {
    return {
      distance: Infinity,
      path: []
    };
  }

  return {
    distance: distances[end],
    path: path
  };
}