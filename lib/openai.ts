import OpenAI from 'openai';

export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY! 
});

export async function chatCompletion(messages: any[], stream: boolean = true) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      stream,
      max_tokens: 1000
    });
    
    return completion;
  } catch (error) {
    console.error('OpenAI chat completion error:', error);
    throw error;
  }
}

export async function createEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw error;
  }
}

export function buildInsurancePrompt(context: any[], userMessage: string, conversationHistory: any[] = []) {
  const systemPrompt = `You are Friday, the AI assistant for Sean Insurance Agency Pro. You help with:

1. ACA (Affordable Care Act) insurance enrollment and guidance
2. Client management and policy information
3. GoHighLevel CRM integration and workflow automation
4. Insurance compliance and regulatory questions
5. Business intelligence and reporting

You have access to:
- Client database and policy information
- Conversation history and context
- Real-time GoHighLevel data
- Insurance regulations and guidelines

Be helpful, professional, and accurate. Always prioritize client privacy and compliance.

Context from knowledge base:
${context.map(item => `- ${item.title}: ${item.content}`).join('\n')}

Recent conversation history:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];
}
