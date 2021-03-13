<template>
  <div class="map">
    <l-map 
      :zoom="zoom"
      :center="center"
      :maxZoom="maxZoom"
      ref="map">
      <l-control-scale
        position="bottomleft"
        :imperial="false"
        :metric="true" />
      <l-tile-layer
        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        url=" https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <l-geo-json 
        :geojson="geojson" 
        :options="options"
        :options-style="styleFunction" />
    </l-map>
  </div>
</template>

<script>
import { 
  LMap, 
  LTileLayer, 
  LControlScale, 
  LGeoJson
} from 'vue2-leaflet';
import L from 'leaflet';

export default {
  name: 'Map',
  components: {
    LMap,
    LTileLayer,
    LControlScale,
    LGeoJson,
  },
  props: {
    geojson: [Object, Array]
  },
  data: () => ({
    center: [35, 135],
    zoom:5,
    maxZoom: 17,
    options: {
      onEachFeature: function(feature, layer) {
        if (feature.properties.name&&feature.properties.uri) {
          const inner = 
            `<a href="${feature.properties.uri}" target="_blank">
              ${feature.properties.name}
            </a>`;
          const popupContent = `<div>${inner}</div>`;
          layer.bindPopup(popupContent);
        }
      },
      pointToLayer: function(feature,latlng) {
        const mySvgString = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="midnightblue" d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/></svg>';
        const myIconUrl = encodeURI("data:image/svg+xml," + mySvgString).replace('#','%23');
        const myIcon = L.icon({
          iconUrl: myIconUrl,
          shadowUrl: myIconUrl,
          iconSize: [30, 30],
          shadowSize: [30, 30],
          iconAnchor: [15, 20],
          shadowAnchor: [15, 20],
          popupAnchor: [0, 0]
        })
        return L.marker(latlng, { icon: myIcon })
      }
    }
  }),
  methods: {
    styleFunction: function(feature) {
      if (feature.properties.color)
        return {color: "#"+feature.properties.color};
      const h = Math.random() * 360;
      return {color: `hsl(${h}, 60%, 50%)`};
    }
  },
  watch: {
    geojson: {
      immediate: true,
      handler: function () {
        if (!this.geojson) return;
        this.$nextTick(() => {
          const group = L.geoJson(this.geojson);
          this.$refs.map.fitBounds(group.getBounds())
        })
      }
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