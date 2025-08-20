// ============================================
// QUOTE SERVICE
// ============================================
// Main service that orchestrates the quote generation process

import { QuoteFormData, QuoteResult, PlanResult, ApiResponse } from '../types';
import { geoService } from './geoService';
import { cmsApiService } from './cmsApiService';
import { supabase } from '../supabaseClient';

export class QuoteService {
  
  // ============================================
  // MAIN QUOTE GENERATION
  // ============================================

  async generateQuote(formData: QuoteFormData): Promise<ApiResponse<{
    plans: PlanResult[];
    county: string;
    fips: string;
    totalPlans: number;
  }>> {
    try {
      console.log('Starting quote generation for:', { zipCode: formData.zipCode, income: formData.annualIncome });

      // Step 1: Get county FIPS from zip code
      const geoResult = await geoService.zipToCountyFips(formData.zipCode);
      
      if (!geoResult) {
        return {
          success: false,
          error: 'Unable to determine county for the provided zip code. Please verify your zip code is correct.'
        };
      }

      const { fips, county } = geoResult;
      console.log(`Geographic lookup successful: ${formData.zipCode} → ${county} County (${fips})`);

      // Step 2: Generate plans using CMS API
      const plans = await cmsApiService.generateQuote(formData, fips, county);
      
      if (!plans || plans.length === 0) {
        return {
          success: false,
          error: 'No insurance plans found for your area. This may be due to limited plan availability or an issue with the insurance marketplace.'
        };
      }

      console.log(`Quote generation successful: ${plans.length} plans found`);

      // Step 3: Save quote to database (optional - for logged in users)
      try {
        await this.saveQuoteToDatabase(formData, plans, county, fips);
      } catch (dbError) {
        console.warn('Failed to save quote to database:', dbError);
        // Don't fail the entire request if database save fails
      }

      return {
        success: true,
        data: {
          plans,
          county,
          fips,
          totalPlans: plans.length
        },
        message: `Found ${plans.length} insurance plans for ${county} County, Alabama`
      };

    } catch (error) {
      console.error('Quote generation failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while generating your quote. Please try again.'
      };
    }
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  private async saveQuoteToDatabase(
    formData: QuoteFormData, 
    plans: PlanResult[], 
    county: string, 
    fips: string
  ): Promise<void> {
    try {
      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save each plan as a separate quote record
      const quoteRecords = plans.map(plan => ({
        profile_id: user?.id || null,
        zip_code: formData.zipCode,
        state: 'Alabama',
        annual_income: formData.annualIncome,
        household_size: formData.householdSize,
        ages: [this.calculateAge(formData.dateOfBirth)],
        premium: plan.monthlyPremium,
        subsidy_amount: plan.subsidyAmount || 0,
        net_premium: plan.monthlyPremium - (plan.subsidyAmount || 0),
        plan_id: plan.planId,
        plan_name: plan.planName,
        issuer_name: plan.issuerName,
        metal_level: plan.metalLevel,
        plan_type: plan.planType,
        deductible: plan.deductible,
        out_of_pocket_max: plan.outOfPocketMax,
        county_fips: fips,
      }));

      const { error } = await supabase
        .from('quotes')
        .insert(quoteRecords);

      if (error) {
        throw error;
      }

      console.log(`${quoteRecords.length} quotes saved to database successfully`);
    } catch (error) {
      console.error('Database save failed:', error);
      throw error;
    }
  }

  // ============================================
  // QUOTE HISTORY (FOR LOGGED IN USERS)
  // ============================================

  async getUserQuotes(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user quotes:', error);
      return [];
    }
  }

  async getQuoteById(quoteId: string): Promise<QuoteResult | null> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      return null;
    }
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  validateQuoteForm(formData: Partial<QuoteFormData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!formData.zipCode) {
      errors.push('Zip code is required');
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      errors.push('Zip code must be 5 digits');
    }

    if (!formData.dateOfBirth) {
      errors.push('Date of birth is required');
    } else {
      const age = this.calculateAge(formData.dateOfBirth);
      if (age < 18) {
        errors.push('You must be at least 18 years old to purchase individual insurance');
      }
      if (age > 120) {
        errors.push('Please enter a valid date of birth');
      }
    }

    if (!formData.gender) {
      errors.push('Gender is required');
    }

    if (!formData.annualIncome || formData.annualIncome <= 0) {
      errors.push('Annual income is required and must be greater than $0');
    } else if (formData.annualIncome > 10000000) {
      errors.push('Annual income seems unusually high. Please verify the amount.');
    }

    if (!formData.householdSize || formData.householdSize < 1) {
      errors.push('Household size must be at least 1');
    } else if (formData.householdSize > 20) {
      errors.push('Household size seems unusually large. Please verify the number.');
    }

    if (formData.isCitizen === undefined) {
      errors.push('Citizenship status is required');
    }

    if (formData.isTribalMember === undefined) {
      errors.push('Tribal membership status is required');
    }

    if (!formData.employmentStatus) {
      errors.push('Employment status is required');
    }

    if (formData.hasCurrentCoverage === undefined) {
      errors.push('Current coverage status is required');
    }

    if (formData.willClaimDependents === undefined) {
      errors.push('Dependent claiming status is required');
    }

    if (!formData.filingStatus) {
      errors.push('Tax filing status is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

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
  // UTILITY METHODS
  // ============================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  calculateAnnualPremium(monthlyPremium: number): number {
    return monthlyPremium * 12;
  }

  calculateSubsidyPercentage(originalPremium: number, subsidizedPremium: number): number {
    if (originalPremium <= 0) return 0;
    return Math.round(((originalPremium - subsidizedPremium) / originalPremium) * 100);
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
