<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto text-card">
<v-card-text>
鉄道路線をポリラインデータ、鉄道駅をポイントデータとしてGeoJSON形式でまとめてダウンロードが可能なページです。<br>
例えば、鉄道会社「東日本旅客鉄道」(JR東日本)をプルダウンメニューから選択してダウンロードボタンを押すとJR東日本の全鉄道路線のポリラインデータをGeJSONファイルとしてダウンロードできます。<br>
詳しくは以下のZennの記事を参照してください<br>
<br>
<a href="https://zenn.dev/uedayou/articles/1ed26f7d49c3e8118429" target="_blank"><b>Zenn:鉄道路線のGeoJSONをダウンロードする方法</b></a>
</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="mx-auto text-card">
            <v-card-text>
              Step.1 GeoJSONとしてダウンロードしたい鉄道会社、鉄道路線、鉄道駅を選択してください
            </v-card-text>
            <Selector />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="mx-auto text-card">
            <v-card-text>
              Step.2 ダウンロードできるGeoJSONファイルの内容を地図上で確認してください
            </v-card-text>
            <Loader />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="mx-auto text-card">
            <v-card-text>
              Step.3 ボタンを押してファイルをダウンロードしてください
            </v-card-text>
            <v-btn block color="primary" @click="downloadGeoJson">
              GeoJSONをダウンロード
            </v-btn>
          </v-card>    
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import Loader from './Loader'
import Selector from './Selector'

export default {
  name: 'Layout',
  components: {
    Loader,
    Selector,
  },
  methods: {
    downloadGeoJson() {
      if (this.$store.getters.getGeoJson) {
        const jsonStr = "data:text/json;charset=utf-8,"+
          encodeURIComponent(JSON.stringify(this.$store.getters.getGeoJson));
        const a = document.createElement('a');
        a.setAttribute("href", jsonStr);
        a.setAttribute("download", this.$store.getters.getFilename+".geojson");
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  }
};
</script>

<style>
.text-card {
  max-width: 1024px !important
}
</style>