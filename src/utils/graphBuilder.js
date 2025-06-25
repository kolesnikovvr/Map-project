function haversine([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function buildGraph(geojson) {
  const nodes = [];
  const edges = {};

  function register(lng, lat) {
    const key = `${lng},${lat}`;
    if (nodes.__map == null) {
      nodes.__map = Object.create(null);
    }
    let id = nodes.__map[key];
    if (id == null) {
      id = nodes.length;
      nodes.__map[key] = id;
      nodes.push([lng, lat]);
      edges[id] = [];
    }
    return id;
  }

  for (const feat of geojson.features) {
    if (feat.geometry.type !== 'LineString') continue;
    const coords = feat.geometry.coordinates;
    for (let i = 0; i + 1 < coords.length; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];
      const u = register(lng1, lat1);
      const v = register(lng2, lat2);
      const w = haversine([lng1, lat1], [lng2, lat2]);
      edges[u].push({ to: v, w });
      edges[v].push({ to: u, w });
    }
  }

  return { nodes, edges };
}
