<template>
  <div ref="mapContainer" id="map"></div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildGraph } from '../utils/graphBuilder';
import { findPath } from '../utils/pathfinding';

export default {
  name: 'MapView',
  setup() {
    const mapContainer = ref(null);
    const state = reactive({
      map: null,
      startMarker: null,
      endMarker: null,
      graph: null,
      routeLayer: null,
    });

    const greenIcon = L.icon({
      iconUrl: '/icons/marker-green.svg',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    const redIcon = L.icon({
      iconUrl: '/icons/marker-red.svg',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    onMounted(async () => {
      state.map = L.map(mapContainer.value).setView([55.76, 37.64], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(state.map);

      const geojson = await fetch('/data/roads.geojson').then((r) => r.json());
      L.geoJSON(geojson, { style: { color: '#555', weight: 2 } }).addTo(
        state.map,
      );
      state.graph = buildGraph(geojson);

      state.map.on('click', (e) => {
        if (!state.startMarker) {
          state.startMarker = createDraggableMarker(e.latlng, 'start');
        } else if (!state.endMarker) {
          state.endMarker = createDraggableMarker(e.latlng, 'end');
          computeAndDraw();
        } else {
          clearRoute();
          state.startMarker = createDraggableMarker(e.latlng, 'start');
        }
      });
    });

    function createDraggableMarker(latlng, type) {
      const icon = type === 'start' ? greenIcon : redIcon;
      const marker = L.marker(latlng, { icon, draggable: true }).addTo(
        state.map,
      );
      marker.on('dragend', () => {
        if (state.startMarker && state.endMarker) {
          computeAndDraw();
        }
      });
      return marker;
    }

    function computeAndDraw() {
      const startLatLng = state.startMarker.getLatLng();
      const endLatLng = state.endMarker.getLatLng();
      const startArr = [startLatLng.lng, startLatLng.lat];
      const endArr = [endLatLng.lng, endLatLng.lat];

      const pathCoords = findPath(state.graph, startArr, endArr);

      if (state.routeLayer) state.map.removeLayer(state.routeLayer);

      state.routeLayer = L.polyline(
        pathCoords.map((c) => [c[1], c[0]]),
        { color: 'blue', weight: 4 },
      ).addTo(state.map);
    }

    function clearRoute() {
      if (state.routeLayer) state.map.removeLayer(state.routeLayer);
      if (state.startMarker) state.map.removeLayer(state.startMarker);
      if (state.endMarker) state.map.removeLayer(state.endMarker);
      state.startMarker = null;
      state.endMarker = null;
      state.routeLayer = null;
    }

    return { mapContainer };
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
