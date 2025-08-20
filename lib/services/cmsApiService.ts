// ============================================
// CMS.GOV MARKETPLACE API SERVICE
// ============================================
// Official CMS API integration following developer guidelines
// https://developer.cms.gov/marketplace-api/

import { 
  CMSPlanSearchRequest, 
  CMSPlan, 
  CMSSubsidyRequest, 
  CMSSubsidyResponse,
  PlanResult,
  QuoteFormData
} from '../types';

export class CMSApiService {
  private apiKey: string;
  private baseUrl = 'https://marketplace.api.healthcare.gov/api/v1';
  
  constructor() {
    this.apiKey = process.env.CMS_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('CMS_API_KEY environment variable is required');
    }
  }

  // ============================================
  // FEDERAL POVERTY LEVEL CALCULATIONS
  // ============================================
  
  private getFederalPovertyLevel(householdSize: number, year: number = 2024): number {
    // 2024 Federal Poverty Guidelines (48 contiguous states)
    const baseFPL = 15060; // For household of 1
    const additionalPerPerson = 5380;
    
    return baseFPL + (additionalPerPerson * (householdSize - 1));
  }

  private calculateIncomeAsPercentOfFPL(income: number, householdSize: number): number {
    const fpl = this.getFederalPovertyLevel(householdSize);
    return (income / fpl) * 100;
  }

  // ============================================
  // AGE CALCULATION
  // ============================================
  
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // ============================================
  // ELIGIBILITY CHECKS
  // ============================================
  
  private checkMedicaidEligibility(income: number, householdSize: number): boolean {
    const fplPercent = this.calculateIncomeAsPercentOfFPL(income, householdSize);
    // Alabama Medicaid expansion threshold is 138% FPL
    return fplPercent <= 138;
  }

  private checkMarketplaceEligibility(formData: QuoteFormData): { eligible: boolean; reason?: string } {
    const age = this.calculateAge(formData.dateOfBirth);
    const fplPercent = this.calculateIncomeAsPercentOfFPL(formData.annualIncome, formData.householdSize);

    // Check citizenship
    if (!formData.isCitizen) {
      return { eligible: false, reason: 'Must be a U.S. citizen or national' };
    }

    // Check Medicaid eligibility
    if (this.checkMedicaidEligibility(formData.annualIncome, formData.householdSize)) {
      return { eligible: false, reason: 'May be eligible for Medicaid instead' };
    }

    // Check income limits (400% FPL for premium tax credits)
    if (fplPercent > 400) {
      return { eligible: true, reason: 'Eligible but may not qualify for premium tax credits' };
    }

    return { eligible: true };
  }

  // ============================================
  // CMS API CALLS
  // ============================================

  private async makeApiCall<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'MyCareCareAgency/1.0'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`CMS API Call: ${url}`, data ? { payload: data } : '');

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CMS API Error: ${response.status} - ${errorText}`);
        throw new Error(`CMS API Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`CMS API Success: ${url}`, { resultCount: Array.isArray(result) ? result.length : 'object' });
      
      return result;
    } catch (error) {
      console.error('CMS API Call Failed:', error);
      throw error;
    }
  }

  // ============================================
  // GET AVAILABLE PLANS
  // ============================================

  async getPlans(fips: string, zipCode: string, state: string = 'AL'): Promise<CMSPlan[]> {
    const searchRequest: CMSPlanSearchRequest = {
      place: {
        countyfips: fips,
        state: state,
        zipcode: zipCode
      },
      year: 2024,
      market: 'Individual'
    };

    try {
      const plans = await this.makeApiCall<CMSPlan[]>('/plans', searchRequest);
      
      // Filter out plans that don't have required data
      return plans.filter(plan => 
        plan.id && 
        plan.name && 
        plan.issuer?.name && 
        plan.premium > 0 &&
        plan.metal_level
      );
    } catch (error) {
      console.error('Failed to fetch plans from CMS API:', error);
      throw new Error('Unable to fetch insurance plans. Please try again later.');
    }
  }

  // ============================================
  // CALCULATE SUBSIDIES
  // ============================================

  async calculateSubsidies(formData: QuoteFormData, fips: string): Promise<CMSSubsidyResponse> {
    const age = this.calculateAge(formData.dateOfBirth);
    
    const subsidyRequest: CMSSubsidyRequest = {
      household: {
        income: formData.annualIncome,
        people: [{
          age: age,
          aptc_eligible: true,
          does_not_require_coverage: false,
          is_pregnant: formData.isPregnant || false,
          is_parent: formData.willClaimDependents,
          uses_tobacco: formData.tobaccoUse
        }]
      },
      place: {
        countyfips: fips,
        state: formData.state || 'AL',
        zipcode: formData.zipCode
      },
      year: 2024,
      market: 'Individual'
    };

    try {
      return await this.makeApiCall<CMSSubsidyResponse>('/households/eligibility/estimates', subsidyRequest);
    } catch (error) {
      console.error('Failed to calculate subsidies:', error);
      
      // Return fallback subsidy calculation
      const fplPercent = this.calculateIncomeAsPercentOfFPL(formData.annualIncome, formData.householdSize);
      
      return {
        aptc_amount: fplPercent <= 400 ? Math.max(0, 200 - (formData.annualIncome / 12 * 0.02)) : 0,
        csr_variant: fplPercent <= 250 ? 'silver_87' : 'standard',
        estimated_premium_after_aptc: 0, // Will be calculated per plan
        is_eligible_for_aptc: fplPercent <= 400,
        is_eligible_for_csr: fplPercent <= 250
      };
    }
  }

  // ============================================
  // MAIN QUOTE GENERATION
  // ============================================

  async generateQuote(formData: QuoteFormData, fips: string, county: string): Promise<PlanResult[]> {
    // Check eligibility first
    const eligibility = this.checkMarketplaceEligibility(formData);
    if (!eligibility.eligible && eligibility.reason?.includes('Medicaid')) {
      throw new Error(eligibility.reason);
    }

    try {
      // Get plans and subsidies in parallel
      const [plans, subsidyInfo] = await Promise.all([
        this.getPlans(fips, formData.zipCode, formData.state),
        this.calculateSubsidies(formData, fips)
      ]);

      if (!plans || plans.length === 0) {
        throw new Error('No insurance plans found for your area. Please verify your zip code.');
      }

      // Transform CMS plans to our PlanResult format
      const planResults: PlanResult[] = plans.map(plan => {
        const monthlyPremium = plan.premium;
        const monthlyPremiumAfterSubsidy = Math.max(0, monthlyPremium - subsidyInfo.aptc_amount);

        return {
          id: plan.id,
          name: plan.name,
          issuer: plan.issuer.name,
          metalLevel: plan.metal_level,
          planType: plan.plan_type,
          
          // Costs
          monthlyPremium,
          monthlyPremiumAfterSubsidy,
          annualDeductible: plan.deductible?.individual || 0,
          maxOutOfPocket: plan.out_of_pocket_maximum?.individual || 0,
          
          // Subsidies
          aptcAmount: subsidyInfo.aptc_amount,
          csrVariant: subsidyInfo.csr_variant,
          isEligibleForAptc: subsidyInfo.is_eligible_for_aptc,
          isEligibleForCsr: subsidyInfo.is_eligible_for_csr,
          
          // Additional Info
          networkTier: plan.network_tier,
          benefits: plan.benefits ? {
            medicalDeductible: plan.benefits.medical_deductible,
            drugDeductible: plan.benefits.drug_deductible,
            medicalMaxOutOfPocket: plan.benefits.medical_maximum_out_of_pocket,
            drugMaxOutOfPocket: plan.benefits.drug_maximum_out_of_pocket
          } : undefined
        };
      });

      // Sort by premium after subsidy (lowest first)
      return planResults.sort((a, b) => a.monthlyPremiumAfterSubsidy - b.monthlyPremiumAfterSubsidy);

    } catch (error) {
      console.error('Quote generation failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cmsApiService = new CMSApiService();
