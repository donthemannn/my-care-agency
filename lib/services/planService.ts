import { cmsApiService, CMSPlan } from '@/lib/cmsApiService';
import { calculateAPTC, calculateFPLPercentage, getCSRLevel, isEligibleForExtraSavings } from '@/lib/utils/subsidy';

export interface EnhancedPlan {
  id: string;
  name: string;
  issuer: {
    name: string;
    logo?: string;
  };
  premium: number;
  netPremium: number;
  metalLevel: string;
  planType: string;
  deductible?: {
    individual?: number;
    family?: number;
  };
  outOfPocketMax?: {
    individual?: number;
    family?: number;
  };
  networkTier?: string;
  benefits: PlanBenefit[];
  hasExtraSavings: boolean;
  csrLevel?: string;
  isBenchmark?: boolean;
}

export interface PlanBenefit {
  category: string;
  covered: boolean;
  details?: string;
  copay?: string;
  coinsurance?: string;
}

export interface QuoteRequest {
  zipCode: string;
  state: string;
  annualIncome: number;
  householdSize: number;
  ages: number[];
}

export interface QuoteResponse {
  plans: EnhancedPlan[];
  subsidyAmount: number;
  fplPercentage: number;
  eligibleForSubsidy: boolean;
  benchmarkPremium: number;
  metalTierCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  location: {
    state: string;
    zipCode: string;
  };
  household: {
    income: number;
    size: number;
    ages: number[];
  };
}

const DEFAULT_BENEFITS: PlanBenefit[] = [
  { category: 'Primary care', covered: true, copay: '$5 per visit from day 1' },
  { category: 'Specialist care', covered: true, copay: '$30 per visit from day 1' },
  { category: 'Urgent care', covered: true, copay: '$30 per visit from day 1' },
  { category: 'Emergency room', covered: true, coinsurance: '20% after deductible' },
  { category: 'Generic drugs', covered: true, copay: '$5' },
  { category: 'Preferred brand drugs', covered: true, copay: '$30' },
  { category: 'Non-preferred brand drugs', covered: true, copay: '$60' },
  { category: 'Specialty drugs', covered: true, coinsurance: '20% after deductible' },
  { category: 'Outpatient mental health', covered: true, copay: '$30 per visit from day 1' },
  { category: 'Inpatient mental health', covered: true, coinsurance: '20% after deductible' },
  { category: 'Substance abuse treatment', covered: true, coinsurance: '20% after deductible' },
  { category: 'Maternity care', covered: true, coinsurance: '20% after deductible' },
  { category: 'Preventive care', covered: true, copay: 'No charge' },
  { category: 'Lab tests', covered: true, coinsurance: '20% after deductible' },
  { category: 'X-rays and imaging', covered: true, coinsurance: '20% after deductible' },
  { category: 'Physical therapy', covered: true, copay: '$30 per visit from day 1' },
  { category: 'Durable medical equipment', covered: true, coinsurance: '20% after deductible' },
  { category: 'Home health care', covered: true, coinsurance: '20% after deductible' },
  { category: 'Hospice care', covered: true, coinsurance: '20% after deductible' },
  { category: 'Adult dental', covered: false },
  { category: 'Adult vision', covered: false }
];

const ISSUER_LOGOS: Record<string, string> = {
  'Ambetter': '/logos/ambetter.png',
  'Blue Cross Blue Shield': '/logos/bcbs.png',
  'UnitedHealthcare': '/logos/united.png',
  'Aetna': '/logos/aetna.png',
  'Cigna': '/logos/cigna.png',
  'Humana': '/logos/humana.png',
  'Kaiser Permanente': '/logos/kaiser.png',
  'Molina Healthcare': '/logos/molina.png'
};

class PlanService {
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const { zipCode, state, annualIncome, householdSize, ages } = request;

