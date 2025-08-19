interface SmartyStreetsResponse {
  results: Array<{
    components: {
      county_fips: string;
      county_name: string;
      state_abbreviation: string;
      zipcode: string;
    };
    metadata: {
      county_fips: string;
      county_name: string;
      state_abbreviation: string;
    };
  }>;
}

export class SmartyStreetsService {
  private authId: string;
  private authToken: string;
  private baseUrl = 'https://us-zipcode.api.smartystreets.com/lookup';

  constructor() {
    this.authId = process.env.SMARTYSTREETS_AUTH_ID || '';
    this.authToken = process.env.SMARTYSTREETS_AUTH_TOKEN || '';
    
    if (!this.authId || !this.authToken) {
      console.warn('SmartyStreets credentials not found. Falling back to manual mapping.');
    }
  }

  async zipToCountyFips(zipCode: string): Promise<string | null> {
    if (!this.authId || !this.authToken) {
      return null;
    }

    try {
      const url = `${this.baseUrl}?auth-id=${this.authId}&auth-token=${this.authToken}&zipcode=${zipCode}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`SmartyStreets API error: ${response.status}`);
        return null;
      }

      const data: SmartyStreetsResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return result.components.county_fips || result.metadata.county_fips;
      }
      
      return null;
    } catch (error) {
      console.error('SmartyStreets lookup error:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(this.authId && this.authToken);
  }
}

export const smartyStreetsService = new SmartyStreetsService();
