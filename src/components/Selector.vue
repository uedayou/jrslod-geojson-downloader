<template>
  <v-row justify="center">
    <v-col class="selector-col"
      cols="4"
      md="2"
    >
      <v-autocomplete class="selector"
        :items="$store.getters.getCompanyList"
        label="鉄道会社"
        return-object
        @change="changeCompany"
      ></v-autocomplete>
    </v-col>

    <v-col class="selector-col"
      cols="4"
      md="2"
    >
      <v-autocomplete class="selector"
        :items="$store.getters.getLineList"
        :disabled="$store.getters.getLineList.length===0"
        label="路線"
        return-object
        @change="changeLine"
      ></v-autocomplete>
    </v-col>
    <v-col class="selector-col"
      cols="4"
      md="2"
    >
      <v-autocomplete class="selector"
        :items="$store.getters.getStationList"
        :disabled="$store.getters.getStationList.length===0"
        label="駅"
        return-object
        @change="changeStation"
      ></v-autocomplete>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Selector',
  methods: {
    changeCompany(company) {
      this.$store.commit("setCompany", company);
      this.$store.dispatch("getLineList");
    },
    changeLine(line) {
      this.$store.commit("setLine", line);
      this.$store.dispatch("getStationList");
    },
    changeStation(station) {
      this.$store.commit("setStation", station);
    }
  }
}
</script>

<style>
.selector {
  z-index:1000;
}
.selector-col {
  padding-bottom:0px;
}
</style>