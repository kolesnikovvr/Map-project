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

class MinHeap {
  constructor() {
    this.data = [];
  }
  push(item) {
    this.data.push(item);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].f <= this.data[i].f) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1,
          r = 2 * i + 2;
        let m = i;
        if (l < this.data.length && this.data[l].f < this.data[m].f) m = l;
        if (r < this.data.length && this.data[r].f < this.data[m].f) m = r;
        if (m === i) break;
        [this.data[i], this.data[m]] = [this.data[m], this.data[i]];
        i = m;
      }
    }
    return top;
  }
  isEmpty() {
    return this.data.length === 0;
  }
}

export function findPath(graph, startLngLat, endLngLat) {
  const { nodes, edges } = graph;

  function nearest(pt) {
    let best = 0,
      bd = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      const d = haversine(nodes[i], pt);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }

  const start = nearest(startLngLat);
  const end = nearest(endLngLat);
  const N = nodes.length;

  const g = new Array(N).fill(Infinity);
  const prev = new Array(N).fill(-1);
  const open = new MinHeap();
  const closed = new Set();

  g[start] = 0;
  open.push({ id: start, f: haversine(nodes[start], nodes[end]) });

  while (!open.isEmpty()) {
    const { id: u } = open.pop();
    if (u === end) break;
    if (closed.has(u)) continue;
    closed.add(u);

    for (const { to: v, w } of edges[u]) {
      const ng = g[u] + w;
      if (ng < g[v]) {
        g[v] = ng;
        prev[v] = u;
        const f = ng + haversine(nodes[v], nodes[end]);
        open.push({ id: v, f });
      }
    }
  }

  const path = [];
  for (let cur = end; cur !== -1; cur = prev[cur]) {
    path.push(nodes[cur]);
  }
  return path.reverse();
}
