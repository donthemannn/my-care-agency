// Real zip code to county mapping for supported states
export interface ZipCodeInfo {
  zipCode: string
  city: string
  county: string
  state: string
  fipsCode: string
}

// Real Ohio zip codes and counties
export const OHIO_ZIP_CODES: ZipCodeInfo[] = [
  // Cleveland area (Cuyahoga County)
  { zipCode: '44101', city: 'Cleveland', county: 'Cuyahoga', state: 'OH', fipsCode: '39035' },
  { zipCode: '44102', city: 'Cleveland', county: 'Cuyahoga', state: 'OH', fipsCode: '39035' },
  { zipCode: '44103', city: 'Cleveland', county: 'Cuyahoga', state: 'OH', fipsCode: '39035' },
  { zipCode: '44104', city: 'Cleveland', county: 'Cuyahoga', state: 'OH', fipsCode: '39035' },
  { zipCode: '44105', city: 'Cleveland', county: 'Cuyahoga', state: 'OH', fipsCode: '39035' },
  
  // Columbus area (Franklin County)
  { zipCode: '43215', city: 'Columbus', county: 'Franklin', state: 'OH', fipsCode: '39049' },
  { zipCode: '43201', city: 'Columbus', county: 'Franklin', state: 'OH', fipsCode: '39049' },
  { zipCode: '43202', city: 'Columbus', county: 'Franklin', state: 'OH', fipsCode: '39049' },
  { zipCode: '43203', city: 'Columbus', county: 'Franklin', state: 'OH', fipsCode: '39049' },
  { zipCode: '43204', city: 'Columbus', county: 'Franklin', state: 'OH', fipsCode: '39049' },
  
  // Cincinnati area (Hamilton County)
  { zipCode: '45202', city: 'Cincinnati', county: 'Hamilton', state: 'OH', fipsCode: '39061' },
  { zipCode: '45203', city: 'Cincinnati', county: 'Hamilton', state: 'OH', fipsCode: '39061' },
  { zipCode: '45204', city: 'Cincinnati', county: 'Hamilton', state: 'OH', fipsCode: '39061' },
  { zipCode: '45205', city: 'Cincinnati', county: 'Hamilton', state: 'OH', fipsCode: '39061' },
  { zipCode: '45206', city: 'Cincinnati', county: 'Hamilton', state: 'OH', fipsCode: '39061' },
  
  // Toledo area (Lucas County)
  { zipCode: '43604', city: 'Toledo', county: 'Lucas', state: 'OH', fipsCode: '39095' },
  { zipCode: '43605', city: 'Toledo', county: 'Lucas', state: 'OH', fipsCode: '39095' },
  { zipCode: '43606', city: 'Toledo', county: 'Lucas', state: 'OH', fipsCode: '39095' },
  { zipCode: '43607', city: 'Toledo', county: 'Lucas', state: 'OH', fipsCode: '39095' },
  
  // Akron area (Summit County)
  { zipCode: '44301', city: 'Akron', county: 'Summit', state: 'OH', fipsCode: '39153' },
  { zipCode: '44302', city: 'Akron', county: 'Summit', state: 'OH', fipsCode: '39153' },
  { zipCode: '44303', city: 'Akron', county: 'Summit', state: 'OH', fipsCode: '39153' },
  { zipCode: '44304', city: 'Akron', county: 'Summit', state: 'OH', fipsCode: '39153' },
]

