import { createClient } from '@supabase/supabase-js';

// Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Weaviate client (disabled for initial deployment)
export const weaviateClient = null;

// Database interfaces
export interface InsurancePlan {
  plan_id: string;
  state: string;
  carrier_name: string;
  plan_name: string;
  metal_tier: string;
  premium: number;
  deductible: number;
  out_of_pocket_max: number;
  network_type: string;
  plan_type: string;
  benefits: any;
  created_at: string;
}

export interface QuoteRequest {
  id?: string;
  user_session: string;
  state: string;
  household_size: number;
  annual_income: number;
  ages: number[];
  zip_code?: string;
  metal_tier_preference?: string;
  requested_at: string;
  quote_results?: any;
}

// Database operations
export class DatabaseService {
  
  // Get plans by state and filters
  static async getPlans(filters: {
    state: string;
    metalTier?: string;
    maxPremium?: number;
    carrier?: string;
    limit?: number;
  }): Promise<InsurancePlan[]> {
    let query = supabase
      .from('insurance_plans')
      .select('*')
      .eq('state', filters.state.toUpperCase());

    if (filters.metalTier) {
      query = query.eq('metal_tier', filters.metalTier);
    }

    if (filters.maxPremium) {
      query = query.lte('premium', filters.maxPremium);
    }

    if (filters.carrier) {
      query = query.ilike('carrier_name', `%${filters.carrier}%`);
    }

    query = query
      .order('premium', { ascending: true })
      .limit(filters.limit || 10);

    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  }

  // Save quote request
  static async saveQuoteRequest(request: QuoteRequest): Promise<string | null> {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([request])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving quote request:', error);
      return null;
    }

    return data?.id || null;
  }

  // Search knowledge base
  static async searchKnowledge(query: string, limit: number = 5): Promise<any[]> {
    if (!weaviateClient) return [];
    
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName('InsuranceKnowledge')
        .withFields('title content category source')
        .withNearText({ concepts: [query] })
        .withLimit(limit)
        .do();

      return result.data?.Get?.InsuranceKnowledge || [];
    } catch (error) {
      console.error('Weaviate search error:', error);
      return [];
    }
  }

  // Get plan recommendations using vector search
  static async getRecommendedPlans(
    query: string, 
    state: string, 
    limit: number = 3
  ): Promise<any[]> {
    if (!weaviateClient) return [];
    
    try {
      const result = await weaviateClient.graphql
        .get()
        .withClassName('InsurancePlan')
        .withFields('planName carrier state metalTier premium benefits')
        .withNearText({ concepts: [query] })
        .withWhere({
          path: ['state'],
          operator: 'Equal',
          valueText: state.toUpperCase()
        })
        .withLimit(limit)
        .do();

      return result.data?.Get?.InsurancePlan || [];
    } catch (error) {
      console.error('Plan recommendation error:', error);
      return [];
    }
  }

  // Get analytics data
  static async getQuoteAnalytics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .gte('requested_at', startDate.toISOString());

    if (error) {
      console.error('Analytics error:', error);
      return null;
    }

    // Process analytics
    const analytics = {
      totalQuotes: data.length,
      stateBreakdown: {},
      averageIncome: 0,
      popularMetalTiers: {},
      conversionRate: 0
    };

    let totalIncome = 0;
    data.forEach(quote => {
      // State breakdown
      analytics.stateBreakdown[quote.state] = 
        (analytics.stateBreakdown[quote.state] || 0) + 1;
      
      // Average income
      totalIncome += quote.annual_income;
      
      // Metal tier preferences
      if (quote.metal_tier_preference) {
        analytics.popularMetalTiers[quote.metal_tier_preference] = 
          (analytics.popularMetalTiers[quote.metal_tier_preference] || 0) + 1;
      }
    });

    analytics.averageIncome = data.length > 0 ? totalIncome / data.length : 0;

    return analytics;
  }

  // Health check
  static async healthCheck(): Promise<{
    supabase: boolean;
    weaviate: boolean;
    planCount: number;
    knowledgeCount: number;
  }> {
    const health = {
      supabase: false,
      weaviate: false,
      planCount: 0,
      knowledgeCount: 0
    };

    // Test Supabase
    try {
      const { count } = await supabase
        .from('insurance_plans')
        .select('*', { count: 'exact', head: true });
      
      health.supabase = true;
      health.planCount = count || 0;
    } catch (error) {
      console.error('Supabase health check failed:', error);
    }

    // Test Weaviate
    if (weaviateClient) {
      try {
        const result = await weaviateClient.graphql
          .aggregate()
          .withClassName('InsuranceKnowledge')
          .withFields('meta { count }')
          .do();
        
        health.weaviate = true;
        health.knowledgeCount = result.data?.Aggregate?.InsuranceKnowledge?.[0]?.meta?.count || 0;
      } catch (error) {
        console.error('Weaviate health check failed:', error);
      }
    }

    return health;
  }
}
