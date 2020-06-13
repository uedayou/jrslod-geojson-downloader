<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-toolbar-title>
      鉄道駅LOD GeoJSON ダウンローダー
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-tooltip 
      bottom
      :max-width="250"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn 
          icon 
          v-bind="attrs"
          v-on="on"
          @click="downloadGeoJson"
        >
          <v-icon>mdi-cloud-download</v-icon>
        </v-btn>
      </template>
      <span>表示中のGeoJsonをファイルとしてダウンロードできます</span>
    </v-tooltip>
  </v-app-bar>
</template>

<script>
export default {
  name: 'AppBar',
  data: () => ({
  }),
  methods: {
    downloadGeoJson() {
      if (this.$store.getters.getGeoJson) {
        const jsonStr = "data:text/json;charset=utf-8,"+
          encodeURIComponent(JSON.stringify(this.$store.getters.getGeoJson));
        let a = document.createElement('a');
        a.setAttribute("href", jsonStr);
        a.setAttribute("download", this.$store.getters.getFilename+".geojson");
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  }
}
</script>

<style>
</style>