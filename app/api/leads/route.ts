import { NextRequest, NextResponse } from 'next/server';
import { createContact, createOpportunity } from '@/lib/gohighlevel';
import { notifyNewLead } from '@/lib/slack';

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();

    if (!leadData.email && !leadData.phone) {
      return NextResponse.json({ 
        error: 'Either email or phone is required' 
      }, { status: 400 });
    }

    // Create contact in GoHighLevel
    const contact = await createContact({
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      source: 'Friday AI Chat',
      tags: ['AI Generated Lead', 'Insurance Interest'],
      customFields: {
        'lead_source': 'Friday AI Assistant',
        'interest_type': leadData.interestType || 'ACA Insurance',
        'chat_context': leadData.chatContext || ''
      }
    });

    // Create opportunity if contact was created successfully
    let opportunity = null;
    if (contact.contact?.id) {
      try {
        opportunity = await createOpportunity({
          contactId: contact.contact.id,
          name: `${leadData.firstName || 'Lead'} - ACA Insurance Interest`,
          monetaryValue: leadData.estimatedValue || 1200, // Average ACA commission
          status: 'open',
          source: 'Friday AI Chat'
        });
      } catch (oppError) {
        console.error('Failed to create opportunity:', oppError);
        // Continue even if opportunity creation fails
      }
    }

    // Send Slack notification
    try {
      await notifyNewLead({
        name: `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim(),
        email: leadData.email,
        phone: leadData.phone,
        interestType: leadData.interestType
      });
    } catch (slackError) {
      console.error('Slack notification failed:', slackError);
    }

    return NextResponse.json({
      success: true,
      contact: contact.contact,
      opportunity: opportunity?.opportunity || null,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json({
      error: 'Failed to capture lead',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
