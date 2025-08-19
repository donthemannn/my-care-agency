interface CMSPlanSearchRequest {
  place: {
    countyfips: string;
    state: string;
    zipcode: string;
  };
  year: number;
  market: string;
}

interface CMSPlan {
  id: string;
  name: string;
  issuer: {
    name: string;
  };
  premium: number;
  deductible?: {
    individual?: number;
    family?: number;
  };
  out_of_pocket_maximum?: {
    individual?: number;
    family?: number;
  };
  metal_level: string;
  plan_type: string;
  network_tier?: string;
}

interface CMSSubsidyRequest {
  household: {
    income: number;
    people: Array<{
      age: number;
      aptc_eligible: boolean;
      does_not_require_coverage: boolean;
      is_pregnant: boolean;
      is_parent: boolean;
      uses_tobacco: boolean;
    }>;
  };
  place: {
    countyfips: string;
    state: string;
    zipcode: string;
  };
  year: number;
  market: string;
}

interface CMSSubsidyResponse {
  estimates: Array<{
    aptc: number;
    csr: string;
    is_medicaid_chip: boolean;
    in_coverage_gap: boolean;
  }>;
}

class CMSApiService {
  private apiKey: string;
  private baseUrl = 'https://marketplace.api.healthcare.gov/api/v1';

