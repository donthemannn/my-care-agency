import { weaviateService } from './weaviate';
import { getCustomerSubgraph } from './neo4j';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface QueryClassification {
  contentType: string;
  intent: string;
  confidence: number;
}

interface SearchResult {
  content: string;
  heading?: string;
  contentType: string;
  metadata: any;
  startTime?: number;
  endTime?: number;
  documentId: string;
}

interface AgentResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  suggestedActions?: string[];
}

export class InsuranceAgenticRAG {
  private conversationMemory: Map<string, ChatMessage[]> = new Map();
  private maxMemoryLength = 10;

  async classifyQuery(query: string): Promise<{
    contentType: 'guide' | 'carrier' | 'training' | 'regulation' | 'general';
    intent: 'search' | 'compare' | 'explain' | 'calculate' | 'recommend';
    confidence: number;
  }> {
    const classificationPrompt = `
    Analyze this insurance-related query and classify it:
    
    Query: "${query}"
    
    Determine:
    1. Content Type: guide, carrier, training, regulation, or general
    2. Intent: search, compare, explain, calculate, or recommend
    3. Confidence: 0.0 to 1.0
    
    Content Type Guidelines:
    - guide: Questions about insurance processes, ACA rules, enrollment
    - carrier: Questions about specific insurance companies or plans
    - training: Questions about HealthSherpa platform, agent training
    - regulation: Questions about state laws, compliance, legal requirements
    - general: General insurance questions not fitting other categories
    
    Intent Guidelines:
    - search: Looking for specific information
    - compare: Comparing options (carriers, plans, etc.)
    - explain: Asking for explanations or how-to guidance
    - calculate: Needing calculations (premiums, deductibles, etc.)
    - recommend: Seeking recommendations or advice
    
    Respond in JSON format:
    {
      "contentType": "...",
      "intent": "...",
      "confidence": 0.0
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: classificationPrompt }],
        temperature: 0.1,
        max_tokens: 150,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        contentType: result.contentType || 'general',
        intent: result.intent || 'search',
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error('Query classification error:', error);
      return {
        contentType: 'general',
        intent: 'search',
        confidence: 0.3,
      };
    }
  }

  async retrieveRelevantChunks(
    query: string,
    contentType?: string,
    limit: number = 8
  ): Promise<SearchResult[]> {
    try {
      const hybridResults = await weaviateService.hybridSearchChunks(
        query,
        contentType,
        limit,
        0.7
      );

      const chunks = (hybridResults as any)?.data?.Get?.DocumentChunk || [];
      
      return chunks.map((chunk: any) => ({
        content: chunk.content,
        heading: chunk.heading,
        contentType: chunk.contentType,
        metadata: chunk.metadata,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        documentId: chunk.documentId,
      }));
    } catch (error) {
      console.error('Retrieval error:', error);
      return [];
    }
  }

  async generateResponse(
    query: string,
    sources: SearchResult[],
    classification: any,
    conversationId?: string,
    userSupabaseId?: string
  ): Promise<AgentResponse> {
    const conversationHistory = conversationId 
      ? this.conversationMemory.get(conversationId) || []
      : [];

    // Get customer relationship context if user ID provided
    let customerContext = '';
    if (userSupabaseId) {
      try {
        const subgraph = await getCustomerSubgraph(userSupabaseId);
        if (subgraph) {
          customerContext = `
          
Customer Context:
${subgraph.summary}
${subgraph.agent ? `Assigned Agent: ${subgraph.agent.name || subgraph.agent.email}` : ''}
${subgraph.policies.length > 0 ? `Active Policies: ${subgraph.policies.map(p => `${p.carrier} ${p.planType} ($${p.premium}/month)`).join(', ')}` : ''}
${subgraph.referredCustomers.length > 0 ? `Referred Customers: ${subgraph.referredCustomers.length}` : ''}
          `;
        }
      } catch (error) {
        console.error('Error fetching customer context:', error);
      }
    }

    const systemPrompt = `
    You are an expert insurance agent assistant with deep knowledge of:
    - ACA (Affordable Care Act) regulations and processes
    - Insurance carriers and plan comparisons
    - HealthSherpa platform training and features
    - State-specific insurance regulations
    - Customer enrollment and support processes

    Your role is to provide accurate, helpful, and actionable insurance guidance.

    Guidelines:
    1. Always cite your sources with specific references
    2. For training content, include video timestamps when available
    3. For carrier information, mention specific states and plan types
    4. For regulations, specify which states they apply to
    5. Be conversational but professional
    6. If you're unsure, say so and suggest next steps
    7. Provide actionable recommendations when appropriate

    Current query classification:
    - Content Type: ${classification.contentType}
    - Intent: ${classification.intent}
    - Confidence: ${classification.confidence}
    ${customerContext}
    `;

    const contextPrompt = sources.length > 0 
      ? `
    Based on the following relevant information:

    ${sources.map((source, index) => `
    Source ${index + 1} (${source.contentType}):
    ${source.heading ? `Heading: ${source.heading}` : ''}
    ${source.startTime ? `Video Time: ${Math.floor(source.startTime / 60)}:${String(Math.floor(source.startTime % 60)).padStart(2, '0')} - ${Math.floor(source.endTime! / 60)}:${String(Math.floor(source.endTime! % 60)).padStart(2, '0')}` : ''}
    Content: ${source.content}
    ${source.metadata ? `Additional Info: ${JSON.stringify(source.metadata)}` : ''}
    `).join('\n---\n')}

    Question: ${query}

    Please provide a comprehensive answer that:
    1. Directly addresses the question
    2. References specific sources (use "Source X" format)
    3. Includes actionable next steps if appropriate
    4. Mentions any limitations or caveats
    `
      : `
    Question: ${query}
    
    I don't have specific information about this topic in my knowledge base. Please provide a helpful response acknowledging this limitation and suggest alternative resources or next steps.
    `;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: contextPrompt },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      });

      const answer = response.choices[0].message.content || 'I apologize, but I was unable to generate a response.';

      // Update conversation memory
      if (conversationId) {
        const updatedHistory: ChatMessage[] = [
          ...conversationHistory,
          { role: 'user' as const, content: query },
          { role: 'assistant' as const, content: answer },
        ].slice(-this.maxMemoryLength);
        
        this.conversationMemory.set(conversationId, updatedHistory);
      }

      // Handle plan recommendations if entities are detected
      if (classification.intent === 'recommend' && this.hasRecommendationEntities(query)) {
        const planRecommendations = await this.generatePlanRecommendations(query, classification);
        if (planRecommendations) {
          return {
            answer: planRecommendations.answer,
            sources: [...sources, ...planRecommendations.sources],
            confidence: Math.max(this.calculateConfidence(sources, classification), 0.8),
            suggestedActions: planRecommendations.suggestedActions,
          };
        }
      }

      // Generate suggested actions based on intent
      const suggestedActions = this.generateSuggestedActions(classification, sources);

      return {
        answer,
        sources,
        confidence: this.calculateConfidence(sources, classification),
        suggestedActions,
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return {
        answer: 'I apologize, but I encountered an error while processing your request. Please try again or contact support.',
        sources: [],
        confidence: 0,
      };
    }
  }

  private hasRecommendationEntities(query: string): boolean {
    const agePattern = /\b(\d{1,2})\s*(?:years?\s*old|yo)\b/i;
    const dobPattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/;
    const statePattern = /\b[A-Z]{2}\b/;
    
    return agePattern.test(query) || dobPattern.test(query) || statePattern.test(query);
  }

  private async generatePlanRecommendations(query: string, classification: QueryClassification): Promise<any> {
    try {
      // Extract entities from query
      const entities = this.extractRecommendationEntities(query);
      
      if (!entities.dob && !entities.age) return null;
      
      const response = await fetch('/api/recommendations/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: entities.firstName || 'Client',
          lastName: entities.lastName || 'Unknown',
          dob: entities.dob || this.calculateDobFromAge(entities.age),
          state: entities.state || 'CA',
          planType: entities.planType || 'ACA',
          estimatedIncome: entities.income
        })
      });
      
      if (!response.ok) return null;
      
      const recommendations = await response.json();
      
      return {
        answer: this.formatRecommendationAnswer(recommendations),
        sources: [{
          content: `Plan recommendations generated for ${recommendations.clientInfo.name}`,
          contentType: 'plan-recommendation',
          metadata: recommendations
        }],
        suggestedActions: [
          'Review detailed plan comparisons',
          'Schedule enrollment consultation',
          'Check subsidy eligibility',
          'Compare provider networks'
        ]
      };
    } catch (error) {
      console.error('Plan recommendation error:', error);
      return null;
    }
  }

  private extractRecommendationEntities(query: string): any {
    const entities: any = {};
    
    // Extract age
    const ageMatch = query.match(/\b(\d{1,2})\s*(?:years?\s*old|yo)\b/i);
    if (ageMatch) entities.age = parseInt(ageMatch[1]);
    
    // Extract DOB
    const dobMatch = query.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b|\b(\d{4}-\d{2}-\d{2})\b/);
    if (dobMatch) entities.dob = dobMatch[1] || dobMatch[2];
    
    // Extract state
    const stateMatch = query.match(/\b([A-Z]{2})\b/);
    if (stateMatch) entities.state = stateMatch[1];
    
    // Extract income
    const incomeMatch = query.match(/\$?([\d,]+)\s*(?:income|salary|earn)/i);
    if (incomeMatch) entities.income = parseInt(incomeMatch[1].replace(/,/g, ''));
    
    return entities;
  }

  private calculateDobFromAge(age: number): string {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return `${birthYear}-01-01`;
  }

  private formatRecommendationAnswer(recommendations: any): string {
    const { clientInfo, recommendations: plans } = recommendations;
    
    let answer = `Based on the information provided, here are the top health plan recommendations for ${clientInfo.name} (age ${clientInfo.age}) in ${clientInfo.state}:\n\n`;
    
    plans.slice(0, 3).forEach((plan: any, index: number) => {
      answer += `**${index + 1}. ${plan.planName}** (${plan.carrier.name})\n`;
      answer += `- Monthly Premium: $${plan.premium}`;
      if (plan.estimatedSubsidy > 0) {
        answer += ` (after $${plan.estimatedSubsidy} subsidy)`;
      }
      answer += `\n- Deductible: $${plan.deductible.toLocaleString()}\n`;
      answer += `- Out-of-Pocket Max: $${plan.oopMax.toLocaleString()}\n`;
      answer += `- Rating: ${plan.rating}/5.0\n`;
      answer += `- Why recommended: ${plan.recommendationReason}\n\n`;
    });
    
    if (clientInfo.eligibleForSubsidies) {
      answer += `💡 **Good news!** Based on the estimated income, this client may be eligible for premium subsidies that could significantly reduce monthly costs.\n\n`;
    }
    
    answer += `These recommendations are based on age, location, and plan features. For the most accurate quotes and enrollment, please use the Plan Finder tool or contact the carriers directly.`;
    
    return answer;
  }

  private generateSuggestedActions(classification: any, sources: SearchResult[]): string[] {
    const actions: string[] = [];

    switch (classification.intent) {
      case 'compare':
        actions.push('View detailed plan comparison');
        actions.push('Get premium quotes');
        break;
      case 'calculate':
        actions.push('Use premium calculator');
        actions.push('Check subsidy eligibility');
        break;
      case 'recommend':
        actions.push('Schedule consultation');
        actions.push('Review personalized recommendations');
        break;
      case 'explain':
        if (sources.some(s => s.contentType === 'training')) {
          actions.push('Watch related training video');
        }
        actions.push('View step-by-step guide');
        break;
    }

    // Content-type specific actions
    if (classification.contentType === 'carrier') {
      actions.push('View carrier details');
      actions.push('Check network providers');
    } else if (classification.contentType === 'regulation') {
      actions.push('View state-specific requirements');
      actions.push('Check compliance checklist');
    }

    return actions;
  }

  private calculateConfidence(sources: SearchResult[], classification: any): number {
    if (sources.length === 0) return 0.1;
    
    let confidence = classification.confidence;
    
    // Boost confidence based on source quality
    const hasRelevantSources = sources.some(s => 
      s.contentType === classification.contentType
    );
    
    if (hasRelevantSources) confidence += 0.2;
    if (sources.length >= 3) confidence += 0.1;
    if (sources.some(s => s.heading)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  async chat(
    query: string,
    conversationId: string = 'default',
    userSupabaseId?: string
  ): Promise<AgentResponse> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return {
          answer: "Hi! I'm Friday, your AI assistant for ACA marketplace insurance. I can help you with plan enrollment, subsidy calculations, and client questions. However, my AI capabilities are currently being configured. Please check back soon!",
          sources: [],
          confidence: 0
        };
      }

      // Get conversation history
      const history = this.getConversationHistory(conversationId);
      
      // Generate simple response for now
      const response = await this.generateSimpleResponse(query, history);
      
      // Update conversation memory
      this.updateConversationMemory(conversationId, [
        { role: 'user', content: query },
        { role: 'assistant', content: response.answer }
      ]);
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return {
        answer: "Hi! I'm Friday, your AI assistant for ACA marketplace insurance. I can help you with plan enrollment, subsidy calculations, and client questions. However, I'm experiencing a temporary issue. Please try again!",
        sources: [],
        confidence: 0
      };
    }
  }

  private async generateSimpleResponse(query: string, history: ChatMessage[]): Promise<AgentResponse> {
    try {
      const systemPrompt = `You are Friday, an expert ACA marketplace insurance agent assistant. You help insurance agents with:

- ACA plan enrollment and eligibility
- Subsidy calculations and income verification  
- Plan comparisons and recommendations
- Compliance with ACA regulations
- Client questions about health insurance

Provide helpful, accurate information about ACA marketplace insurance. Be professional and knowledgeable.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: query }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

      return {
        answer,
        sources: [],
        confidence: 0.8
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private updateConversationMemory(conversationId: string, messages: ChatMessage[]) {
    const history = this.getConversationHistory(conversationId);
    const updatedHistory = [...history, ...messages];
    
    // Keep only the last maxMemoryLength messages
    if (updatedHistory.length > this.maxMemoryLength) {
      updatedHistory.splice(0, updatedHistory.length - this.maxMemoryLength);
    }
    
    this.conversationMemory.set(conversationId, updatedHistory);
  }

  clearConversation(conversationId: string) {
    this.conversationMemory.delete(conversationId);
  }

  getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversationMemory.get(conversationId) || [];
  }
}

export const insuranceRAG = new InsuranceAgenticRAG();