// Real Texas zip codes and counties
export const TEXAS_ZIP_CODES: ZipCodeInfo[] = [
  // Dallas area (Dallas County)
  { zipCode: '75201', city: 'Dallas', county: 'Dallas', state: 'TX', fipsCode: '48113' },
  { zipCode: '75202', city: 'Dallas', county: 'Dallas', state: 'TX', fipsCode: '48113' },
  { zipCode: '75203', city: 'Dallas', county: 'Dallas', state: 'TX', fipsCode: '48113' },
  { zipCode: '75204', city: 'Dallas', county: 'Dallas', state: 'TX', fipsCode: '48113' },
  { zipCode: '75205', city: 'Dallas', county: 'Dallas', state: 'TX', fipsCode: '48113' },
  
  // Houston area (Harris County)
  { zipCode: '77001', city: 'Houston', county: 'Harris', state: 'TX', fipsCode: '48201' },
  { zipCode: '77002', city: 'Houston', county: 'Harris', state: 'TX', fipsCode: '48201' },
  { zipCode: '77003', city: 'Houston', county: 'Harris', state: 'TX', fipsCode: '48201' },
  { zipCode: '77004', city: 'Houston', county: 'Harris', state: 'TX', fipsCode: '48201' },
  { zipCode: '77005', city: 'Houston', county: 'Harris', state: 'TX', fipsCode: '48201' },
  
  // Austin area (Travis County)
  { zipCode: '78701', city: 'Austin', county: 'Travis', state: 'TX', fipsCode: '48453' },
  { zipCode: '78702', city: 'Austin', county: 'Travis', state: 'TX', fipsCode: '48453' },
  { zipCode: '78703', city: 'Austin', county: 'Travis', state: 'TX', fipsCode: '48453' },
  { zipCode: '78704', city: 'Austin', county: 'Travis', state: 'TX', fipsCode: '48453' },
  { zipCode: '78705', city: 'Austin', county: 'Travis', state: 'TX', fipsCode: '48453' },
  
  // San Antonio area (Bexar County)
  { zipCode: '78201', city: 'San Antonio', county: 'Bexar', state: 'TX', fipsCode: '48029' },
  { zipCode: '78202', city: 'San Antonio', county: 'Bexar', state: 'TX', fipsCode: '48029' },
  { zipCode: '78203', city: 'San Antonio', county: 'Bexar', state: 'TX', fipsCode: '48029' },
  { zipCode: '78204', city: 'San Antonio', county: 'Bexar', state: 'TX', fipsCode: '48029' },
  
  // Fort Worth area (Tarrant County)
  { zipCode: '76101', city: 'Fort Worth', county: 'Tarrant', state: 'TX', fipsCode: '48439' },
  { zipCode: '76102', city: 'Fort Worth', county: 'Tarrant', state: 'TX', fipsCode: '48439' },
  { zipCode: '76103', city: 'Fort Worth', county: 'Tarrant', state: 'TX', fipsCode: '48439' },
  { zipCode: '76104', city: 'Fort Worth', county: 'Tarrant', state: 'TX', fipsCode: '48439' },
]

// Real Alabama zip codes and counties
export const ALABAMA_ZIP_CODES: ZipCodeInfo[] = [
  // Birmingham area (Jefferson County)
  { zipCode: '35203', city: 'Birmingham', county: 'Jefferson', state: 'AL', fipsCode: '01073' },
  { zipCode: '35204', city: 'Birmingham', county: 'Jefferson', state: 'AL', fipsCode: '01073' },
  { zipCode: '35205', city: 'Birmingham', county: 'Jefferson', state: 'AL', fipsCode: '01073' },
  { zipCode: '35206', city: 'Birmingham', county: 'Jefferson', state: 'AL', fipsCode: '01073' },
  { zipCode: '35207', city: 'Birmingham', county: 'Jefferson', state: 'AL', fipsCode: '01073' },
  
  // Montgomery area (Montgomery County)
  { zipCode: '36101', city: 'Montgomery', county: 'Montgomery', state: 'AL', fipsCode: '01101' },
  { zipCode: '36102', city: 'Montgomery', county: 'Montgomery', state: 'AL', fipsCode: '01101' },
  { zipCode: '36103', city: 'Montgomery', county: 'Montgomery', state: 'AL', fipsCode: '01101' },
  { zipCode: '36104', city: 'Montgomery', county: 'Montgomery', state: 'AL', fipsCode: '01101' },
  
  // Mobile area (Mobile County)
  { zipCode: '36601', city: 'Mobile', county: 'Mobile', state: 'AL', fipsCode: '01097' },
  { zipCode: '36602', city: 'Mobile', county: 'Mobile', state: 'AL', fipsCode: '01097' },
  { zipCode: '36603', city: 'Mobile', county: 'Mobile', state: 'AL', fipsCode: '01097' },
  { zipCode: '36604', city: 'Mobile', county: 'Mobile', state: 'AL', fipsCode: '01097' },
  
  // Huntsville area (Madison County)
  { zipCode: '35801', city: 'Huntsville', county: 'Madison', state: 'AL', fipsCode: '01089' },
  { zipCode: '35802', city: 'Huntsville', county: 'Madison', state: 'AL', fipsCode: '01089' },
  { zipCode: '35803', city: 'Huntsville', county: 'Madison', state: 'AL', fipsCode: '01089' },
  { zipCode: '35804', city: 'Huntsville', county: 'Madison', state: 'AL', fipsCode: '01089' },
]

// Combined mapping
export const ALL_ZIP_CODES = [
  ...OHIO_ZIP_CODES,
  ...TEXAS_ZIP_CODES,
  ...ALABAMA_ZIP_CODES
]

export function getZipCodeInfo(zipCode: string): ZipCodeInfo | null {
  return ALL_ZIP_CODES.find(zip => zip.zipCode === zipCode) || null
}

export function getZipCodesByState(state: string): ZipCodeInfo[] {
  return ALL_ZIP_CODES.filter(zip => zip.state === state.toUpperCase())
}

export function getZipCodesByCounty(state: string, county: string): ZipCodeInfo[] {
  return ALL_ZIP_CODES.filter(zip => 
    zip.state === state.toUpperCase() && 
    zip.county.toLowerCase() === county.toLowerCase()
  )
}
