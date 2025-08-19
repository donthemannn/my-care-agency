const GHL_API_BASE = 'https://services.leadconnectorhq.com';

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };
}

export async function getOpportunities(locationId?: string) {
  try {
    const location = locationId || process.env.GHL_LOCATION_ID;
    const response = await fetch(`${GHL_API_BASE}/opportunities/search?location_id=${location}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel opportunities error:', error);
    return { opportunities: [] };
  }
}

export async function getContacts(locationId?: string, limit: number = 100) {
  try {
    const location = locationId || process.env.GHL_LOCATION_ID;
    const response = await fetch(`${GHL_API_BASE}/contacts/?locationId=${location}&limit=${limit}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel contacts error:', error);
    return { contacts: [] };
  }
}

export async function getConversations(locationId?: string) {
  try {
    const location = locationId || process.env.GHL_LOCATION_ID;
    const response = await fetch(`${GHL_API_BASE}/conversations/search?locationId=${location}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel conversations error:', error);
    return { conversations: [] };
  }
}

export async function sendMessage(conversationId: string, message: string, type: string = 'SMS') {
  try {
    const response = await fetch(`${GHL_API_BASE}/conversations/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        conversationId,
        message,
        type
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel send message error:', error);
    throw error;
  }
}

export async function getReporting(locationId?: string, startDate?: string, endDate?: string) {
  try {
    const location = locationId || process.env.GHL_LOCATION_ID;
    const params = new URLSearchParams({
      locationId: location,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    
    const response = await fetch(`${GHL_API_BASE}/reporting/attribution?${params}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel reporting error:', error);
    return { data: [] };
  }
}

export async function createContact(contactData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}) {
  try {
    const location = process.env.GHL_LOCATION_ID;
    const response = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...contactData,
        locationId: location,
        source: contactData.source || 'Friday AI Chat'
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel create contact error:', error);
    throw error;
  }
}

export async function createOpportunity(opportunityData: {
  contactId: string;
  name: string;
  monetaryValue?: number;
  pipelineId?: string;
  stageId?: string;
  status?: string;
  source?: string;
}) {
  try {
    const location = process.env.GHL_LOCATION_ID;
    const response = await fetch(`${GHL_API_BASE}/opportunities/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...opportunityData,
        locationId: location,
        source: opportunityData.source || 'Friday AI Chat'
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GoHighLevel create opportunity error:', error);
    throw error;
  }
}

export async function transcribeCall(callId: string) {
  try {
    const response = await fetch(`${GHL_API_BASE}/calls/${callId}/recording`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }
    
    const callData = await response.json();
    
    if (callData.recordingUrl) {
      const transcription = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: callData.recordingUrl })
      });
      
      return await transcription.json();
    }
    
    return { transcription: 'No recording available' };
  } catch (error) {
    console.error('GoHighLevel call transcription error:', error);
    return { transcription: 'Transcription failed' };
  }
}
