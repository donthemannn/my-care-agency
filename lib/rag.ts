import OpenAI from 'openai'
import { WeaviateService } from './weaviate'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const weaviateService = new WeaviateService()

export interface RAGResponse {
  answer: string
  sources: Array<{
    title: string
    content: string
    category: string
    source: string
  }>
  confidence: number
}

export async function getInsuranceKnowledge(question: string): Promise<RAGResponse> {
  try {
    // Search for relevant knowledge in Weaviate
    const searchResults = await weaviateService.searchGuides(question, undefined, undefined, 6)
    
    if (!(searchResults as any)?.data?.Get?.InsuranceGuide) {
      return {
        answer: "I don't have specific information about that topic in my knowledge base. Could you please rephrase your question or ask about ACA marketplace plans, enrollment processes, or HealthSherpa platform features?",
        sources: [],
        confidence: 0
      }
    }

    const guides = (searchResults as any).data.Get.InsuranceGuide
    const context = guides.map(guide => 
      `TITLE: ${guide.title}\nCATEGORY: ${guide.category}\nSOURCE: ${guide.source}\nCONTENT: ${guide.content}`
    ).join('\n\n---\n\n')

    // Generate AI response with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert ACA insurance agent assistant with access to HealthSherpa training materials and insurance knowledge. 

Your role is to:
- Provide accurate, helpful information about ACA marketplace insurance
- Help agents understand enrollment processes, plan selection, and compliance
- Reference specific training materials when available
- Always be professional and compliant with insurance regulations

Guidelines:
- Use the provided context to answer questions accurately
- Cite sources when referencing specific training materials
- If you don't know something, say so rather than guessing
- Focus on practical, actionable advice for insurance agents
- Maintain compliance with ACA regulations and guidelines

Context from training materials:
${context}`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const answer = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again."

    // Extract sources for citation
    const sources = guides.map(guide => ({
      title: guide.title,
      content: guide.content.substring(0, 200) + '...',
      category: guide.category,
      source: guide.source
    }))

    return {
      answer,
      sources,
      confidence: Math.min(guides.length / 3, 1) // Simple confidence based on number of sources
    }

  } catch (error) {
    console.error('RAG error:', error)
    return {
      answer: "I'm experiencing technical difficulties accessing my knowledge base. Please try again in a moment.",
      sources: [],
      confidence: 0
    }
  }
}

export async function detectIntent(message: string): Promise<'quote' | 'info' | 'general'> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Classify the user's intent into one of these categories:
- "quote": User wants insurance quotes, plan comparisons, or pricing information
- "info": User wants information about ACA, enrollment, compliance, or training
- "general": General conversation or unclear intent

Respond with only the category name.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0,
      max_tokens: 10
    })

    const intent = completion.choices[0]?.message?.content?.toLowerCase().trim()
    
    if (intent === 'quote' || intent === 'info' || intent === 'general') {
      return intent
    }
    
    return 'general'
  } catch (error) {
    console.error('Intent detection error:', error)
    return 'general'
  }
}

// Global conversation state to track user information
let conversationState: {[key: string]: any} = {}

export async function generateQuoteResponse(message: string, conversationId: string = 'default'): Promise<string> {
  try {
    // Initialize conversation state if it doesn't exist
    if (!conversationState[conversationId]) {
      conversationState[conversationId] = {}
    }

    const state = conversationState[conversationId]

    // Extract quote parameters from the message using AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extract insurance quote parameters from the user's message. Return a JSON object with these fields:
- state: 2-letter state code (if mentioned) - ALL 50 US states are now supported via CMS API
- zipCode: zip code (if mentioned)
- householdSize: number of people (if mentioned)
- income: annual income (if mentioned)
- ages: array of ages (if mentioned)
- coverageType: "individual", "family", or "small_group" (if mentioned)

If information is missing, set the field to null. Only extract explicitly mentioned information.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0,
      max_tokens: 200
    })

    let extractedData: any = {}
    try {
      extractedData = JSON.parse(completion.choices[0]?.message?.content || '{}')
    } catch (e) {
      console.error('Failed to parse extracted data:', e)
    }

    // Update conversation state with new information
    if (extractedData.state) {
      state.state = extractedData.state.toUpperCase()
    }
    if (extractedData.zipCode) state.zipCode = extractedData.zipCode
    if (extractedData.householdSize) state.householdSize = extractedData.householdSize
    if (extractedData.income) state.income = extractedData.income
    if (extractedData.ages && extractedData.ages.length > 0) state.ages = extractedData.ages
    if (extractedData.coverageType) state.coverageType = extractedData.coverageType

    // If we have enough information, generate a quote
    if (state.state && state.householdSize && state.income && state.ages && state.ages.length > 0) {
      try {
        const zipCode = state.zipCode || (state.state === 'TX' ? '75201' : state.state === 'OH' ? '44101' : '35203')
        
        console.log(`Generating live CMS quote for ${state.state} ${zipCode}...`)
        
        const [plans, subsidyAmount] = await Promise.all([
          cmsApiService.searchPlans(state.state, zipCode),
          cmsApiService.calculateSubsidy(state.state, zipCode, state.income, state.householdSize, state.ages)
        ])

        if (!plans || plans.length === 0) {
          return `I couldn't find any plans for ${state.state} ${zipCode}. This might be an unsupported area or a temporary issue with the insurance marketplace data.\n\nPlease try a different zip code or contact me for assistance.`
        }

        const formattedPlans = plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          carrier: plan.issuer?.name || 'Unknown Carrier',
          metalTier: plan.metal_level?.toLowerCase() || 'unknown',
          premium: plan.premium || 0,
          deductible: plan.deductible?.individual || plan.deductible?.family || 0,
          outOfPocketMax: plan.out_of_pocket_maximum?.individual || plan.out_of_pocket_maximum?.family || 0,
          planType: plan.plan_type || 'Unknown',
          networkType: plan.network_tier || 'Standard'
        }))

        const quoteResult = {
          plans: formattedPlans,
          subsidyAmount,
          eligibleForSubsidy: subsidyAmount > 0,
          federalPovertyLevel: 15060 + (state.householdSize - 1) * 5380 // 2025 FPL estimate
        }
        
        const topPlans = quoteResult.plans.slice(0, 3)
        let response = `🎉 **Great! I found ${quoteResult.plans.length} plans available in ${state.state}.**\n\n`
        
        if (quoteResult.eligibleForSubsidy) {
          response += `✅ **You qualify for subsidies!**\n`
          response += `💰 **Estimated monthly tax credit: $${quoteResult.subsidyAmount}**\n`
          response += `📊 Your income is ${Math.round((state.income / quoteResult.federalPovertyLevel) * 100)}% of Federal Poverty Level\n\n`
        } else {
          response += `ℹ️ Based on your income, you don't qualify for premium tax credits.\n\n`
        }

        response += `**🏥 Top 3 Recommended Plans:**\n\n`
        
        topPlans.forEach((plan, index) => {
          const afterSubsidy = quoteResult.eligibleForSubsidy ? Math.max(0, plan.premium - quoteResult.subsidyAmount) : plan.premium
          response += `**${index + 1}. ${plan.name}**\n`
          response += `• **Carrier:** ${plan.carrier}\n`
          response += `• **Metal Tier:** ${plan.metalTier.charAt(0).toUpperCase() + plan.metalTier.slice(1)}\n`
          response += `• **Network:** ${plan.networkType}\n`
          response += `• **Monthly Premium:** $${plan.premium}${quoteResult.eligibleForSubsidy ? ` (After subsidy: $${afterSubsidy})` : ''}\n`
          response += `• **Deductible:** $${plan.deductible.toLocaleString()}\n`
          response += `• **Out-of-Pocket Max:** $${plan.outOfPocketMax.toLocaleString()}\n\n`
        })

        response += `📍 **Location:** ${state.state} ${zipCode}\n`
        response += `📊 **Data Source:** CMS Healthcare.gov Marketplace API (Live Data)\n\n`
        response += `Would you like more details about any of these plans, or would you like to see plans in a different metal tier?`
        
        // Clear the conversation state after successful quote
        conversationState[conversationId] = {}
        
        return response
        
      } catch (error) {
        console.error('Live CMS Quote generation error:', error)
        return `I encountered an issue getting live insurance data for ${state.state}. This might be:\n\n• An unsupported zip code area\n• Temporary CMS API issue\n• Network connectivity problem\n\nI can provide quotes for **all 50 US states** using the CMS Healthcare.gov Marketplace API. Please try again with a different zip code or let me know if you need assistance.`
      }
    }

    // If we don't have enough information, ask for what's missing
    const missing = []
    if (!state.state) missing.push('**State** (all 50 US states supported)')
    if (!state.householdSize) missing.push('**Household Size**')
    if (!state.income) missing.push('**Annual Income**')
    if (!state.ages || state.ages.length === 0) missing.push('**Ages**')

    let response = `I'd be happy to help you with insurance quotes using live CMS Healthcare.gov data! `
    
    if (missing.length > 0) {
      response += `I need a bit more information:\n\n`
      missing.forEach(item => {
        response += `• ${item}\n`
      })
      
      // Show what we already have
      const collected = []
      if (state.state) collected.push(`State: ${state.state}`)
      if (state.householdSize) collected.push(`Household Size: ${state.householdSize}`)
      if (state.income) collected.push(`Income: $${state.income.toLocaleString()}`)
      if (state.ages && state.ages.length > 0) collected.push(`Ages: ${state.ages.join(', ')}`)
      
      if (collected.length > 0) {
        response += `\n**Information I have so far:**\n`
        collected.forEach(item => response += `✅ ${item}\n`)
      }
      
      response += `\nFor example, you could say: "I need quotes for California, household of 2, ages 42 and 43, income $33,000"`
    } else {
      response += `Let me get you some quotes right away!`
    }

    return response

  } catch (error) {
    console.error('Quote response generation error:', error)
    return `I'd be happy to help you with insurance quotes! To provide accurate quotes, I'll need:

• **State** (Texas, Ohio, or Alabama only)
• **Household Size** (number of people)
• **Ages** of everyone needing coverage
• **Annual Income** (for subsidy calculations)

For example: "I need quotes for Ohio, household of 2, ages 42 and 43, income $33,000"`
  }
}
