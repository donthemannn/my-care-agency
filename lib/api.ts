import axios from 'axios';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

export const ghlApi = axios.create({
  baseURL: GHL_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  }
});

export const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const openrouterApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dateAdded: string;
  lastActivity?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  type: 'inbound' | 'outbound' | 'manual';
  status: 'open' | 'closed';
  lastMessageDate: string;
  messageCount: number;
  assignedTo?: string;
}

export interface CallRecord {
  id: string;
  contactId: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  status: 'completed' | 'missed' | 'busy';
  recordingUrl?: string;
  transcription?: string;
  aiSummary?: string;
  dateCreated: string;
}

export async function getContacts(locationId: string): Promise<Contact[]> {
  try {
    const response = await ghlApi.get(`/contacts/?locationId=${locationId}`);
    return response.data.contacts || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function getConversations(locationId: string): Promise<Conversation[]> {
  try {
    const response = await ghlApi.get(`/conversations/?locationId=${locationId}`);
    return response.data.conversations || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await openaiApi.post('/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
}

export async function generateAISummary(transcription: string): Promise<string> {
  try {
    const response = await openrouterApi.post('/chat/completions', {
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for an insurance agency. Analyze call transcriptions and provide concise summaries focusing on: customer needs, policy interests, follow-up actions, and key details.'
        },
        {
          role: 'user',
          content: `Please analyze this call transcription and provide a summary:\n\n${transcription}`
        }
      ],
      max_tokens: 500
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Unable to generate summary';
  }
}