    try {
      // Get all plans from CMS API (not just 5)
      const cmsPlans = await cmsApiService.searchPlans(state, zipCode);
      
      if (!cmsPlans || cmsPlans.length === 0) {
        throw new Error('No plans found for this location');
      }

      console.log(`Found ${cmsPlans.length} plans from CMS API`);

      // Calculate FPL percentage
      const fplPercentage = calculateFPLPercentage(annualIncome, householdSize);
      
      // Find benchmark plan (second lowest cost silver)
      const silverPlans = cmsPlans
        .filter(plan => plan.metal_level.toLowerCase() === 'silver')
        .sort((a, b) => a.premium - b.premium);
      
      const benchmarkPremium = silverPlans[1]?.premium || silverPlans[0]?.premium || 0;
      
      // Calculate APTC
      const subsidyAmount = calculateAPTC(annualIncome, householdSize, benchmarkPremium);
      
      // Get CSR level
      const csrLevel = getCSRLevel(fplPercentage);

      // Transform all plans to enhanced format
      const enhancedPlans: EnhancedPlan[] = cmsPlans.map(plan => {
        const netPremium = Math.max(0, plan.premium - subsidyAmount);
        const hasExtraSavings = isEligibleForExtraSavings(plan.metal_level, fplPercentage);
        
        return {
          id: plan.id,
          name: plan.name,
          issuer: {
            name: plan.issuer.name,
            logo: ISSUER_LOGOS[plan.issuer.name] || '/logos/default.png'
          },
          premium: plan.premium,
          netPremium,
          metalLevel: plan.metal_level,
          planType: plan.plan_type,
          deductible: plan.deductible,
          outOfPocketMax: plan.out_of_pocket_maximum,
          networkTier: plan.network_tier,
          benefits: this.generateBenefits(plan),
          hasExtraSavings,
          csrLevel: hasExtraSavings ? csrLevel : undefined,
          isBenchmark: plan.id === silverPlans[1]?.id
        };
      });

      // Count plans by metal tier
      const metalTierCounts = {
        bronze: enhancedPlans.filter(p => p.metalLevel.toLowerCase() === 'bronze').length,
        silver: enhancedPlans.filter(p => p.metalLevel.toLowerCase() === 'silver').length,
        gold: enhancedPlans.filter(p => p.metalLevel.toLowerCase() === 'gold').length,
        platinum: enhancedPlans.filter(p => p.metalLevel.toLowerCase() === 'platinum').length
      };

      return {
        plans: enhancedPlans,
        subsidyAmount,
        fplPercentage,
        eligibleForSubsidy: subsidyAmount > 0,
        benchmarkPremium,
        metalTierCounts,
        location: { state, zipCode },
        household: { income: annualIncome, size: householdSize, ages }
      };

    } catch (error) {
      console.error('Plan Service Error:', error);
      throw error;
    }
  }

  private generateBenefits(plan: CMSPlan): PlanBenefit[] {
    // In a real implementation, this would parse actual plan benefits from CMS data
    // For now, we'll use default benefits with some variation based on metal level
    const benefits = [...DEFAULT_BENEFITS];
    
    // Adjust copays based on metal level
    const metalLevel = plan.metal_level.toLowerCase();
    const copayMultiplier = metalLevel === 'bronze' ? 1.5 : 
                           metalLevel === 'silver' ? 1.0 : 
                           metalLevel === 'gold' ? 0.8 : 0.6;

    return benefits.map(benefit => ({
      ...benefit,
      copay: benefit.copay ? this.adjustCopay(benefit.copay, copayMultiplier) : benefit.copay
    }));
  }

  private adjustCopay(copay: string, multiplier: number): string {
    // Simple copay adjustment - in reality this would be more sophisticated
    const match = copay.match(/\$(\d+)/);
    if (match) {
      const amount = parseInt(match[1]);
      const adjustedAmount = Math.round(amount * multiplier);
      return copay.replace(/\$\d+/, `$${adjustedAmount}`);
    }
    return copay;
  }
}

export const planService = new PlanService();
