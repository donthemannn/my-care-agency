import * as NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 });

export interface ZipCodeInfo {
  county: string;
  state: string;
  countyFips: string;
  stateFips: string;
}

export async function zipToCountyFips(zip: string): Promise<string | null> {
  if (!zip || zip.length !== 5) return null;
  
  const cached = cache.get<string>(zip);
  if (cached) return cached;

  try {
    const resp = await fetch(
      `https://geo.fcc.gov/api/census/area?format=json&zip=${zip}`
    );
    
    if (!resp.ok) return null;
    
    const data = await resp.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    const countyFips = result.county_fips;
    
    if (countyFips) {
      cache.set(zip, countyFips);
      return countyFips;
    }
    
    return null;
  } catch (error) {
    console.error(`Error looking up zip code ${zip}:`, error);
    return null;
  }
}

export async function getZipCodeInfo(zip: string): Promise<ZipCodeInfo | null> {
  if (!zip || zip.length !== 5) return null;
  
  const cacheKey = `info_${zip}`;
  const cached = cache.get<ZipCodeInfo>(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(
      `https://geo.fcc.gov/api/census/area?format=json&zip=${zip}`
    );
    
    if (!resp.ok) return null;
    
    const data = await resp.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    const info: ZipCodeInfo = {
      county: result.county_name,
      state: result.state_code,
      countyFips: result.county_fips,
      stateFips: result.state_fips
    };
    
    cache.set(cacheKey, info);
    return info;
  } catch (error) {
    console.error(`Error getting zip code info for ${zip}:`, error);
    return null;
  }
}

export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses
  };
}
