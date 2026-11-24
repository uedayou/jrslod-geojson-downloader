import { createStore } from 'vuex'
import {
  getDataOfHasParts,
  getGeojsonsFromRdf,
  getJson,
  basename
} from './lib/utils'
import {
  getJrsLodDataAndUri
} from './lib/jrs-utils'

const SERVICE_URL = `https://uedayou.net/jrslod/`;
// 鉄道会社リスト。鉄道駅LOD の更新に追随するため実行時に取得する
// （地方キー -> [{name, img?}, ...] という構造）。
const COMPANIES_URL = `https://uedayou.net/jrslod/static/data/companies/latest.json`;

export default createStore({
  state: {
    companyList: [],
    lineList: [],
    stationList: [],
    geojson: null,
    target: {}
  },
  getters: {
    isDownloadable: state => !!state.geojson,
    getTarget: state => state.target,
    getGeoJson: state => state.geojson,
    getCompanyList: state => state.companyList,
    getLineList: state => state.lineList,
    getStationList: state => state.stationList,
    getFilename: state => {
      let filename;
      filename = state.target.company || "";
      filename += state.target.line || "";
      filename += state.target.station || "";
      if (filename.length===0) filename = "allcompanies";
      return filename;
    }
  },
  mutations: {
    setGeoJson(state, geojson) {
      state.geojson = geojson;
    },
    setStation(state, station) {
      if (state.target.company && state.target.line)
        state.target = {
          company: state.target.company,
          line: state.target.line,
          station
        };
    },
    setLine(state, line) {
      if (state.target.company)
        state.target = {
          company: state.target.company,
          line
        };
    },
    setCompany(state, company) {
      state.target = {company};
    },
    setLineList(state, lineList) {
      state.lineList = lineList;
    },
    setStationList(state, stationList) {
      state.stationList = stationList;
    },
    setCompanyList(state, companyList) {
      state.companyList = companyList;
    }
  },
  actions: {
    async fetchCompanyList(context) {
      try {
        const data = await getJson(COMPANIES_URL);
        // 地方ごとにグループ化したまま保持する（[{region, companies}, ...]）。
        // 複数地方に跨る会社は各地方に現れる（重複は許容）。
        const companyList = Object.entries(data).map(([region, companies]) => ({
          region,
          companies: companies.map(c => c.name),
        }));
        context.commit("setCompanyList", companyList);
      } catch (e) {
        console.error(e);
      }
    },
    async getLineList(context) {
      const company = context.state.target.company;
      if (!company) return;
      try {
        const thisUri = SERVICE_URL+company;
        let {hasparts} = await getJrsLodDataAndUri(thisUri);
        hasparts = hasparts.map(part=>basename(part));
        context.commit("setLineList", hasparts);
        context.commit("setStationList", []);
      } catch (e) {
        console.error(e);
      }
    },
    async getStationList(context) {
      const company = context.state.target.company,
            line = context.state.target.line;
      if (!company || !line) return;
      try {
        const thisUri = `${SERVICE_URL}${company}/${line}`;
        let {hasparts} = await getJrsLodDataAndUri(thisUri);
        hasparts = hasparts.map(part=>basename(part));
        context.commit("setStationList", hasparts);
      } catch (e) {
        console.error(e);
      }
    },
    async getStationGeoJson(context) {
      const company = context.state.target.company,
            line = context.state.target.line,
            station = context.state.target.station;
      if (!company || !line || !station) return;
      try {
        const thisUri = `${SERVICE_URL}${company}/${line}/${station}`;
        const {uri, obj} = await getJrsLodDataAndUri(thisUri);
        const gj = getGeojsonsFromRdf(obj, uri);
        const geojson = {type: "FeatureCollection", features: [...gj]};
        context.commit("setGeoJson", geojson);
      } catch(e) {
        console.error(e);
      }
    },
    async getLineGeoJson(context) {
      const company = context.state.target.company,
            line = context.state.target.line;
      if (!company || !line) return;
      try {
        const thisUri = `${SERVICE_URL}${company}/${line}`;
        const {uri, obj, hasparts} = await getJrsLodDataAndUri(thisUri);
        let geojson = await getDataOfHasParts(hasparts);
        const gj = getGeojsonsFromRdf(obj, uri);
        if (geojson.features) {
          geojson.features = [...geojson.features, ...gj];
        } else {
          geojson = {type: "FeatureCollection", features: [...gj]};
        }
        context.commit("setGeoJson", geojson);
      } catch(e) {
        console.error(e);
      }
    },
    async getCompanyGeoJson(context) {
      const company = context.state.target.company;
      if (!company) return;
      try {
        const thisUri = SERVICE_URL+company;
        const {hasparts} = await getJrsLodDataAndUri(thisUri);
        const geojson = await getDataOfHasParts(hasparts);
        context.commit("setGeoJson", geojson);
      } catch(e) {
        console.error(e);
      }
    },
    async getAllCompaniesGeoJson(context) {
      try {
        const geojson = await getJson(SERVICE_URL+"top.geojson");
        context.commit("setGeoJson", geojson);
      } catch(e) {
        console.error(e);
      }
    }
  }
})