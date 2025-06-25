import { distance as turfDistance } from '@turf/turf';

export function findPath(graph, startLngLat, endLngLat) {
  const { nodeCoords, edges } = graph;

  function nearestNode([lng, lat]) {
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.error('Invalid input coordinates:', [lng, lat]);
      throw new Error('Input coordinates must be numbers');
    }

    let bestId = null,
      bestDist = Infinity;
    nodeCoords.forEach((coords, id) => {
      if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        typeof coords[0] !== 'number' ||
        typeof coords[1] !== 'number'
      ) {
        console.error('Invalid nodeCoords entry at id', id, ':', coords);
        return;
      }

      try {
        const d = turfDistance(coords, [lng, lat]);
        if (d < bestDist) {
          bestDist = d;
          bestId = id;
        }
      } catch (e) {
        console.error(
          'Error with turf.distance for coords:',
          coords,
          'and',
          [lng, lat],
          e,
        );
      }
    });

    if (bestId === null) {
      throw new Error('No valid nodes found');
    }
    return bestId;
  }

  const startId = nearestNode(startLngLat);
  const endId = nearestNode(endLngLat);

  const N = nodeCoords.length;
  const dist = Array(N).fill(Infinity);
  const prev = Array(N).fill(null);
  const visited = new Set();

  dist[startId] = 0;
  while (true) {
    let u = -1,
      bestScore = Infinity;
    for (let i = 0; i < N; i++) {
      if (visited.has(i)) continue;
      const g = dist[i];
      if (g === Infinity) continue;
      const h = turfDistance(nodeCoords[i], nodeCoords[endId]);
      const score = g + h;
      if (score < bestScore) {
        bestScore = score;
        u = i;
      }
    }
    if (u === -1 || u === endId) break;
    visited.add(u);

    for (const { to: v, weight: w } of edges.get(u)) {
      const alt = dist[u] + w;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  const path = [];
  let cur = endId;
  while (cur !== null) {
    path.push(nodeCoords[cur]);
    cur = prev[cur];
  }
  return path.reverse();
}
