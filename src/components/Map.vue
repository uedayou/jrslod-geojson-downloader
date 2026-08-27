<template>
  <div ref="mapEl" class="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATION_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="midnightblue" d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/></svg>';
const STATION_ICON_URL = encodeURI("data:image/svg+xml," + STATION_ICON_SVG).replace('#', '%23');

export default {
  name: 'Map',
  props: {
    geojson: [Object, Array]
  },
  data: () => ({
    map: null,
    geoJsonLayer: null,
  }),
  mounted() {
    this.map = L.map(this.$refs.mapEl, { maxZoom: 17 }).setView([35, 135], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(this.map);
    this.renderGeoJson();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  watch: {
    geojson() {
      this.renderGeoJson();
    }
  },
  methods: {
    renderGeoJson() {
      if (!this.map) return;
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
        this.geoJsonLayer = null;
      }
      if (!this.geojson) return;

      this.geoJsonLayer = L.geoJSON(this.geojson, {
        style: this.styleFunction,
        onEachFeature(feature, layer) {
          const { name, uri } = feature.properties || {};
          if (name && uri) {
            const link = document.createElement('a');
            link.setAttribute('href', uri);
            link.setAttribute('target', '_blank');
            link.textContent = name;
            const wrapper = document.createElement('div');
            wrapper.appendChild(link);
            layer.bindPopup(wrapper);
          }
        },
        pointToLayer(feature, latlng) {
          const myIcon = L.icon({
            iconUrl: STATION_ICON_URL,
            shadowUrl: STATION_ICON_URL,
            iconSize: [30, 30],
            shadowSize: [30, 30],
            iconAnchor: [15, 20],
            shadowAnchor: [15, 20],
            popupAnchor: [0, 0]
          });
          return L.marker(latlng, { icon: myIcon });
        }
      }).addTo(this.map);

      const bounds = this.geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds);
      }
    },
    styleFunction(feature) {
      if (feature.properties.color)
        return { color: "#" + feature.properties.color };
      const h = Math.random() * 360;
      return { color: `hsl(${h}, 60%, 50%)` };
    }
  }
}
</script>

<style>
.map {
  z-index: 1;
  width: 100%;
  height: 72vh;
  background-color: darkgray;
}
</style>
