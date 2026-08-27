import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// publicPath: './' 相当。デモは /jrslod-geojson-downloader/ 配下に配信されるため相対パス必須。
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
})
