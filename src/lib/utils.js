import {parse as WktParser} from 'wellknown';

// fetch は HTTP エラーで reject しないため、!res.ok を明示的に throw する。
// これを省くと呼び出し側の try/catch が 404/500 を捕捉できず undefined が下流に流れる。
export async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

// 鉄道駅LOD の URI (https://uedayou.net/jrslod/東日本旅客鉄道/山手線) から末尾要素を取り出す。
export const basename = (uri) => uri.split("/").pop();

export function getUriAndRdf(rdfs, uri) {
  let obj = rdfs[uri];
  if (!obj) {
    uri = Object.keys(rdfs)[0];
    obj = rdfs[uri];
  }
  return {obj, uri};
}

export function getHasParts(obj) {
  const hasparts = [];
  const uri = "http://purl.org/dc/terms/hasPart";
  if (uri in obj) {
    for (const v of obj[uri]) {
      hasparts.push(v.value);
    }
  }
  return hasparts;
}

export async function getDataOfHasParts(hasparts){
  const gets = [], gjs = [];
  for (let i=0;i<hasparts.length;i++) {
    gets.push(hasparts[i]);
    if (gets.length===10||hasparts.length===i+1) {
      try {
        const rs = await Promise.all(
          gets.map(async (_uri) => ({ uri: _uri, data: await getJson(`${_uri}.json`) }))
        );
        for (const { uri, data } of rs) {
          const o = getUriAndRdf(data, uri);
          const obj = o.obj;
          const thatUri = o.uri;
          const gj = getGeojsonsFromRdf(obj, thatUri);
          gjs.push(...gj);
        }
      } catch(e) {
        console.error(e);
      }
      gets.length = 0;
    }
  }
  const geojson = {
    type: "FeatureCollection",
    features: [...gjs]
  };
  return geojson;
}

export function getGeojsonsFromRdf(rdfs, uri, isUsePoint=true) {
  const label = getValueByUri(rdfs, 'http://www.w3.org/2000/01/rdf-schema#label');
  const color = getValueByUri(rdfs, 'http://www.wikidata.org/prop/direct/P465');
  let prop = "http://www.opengis.net/ont/geosparql#asWKT";
  const geojsons = [];
  for (const obj of rdfs[prop]) {
    const json = getGeoJsonFromWkt(obj.value, label, uri);
    if (color) json.properties.color = color;
    geojsons.push(json);
  }
  if (isUsePoint) {
    let lat, long;
    prop = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
    if (prop in rdfs) lat = Number(rdfs[prop][0].value);
    prop = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
    if (prop in rdfs) long = Number(rdfs[prop][0].value);
    if (lat&&long) {
      geojsons.push(getGeoJsonFromWkt(`POINT(${long} ${lat})`, label, uri));
    }
  }
  return geojsons;
}

export function getGeoJsonFromWkt(wkt, name, uri) {
  const obj = WktParser(wkt);
  let properties = {};
  if (name&&uri) {
    properties = { name, uri };
  }
  const json = {
    properties,
    type: 'Feature',
    geometry: { ...obj }
  };
  return json;
}

export function getValueByUri(rdfs, uri) {
  const obj = getArrayByUri(rdfs, uri);
  if (obj) return obj[0].value;
}

export function getArrayByUri(rdfs, uri) {
  if (rdfs && uri in rdfs) return rdfs[uri];
}
