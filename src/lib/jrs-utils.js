import axios from 'axios'
import { getUriAndRdf } from './utils'

export function getHasParts(obj) {
  const hasparts = [];
  const uri = "http://www.wikidata.org/prop/direct/P527";
  if (uri in obj) {
    for (const v of obj[uri]) {
      hasparts.push(v.value);
    }
  }
  return hasparts;
}

export async function getJrsLodDataAndUri(uri) {
  try {
    const res = await axios.get( `${uri}.json`);
    const o = getUriAndRdf(res.data, uri);
    const obj = o.obj;
    uri = o.uri;
    const hasparts = getHasParts(obj);
    return {uri, obj, hasparts};
  } catch (e) {
    console.error(e);
  }
}