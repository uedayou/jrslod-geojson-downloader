<template>
  <v-row justify="center">
    <v-col class="selector-col"
      cols="4"
      md="2"
    >
      <v-autocomplete class="selector"
        :items="companyItems"
        item-title="title"
        item-value="value"
        label="鉄道会社"
        @update:model-value="changeCompany"
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
        @update:model-value="changeLine"
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
        @update:model-value="changeStation"
      ></v-autocomplete>
    </v-col>
  </v-row>
</template>

<script>
// latest.json の地方キー（ローマ字）→ 表示用の地域名。未知のキーはそのまま表示する。
const REGION_LABELS = {
  HOKKAIDO: '北海道',
  TOHOKU: '東北',
  KANTO: '関東',
  CHUBU: '中部',
  KINKI: '近畿',
  CHUGOKU: '中国',
  SHIKOKU: '四国',
  KYUSYU: '九州',
};

// 同じ会社が複数グループ（JR と各地方）に出るため、value を「グループキー + "|" +
// 会社名」で一意にする。value を共有すると Vuetify が選択表示を一致 item ごとに
// 複数行描画してしまう。グループキーは英大文字のみ、会社名に "|" は含まれない。
const SEP = '|';
const mkItem = (group, name) => ({ title: name, value: group + SEP + name });
// JR 旅客会社の判定（6 社。地方跨りでも JR グループには 1 回だけ出す）。
const isJr = (name) => name.endsWith('旅客鉄道');

export default {
  name: 'Selector',
  created() {
    this.$store.dispatch("fetchCompanyList");
  },
  computed: {
    // v-autocomplete の items。先頭に JR グループ、続いて地方グループ（JR は除外）。
    // サブヘッダは { type: 'subheader' }、会社は { title: 会社名, value: 一意キー }。
    companyItems() {
      const groups = this.$store.getters.getCompanyList;
      const items = [];

      const jrNames = [...new Set(
        groups.flatMap(g => g.companies).filter(isJr)
      )];
      if (jrNames.length) {
        items.push({ type: 'subheader', title: 'JR' });
        for (const name of jrNames) items.push(mkItem('JR', name));
      }

      for (const { region, companies } of groups) {
        const rest = companies.filter(name => !isJr(name));
        if (!rest.length) continue;
        items.push({ type: 'subheader', title: REGION_LABELS[region] || region });
        for (const name of rest) items.push(mkItem(region, name));
      }
      return items;
    }
  },
  methods: {
    changeCompany(value) {
      // value は "グループ + SEP + 会社名"。会社名だけ取り出す。
      const company = value ? value.slice(value.indexOf(SEP) + 1) : value;
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
