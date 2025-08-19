import { NextResponse } from 'next/server';
import { getContacts } from '@/lib/gohighlevel';

export async function GET() {
  try {
    const result = await getContacts(undefined, 5);
    
    return NextResponse.json({
      success: true,
      message: 'GHL connection successful!',
      contactCount: result.contacts?.length || 0,
      sampleContact: result.contacts?.[0] || null
    });
  } catch (error) {
    console.error('GHL test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'GHL connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
