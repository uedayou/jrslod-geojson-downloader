import axios from "axios";
import {parse as WktParser} from 'wellknown';

export function getUriAndRdf(rdfs, uri) {
  let obj = rdfs[uri];
  if (!obj) {
    uri = Object.keys(rdfs)[0];
    obj = rdfs[uri];
  }
  return {obj, uri};
}

export function getHasParts(obj) {
  let hasparts = [];
  if ("http://www.wikidata.org/prop/direct/P527" in obj) {
    for (const v of obj["http://www.wikidata.org/prop/direct/P527"]) {
      hasparts.push(v.value);
    }
  }
  return hasparts;
}

export async function getDataOfHasParts(hasparts){
  let gets = [];
  let gjs = [];
  for (let i=0;i<hasparts.length;i++) {
    gets.push(hasparts[i]);
    if (gets.length===10||hasparts.length===i+1) {
      try {
        const rs = await Promise.all(
          gets.map((_uri)=>axios.get(_uri+".json"))
        );
        for (const r of rs) {
          let thatUri = r.config.url.replace(".json", "");
          let o = getUriAndRdf(r.data, thatUri);
          let obj = o.obj;
          thatUri = o.uri;
          let gj = getGeojsonsFromRdf(obj, thatUri);
          gjs.push(...gj);
        }
      } catch(e) {
        console.error(e);
      }
      gets.length = 0;
    }
  }
  let geojson;
  geojson = {
    type: "FeatureCollection",
    features: [...gjs]
  };
  return geojson;
}

export function getGeojsonsFromRdf(rdfs, uri) {
  let label = getValueByUri(rdfs, 'http://www.w3.org/2000/01/rdf-schema#label');
  let color = getValueByUri(rdfs, 'http://www.wikidata.org/prop/direct/P465');
  let prop = "http://www.opengis.net/ont/geosparql#asWKT";
  let geojsons = [];
  for (let obj of rdfs[prop]) {
    const json = getGeoJsonFromWkt(obj.value, label, uri);
    if (color) json.properties.color = color;
    geojsons.push(json);
  }
  let lat, long;
  prop = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
  if (prop in rdfs) lat = Number(rdfs[prop][0].value);
  prop = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
  if (prop in rdfs) long = Number(rdfs[prop][0].value);
  if (lat&&long) {
    geojsons.push(getGeoJsonFromWkt(`POINT(${long} ${lat})`, label, uri));
  }
  return geojsons;
}

export function getGeoJsonFromWkt(wkt, name, uri) {
  let obj = WktParser(wkt);
  let properties = {}
  if (name&&uri) {
    properties = { name, uri };
  }
  const json = {
    properties,
    type: 'Feature',
    geometry: {...obj}
  };
  return json;
}

export function getValueByUri(rdfs, uri) {
  const obj = getArrayByUri(rdfs, uri);
  if (obj) return obj[0].value;
}

export function getArrayByUri(rdfs, uri) {
  if (rdfs && uri in rdfs)
    return rdfs[uri];
}

export async function getJrsLodDataAndUri(uri) {
  try {
    const res = await axios.get( `${uri}.json`);
    let o = getUriAndRdf(res.data, uri);
    let obj = o.obj;
    uri = o.uri;
    let hasparts = getHasParts(obj);
    return {uri, obj, hasparts};
  } catch (e) {
    console.error(e);
  }
}