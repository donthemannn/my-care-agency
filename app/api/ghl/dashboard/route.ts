import { NextResponse } from 'next/server';
import { getOpportunities, getContacts, getConversations, getReporting } from '@/lib/gohighlevel';

export async function GET() {
  try {
    const [opportunities, contacts, conversations, reporting] = await Promise.all([
      getOpportunities(),
      getContacts(undefined, 50),
      getConversations(),
      getReporting()
    ]);

    const dashboardData = {
      summary: {
        totalOpportunities: opportunities.opportunities?.length || 0,
        totalContacts: contacts.contacts?.length || 0,
        totalConversations: conversations.conversations?.length || 0,
        activeEnrollments: opportunities.opportunities?.filter((opp: any) => 
          opp.status === 'open' && opp.name?.toLowerCase().includes('enrollment')
        ).length || 0
      },
      recentOpportunities: opportunities.opportunities?.slice(0, 5) || [],
      recentContacts: contacts.contacts?.slice(0, 10) || [],
      recentConversations: conversations.conversations?.slice(0, 8) || [],
      reporting: reporting.data || []
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
