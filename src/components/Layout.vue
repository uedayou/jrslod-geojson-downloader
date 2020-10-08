<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mx-auto" max-width="1024">
<v-card-text>
鉄道路線をポリラインデータ、鉄道駅をポイントデータとしてGeoJSON形式でまとめてダウンロードが可能なページです。<br>
例えば、鉄道会社「東日本旅客鉄道」(JR東日本)をプルダウンメニューから選択してダウンロードボタンを押すとJR東日本の全鉄道路線のポリラインデータをGeJSONファイルとしてダウンロードできます。<br>
詳しくは以下のQiitaの記事を参照してください<br>
<br>
<a href="https://qiita.com/uedayou/items/b5131b5ca930fe0bef69#%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89%E3%81%97%E3%81%9F%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E6%B4%BB%E7%94%A8%E6%B3%95" target="_blank"><b>Qiita:緯度経度付き鉄道オープンデータ提供サイト公開しました#ダウンロードしたデータの活用法</b></a>
</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" style="padding-bottom:0px">
          <v-card class="mx-auto" max-width="1024">
            <v-card-text style="padding-bottom:0px">
              Step.1 GeoJSONとしてダウンロードしたい鉄道会社、鉄道路線、鉄道駅を選択してください
            </v-card-text>
            <Selector />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="mx-auto" max-width="1024">
            <v-card-text>
              Step.2 ダウンロードできるGeoJSONファイルの内容を地図上で確認してください
            </v-card-text>
            <Loader />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="mx-auto" max-width="1024">
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
  data: () => ({
    //
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
};
</script>