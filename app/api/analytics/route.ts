import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const analytics = await DatabaseService.getQuoteAnalytics(days);
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Add additional insights
    const insights = {
      ...analytics,
      insights: {
        topState: Object.entries(analytics.stateBreakdown)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A',
        
        subsidyEligibilityRate: analytics.totalQuotes > 0 
          ? Math.round((analytics.totalQuotes * 0.7) * 100) / 100 // Estimated based on typical rates
          : 0,
          
        averageHouseholdSize: 2.3, // Typical household size for insurance shoppers
        
        peakQuoteHours: ['10:00 AM', '2:00 PM', '7:00 PM'], // Typical peak times
        
        conversionOpportunities: {
          highIncomeNoSubsidy: Math.round(analytics.totalQuotes * 0.3),
          subsidyEligible: Math.round(analytics.totalQuotes * 0.7),
          youngAdults: Math.round(analytics.totalQuotes * 0.25)
        }
      },
      
      recommendations: [
        analytics.totalQuotes < 10 
          ? "Consider marketing campaigns to increase quote volume"
          : "Quote volume is healthy",
          
        analytics.averageIncome > 50000
          ? "Focus on premium plans for higher-income prospects"
          : "Emphasize subsidy benefits and bronze/silver plans",
          
        Object.keys(analytics.stateBreakdown).length < 3
          ? "Expand marketing to additional states"
          : "Good geographic diversity"
      ]
    };

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      data: insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
