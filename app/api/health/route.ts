import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const health = await DatabaseService.healthCheck();
    
    const status = health.supabase && health.weaviate ? 200 : 503;
    
    return NextResponse.json({
      status: status === 200 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        supabase: {
          status: health.supabase ? 'up' : 'down',
          planCount: health.planCount
        },
        weaviate: {
          status: health.weaviate ? 'up' : 'down',
          knowledgeCount: health.knowledgeCount
        }
      },
      version: '1.0.0'
    }, { status });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 });
  }
}
