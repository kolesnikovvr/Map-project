import { distance as turfDistance } from '@turf/turf';

export function buildGraph(geojson) {
  const nodes = new Map();
  const nodeCoords = [];
  const edges = new Map();

  function registerNode(lng, lat) {
    const key = `${lng},${lat}`;
    if (!nodes.has(key)) {
      const id = nodeCoords.length;
      nodes.set(key, id);
      nodeCoords.push([lng, lat]);
      edges.set(id, []);
    }
    return nodes.get(key);
  }

  geojson.features
    .filter((feature) => feature.geometry.type === 'LineString')
    .forEach((feature) => {
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        console.warn('Skipping invalid LineString feature:', feature);
        return;
      }
      for (let i = 0; i < coords.length - 1; i++) {
        const [lng, lat] = coords[i];
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          console.error('Invalid coordinate in GeoJSON:', coords[i]);
          continue;
        }
        const u = registerNode(lng, lat);
        const [nextLng, nextLat] = coords[i + 1];
        if (typeof nextLng !== 'number' || typeof nextLat !== 'number') {
          console.error('Invalid coordinate in GeoJSON:', coords[i + 1]);
          continue;
        }
        const v = registerNode(nextLng, nextLat);
        const w = turfDistance([lng, lat], [nextLng, nextLat]);
        edges.get(u).push({ to: v, weight: w });
        edges.get(v).push({ to: u, weight: w });
      }
    });

  return { nodes, nodeCoords, edges };
}