  constructor() {
    this.apiKey = process.env.CMS_API_KEY || process.env.HEALTHCARE_GOV_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('CMS API key not found in environment variables');
    }
  }

  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}?apikey=${this.apiKey}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CMS API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async searchPlans(state: string, zipCode: string): Promise<CMSPlan[]> {
    const countyFips = await this.getCountyFips(state, zipCode);
    
    const request: CMSPlanSearchRequest = {
      place: {
        countyfips: countyFips,
        state: state.toUpperCase(),
        zipcode: zipCode,
      },
      year: 2025,
      market: 'Individual',
    };

    try {
      const response = await this.makeRequest<{ plans: CMSPlan[] }>('/plans/search', 'POST', request);
      return response.plans || [];
    } catch (error) {
      console.error('CMS Plan Search Error:', error);
      throw new Error(`Failed to search plans for ${zipCode}, ${state}: ${error}`);
    }
  }

  async calculateSubsidy(
    state: string,
    zipCode: string,
    income: number,
    householdSize: number,
    ages: number[]
  ): Promise<number> {
    const countyFips = await this.getCountyFips(state, zipCode);
    
    const people = ages.map(age => ({
      age,
      aptc_eligible: true,
      does_not_require_coverage: false,
      is_pregnant: false,
      is_parent: false,
      uses_tobacco: false,
    }));

    const request: CMSSubsidyRequest = {
      household: {
        income,
        people,
      },
      place: {
        countyfips: countyFips,
        state: state.toUpperCase(),
        zipcode: zipCode,
      },
      year: 2025,
      market: 'Individual',
    };

    try {
      const response = await this.makeRequest<CMSSubsidyResponse>('/households/eligibility/estimates', 'POST', request);
      return response.estimates?.[0]?.aptc || 0;
    } catch (error) {
      console.error('CMS Subsidy Calculation Error:', error);
      return 0;
    }
  }

  private async getCountyFips(state: string, zipCode: string): Promise<string> {
    // Try SmartyStreets first (most accurate)
    try {
      const { smartyStreetsService } = await import('./smartyStreetsService');
      if (smartyStreetsService.isConfigured()) {
        const fips = await smartyStreetsService.zipToCountyFips(zipCode);
        if (fips) {
          console.log(`SmartyStreets: ${zipCode} → ${fips}`);
          return fips;
        }
      }
    } catch (error) {
      console.warn('SmartyStreets lookup failed:', error);
    }

    // Try FCC API (free backup)
    try {
      const { zipToCountyFips } = await import('./zipService');
      const fips = await zipToCountyFips(zipCode);
      if (fips) {
        console.log(`FCC API: ${zipCode} → ${fips}`);
        return fips;
      }
    } catch (error) {
      console.warn('FCC API lookup failed:', error);
    }

    // Comprehensive Alabama zip code to FIPS mapping
    const zipToFipsMap: Record<string, string> = {
      // Jefferson County (Birmingham Metro) - FIPS: 01073
      '35005': '01073', '35006': '01073', '35007': '01073', '35020': '01073', '35021': '01073',
      '35022': '01073', '35023': '01073', '35040': '01073', '35043': '01073', '35068': '01073',
      '35071': '01073', '35080': '01073', '35085': '01073', '35094': '01073', '35111': '01073',
      '35114': '01073', '35116': '01073', '35117': '01073', '35118': '01073', '35120': '01073',
      '35124': '01073', '35126': '01073', '35127': '01073', '35128': '01073', '35130': '01073',
      '35131': '01073', '35133': '01073', '35135': '01073', '35136': '01073', '35137': '01073',
      '35139': '01073', '35146': '01073', '35147': '01073', '35148': '01073', '35173': '01073',
      '35175': '01073', '35176': '01073', '35178': '01073', '35180': '01073', '35188': '01073',
      '35201': '01073', '35202': '01073', '35203': '01073', '35204': '01073', '35205': '01073',
      '35206': '01073', '35207': '01073', '35208': '01073', '35209': '01073', '35210': '01073',
      '35211': '01073', '35212': '01073', '35213': '01073', '35214': '01073', '35215': '01073',
      '35216': '01073', '35217': '01073', '35218': '01073', '35219': '01073', '35220': '01073',
      '35221': '01073', '35222': '01073', '35223': '01073', '35224': '01073', '35226': '01073',
      '35228': '01073', '35229': '01073', '35233': '01073', '35234': '01073', '35235': '01073',
      '35236': '01073', '35237': '01073', '35238': '01073', '35242': '01073', '35243': '01073',
      '35244': '01073', '35246': '01073', '35249': '01073', '35253': '01073', '35254': '01073',
      '35255': '01073', '35259': '01073', '35260': '01073', '35266': '01073', '35282': '01073',
      '35283': '01073', '35285': '01073', '35287': '01073', '35288': '01073', '35290': '01073',
      '35291': '01073', '35292': '01073', '35293': '01073', '35294': '01073', '35295': '01073',
      '35296': '01073', '35297': '01073', '35298': '01073',

      // Montgomery County (Montgomery) - FIPS: 01101
      '36003': '01101', '36006': '01101', '36013': '01101', '36043': '01101', '36064': '01101',
      '36067': '01101', '36101': '01101', '36104': '01101', '36105': '01101', '36106': '01101',
      '36107': '01101', '36108': '01101', '36109': '01101', '36110': '01101', '36111': '01101',
      '36112': '01101', '36113': '01101', '36115': '01101', '36116': '01101', '36117': '01101',
      '36118': '01101', '36119': '01101', '36120': '01101', '36121': '01101', '36123': '01101',
      '36124': '01101', '36125': '01101', '36130': '01101', '36131': '01101', '36132': '01101',
      '36135': '01101', '36140': '01101', '36141': '01101', '36142': '01101', '36177': '01101',
      '36191': '01101',

      // Mobile County (Mobile) - FIPS: 01097
      '36502': '01097', '36503': '01097', '36505': '01097', '36507': '01097', '36511': '01097',
      '36512': '01097', '36515': '01097', '36521': '01097', '36522': '01097', '36523': '01097',
      '36524': '01097', '36526': '01097', '36527': '01097', '36528': '01097', '36529': '01097',
      '36530': '01097', '36532': '01097', '36533': '01097', '36535': '01097', '36541': '01097',
      '36542': '01097', '36544': '01097', '36545': '01097', '36549': '01097', '36551': '01097',
      '36558': '01097', '36559': '01097', '36560': '01097', '36561': '01097', '36562': '01097',
      '36567': '01097', '36571': '01097', '36572': '01097', '36575': '01097', '36576': '01097',
      '36577': '01097', '36578': '01097', '36582': '01097', '36587': '01097', '36590': '01097',
      '36601': '01097', '36602': '01097', '36603': '01097', '36604': '01097', '36605': '01097',
      '36606': '01097', '36607': '01097', '36608': '01097', '36609': '01097', '36610': '01097',
      '36611': '01097', '36612': '01097', '36613': '01097', '36615': '01097', '36616': '01097',
      '36617': '01097', '36618': '01097', '36619': '01097', '36628': '01097', '36633': '01097',
      '36640': '01097', '36641': '01097', '36644': '01097', '36652': '01097', '36660': '01097',
      '36663': '01097', '36670': '01097', '36671': '01097', '36675': '01097', '36685': '01097',
      '36689': '01097', '36691': '01097', '36693': '01097', '36695': '01097',

      // Tuscaloosa County (Tuscaloosa) - FIPS: 01125
      '35401': '01125', '35402': '01125', '35403': '01125', '35404': '01125', '35405': '01125',
      '35406': '01125', '35407': '01125', '35440': '01125', '35441': '01125', '35442': '01125',
      '35443': '01125', '35444': '01125', '35446': '01125', '35447': '01125', '35449': '01125',
      '35452': '01125', '35453': '01125', '35456': '01125', '35457': '01125', '35459': '01125',
      '35460': '01125', '35461': '01125', '35462': '01125', '35464': '01125', '35466': '01125',
      '35473': '01125', '35474': '01125', '35475': '01125', '35476': '01125', '35480': '01125',
      '35481': '01125', '35482': '01125', '35485': '01125', '35486': '01125', '35487': '01125',
      '35490': '01125', '35491': '01125',

      // Madison County (Huntsville) - FIPS: 01089
      '35741': '01089', '35742': '01089', '35743': '01089', '35744': '01089', '35745': '01089',
      '35746': '01089', '35748': '01089', '35749': '01089', '35750': '01089', '35751': '01089',
      '35752': '01089', '35753': '01089', '35754': '01089', '35755': '01089', '35756': '01089',
      '35757': '01089', '35758': '01089', '35759': '01089', '35760': '01089', '35761': '01089',
      '35762': '01089', '35763': '01089', '35764': '01089', '35765': '01089', '35766': '01089',
      '35767': '01089', '35768': '01089', '35769': '01089', '35770': '01089', '35771': '01089',
      '35772': '01089', '35773': '01089', '35774': '01089', '35775': '01089', '35776': '01089',
      '35801': '01089', '35802': '01089', '35803': '01089', '35804': '01089', '35805': '01089',
      '35806': '01089', '35807': '01089', '35808': '01089', '35809': '01089', '35810': '01089',
      '35811': '01089', '35812': '01089', '35813': '01089', '35814': '01089', '35815': '01089',
      '35816': '01089', '35824': '01089', '35893': '01089', '35894': '01089', '35895': '01089',
      '35896': '01089', '35898': '01089', '35899': '01089',

      // Lee County (Auburn/Opelika) - FIPS: 01081
      '36801': '01081', '36802': '01081', '36803': '01081', '36804': '01081', '36830': '01081',
      '36831': '01081', '36832': '01081', '36849': '01081', '36866': '01081', '36867': '01081',
      '36869': '01081', '36870': '01081', '36874': '01081', '36875': '01081', '36877': '01081',
      '36879': '01081', '36880': '01081',

      // Baldwin County (Gulf Shores/Orange Beach) - FIPS: 01003
      '36502': '01003', '36507': '01003', '36511': '01003', '36530': '01003', '36532': '01003',
      '36535': '01003', '36541': '01003', '36542': '01003', '36544': '01003', '36545': '01003',
      '36549': '01003', '36551': '01003', '36558': '01003', '36559': '01003', '36561': '01003',
      '36567': '01003', '36571': '01003', '36575': '01003', '36576': '01003', '36577': '01003',
      '36578': '01003', '36582': '01003', '36587': '01003', '36590': '01003',

      // Etowah County (Gadsden) - FIPS: 01055
      '35901': '01055', '35902': '01055', '35903': '01055', '35904': '01055', '35905': '01055',
      '35906': '01055', '35907': '01055', '35950': '01055', '35951': '01055', '35952': '01055',
      '35953': '01055', '35954': '01055', '35956': '01055', '35957': '01055', '35958': '01055',
      '35960': '01055', '35961': '01055', '35962': '01055', '35967': '01055', '35971': '01055',
      '35972': '01055', '35973': '01055', '35974': '01055', '35975': '01055', '35976': '01055',
      '35978': '01055', '35979': '01055', '35980': '01055', '35981': '01055', '35983': '01055',
      '35984': '01055', '35986': '01055', '35987': '01055', '35988': '01055', '35989': '01055',
      '35990': '01055',

      // Calhoun County (Anniston) - FIPS: 01015
      '36201': '01015', '36202': '01015', '36203': '01015', '36204': '01015', '36205': '01015',
      '36206': '01015', '36207': '01015', '36250': '01015', '36251': '01015', '36253': '01015',
      '36254': '01015', '36256': '01015', '36258': '01015', '36260': '01015', '36261': '01015',
      '36262': '01015', '36263': '01015', '36264': '01015', '36265': '01015', '36266': '01015',
      '36268': '01015', '36269': '01015', '36271': '01015', '36272': '01015', '36274': '01015',
      '36275': '01015', '36276': '01015', '36277': '01015', '36278': '01015', '36279': '01015',
      '36280': '01015', '36281': '01015', '36282': '01015', '36283': '01015', '36285': '01015',
    };

    const fips = zipToFipsMap[zipCode];
    if (fips) {
      console.log(`Manual mapping: ${zipCode} → ${fips}`);
      return fips;
    }
    
    throw new Error(`County FIPS code not found for zip code ${zipCode} in ${state}. Please try a different zip code or contact support.`);
  }

  async getStates(): Promise<any[]> {
    try {
      const response = await this.makeRequest<{ states: any[] }>('/states');
      return response.states || [];
    } catch (error) {
      console.error('CMS States Error:', error);
      return [];
    }
  }

  async getIssuers(): Promise<any[]> {
    try {
      const response = await this.makeRequest<{ issuers: any[] }>('/issuers');
      return response.issuers || [];
    } catch (error) {
      console.error('CMS Issuers Error:', error);
      return [];
    }
  }
}

export const cmsApiService = new CMSApiService();
export type { CMSPlan, CMSSubsidyResponse };
