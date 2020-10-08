import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import path from 'path'
import { 
  getDataOfHasParts, 
  getGeojsonsFromRdf,
  getJrsLodDataAndUri
} from './lib/utils'
import { 
  HOKKAIDO, 
  TOHOKU, 
  KANTO, 
  CHUBU, 
  KINKI, 
  CHUGOKU, 
  SHIKOKU, 
  KYUSYU 
} from './lib/companies.json'

Vue.use(Vuex)

const domain = `https://uedayou.net/jrslod/`;

export default new Vuex.Store({
  state: {
    companyList: [...HOKKAIDO,...TOHOKU,...KANTO,...CHUBU,...KINKI,...CHUGOKU,...SHIKOKU,...KYUSYU],
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
    }
  },
  actions: {
    async getLineList(context) {
      const company = context.state.target.company;
      if (!company) return;
      try {
        let thisUri = domain+company;
        let {hasparts} = await getJrsLodDataAndUri(thisUri);
        hasparts = hasparts.map(part=>path.basename(part));
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
        let thisUri = `${domain}${company}/${line}`;
        let {hasparts} = await getJrsLodDataAndUri(thisUri);
        hasparts = hasparts.map(part=>path.basename(part));
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
        let thisUri = `${domain}${company}/${line}/${station}`;
        let {uri, obj} = await getJrsLodDataAndUri(thisUri);
        const gj = getGeojsonsFromRdf(obj, uri);
        let geojson = {type: "FeatureCollection", features: [...gj]};
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
        let thisUri = `${domain}${company}/${line}`;
        let {uri, obj, hasparts} = await getJrsLodDataAndUri(thisUri);
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
        let thisUri = domain+company;
        let {hasparts} = await getJrsLodDataAndUri(thisUri);
        let geojson = await getDataOfHasParts(hasparts);
        context.commit("setGeoJson", geojson);
      } catch(e) {
        console.error(e);
      }
    },
    async getAllCompaniesGeoJson(context) {
      try {
        /*
        // 各鉄道会社のデータから個別にダウンロードする場合(時間がかかる)
        let list = context.state.companyList;
        list = list.map(company=>domain+company);
        let geojson = await getDataOfHasParts(list);
        context.commit("setGeoJson", geojson);
        */
        let res = await axios.get(domain+"top.geojson");
        context.commit("setGeoJson", res.data);
      } catch(e) {
        console.error(e);
      }
    }
  }
})