<template>
  <div id="loader">
    <Map :geojson="geojson" />
    <v-overlay v-show="loading" z-index="1000">
      <v-progress-circular
        indeterminate
        color="white">
      </v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import Map from './Map';

export default {
  name: 'Loader',
  components: {
    Map,
  },
  mounted() {
    this.$store.dispatch("getAllCompaniesGeoJson")
      .then(this.geoJsonDidLoad)
      .finally(()=>this.loading = false);
  },
  data: () => ({
    loading: true,
    geojson: null
  }),
  methods: {
    geoJsonDidLoad() {
      if (this.$store.getters.getGeoJson)
        this.geojson = this.$store.getters.getGeoJson;
    }
  },
  computed: {
    target() {
      return this.$store.getters.getTarget;
    }
  },
  watch: {
    target(value) {
      this.loading = true;
      let dispatchName = "getAllCompaniesGeoJson";
      if (value.company && value.line && value.station)
        dispatchName = "getStationGeoJson";
      else if (value.company && value.line)
        dispatchName = "getLineGeoJson"
      else if (value.company)
        dispatchName = "getCompanyGeoJson"

      this.$store.dispatch(dispatchName)
        .then(this.geoJsonDidLoad)
        .finally(()=>this.loading = false);
    }
  }
}
</script>
