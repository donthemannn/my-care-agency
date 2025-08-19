import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { INSURANCE_SYSTEM_PROMPT } from '@/lib/constants'
import { getInsuranceKnowledge, detectIntent, generateQuoteResponse } from '@/lib/rag'
import { OPENAI_ENABLED } from '@/lib/featureFlags'

const openai = OPENAI_ENABLED ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
}) : null

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if OpenAI is available
    if (!OPENAI_ENABLED || !openai) {
      // Fallback to simple responses
      const responses = {
        'hello': 'Hello! I\'m here to help you with insurance questions. What would you like to know?',
        'aca': 'The Affordable Care Act (ACA) provides health insurance marketplaces where you can compare and purchase health insurance plans. Plans are categorized into Bronze, Silver, Gold, and Platinum tiers based on coverage levels.',
        'plan': 'I can help you understand different insurance plan types. Are you looking for information about health insurance, life insurance, or another type of coverage?',
        'training': 'Our training system includes comprehensive modules on ACA regulations, plan comparisons, enrollment processes, and customer service best practices.',
        'quote': 'To provide an accurate insurance quote, I\'d need information about your specific needs, location, and coverage requirements. Would you like to start with some basic questions?',
        'default': 'I\'m your AI insurance assistant. I can help with ACA marketplace questions, plan comparisons, training materials, and general insurance guidance. What specific topic would you like to explore?'
      }

      const lowerMessage = message.toLowerCase()
      let response = responses.default

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = responses.hello
      } else if (lowerMessage.includes('aca') || lowerMessage.includes('affordable care')) {
        response = responses.aca
      } else if (lowerMessage.includes('plan') || lowerMessage.includes('coverage')) {
        response = responses.plan
      } else if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
        response = responses.training
      } else if (lowerMessage.includes('quote') || lowerMessage.includes('price')) {
        response = responses.quote
      }

      return NextResponse.json({ message: response })
    }

    // Detect user intent
    const intent = await detectIntent(message)
    
    let response: string
    let sources: any[] = []

    if (intent === 'quote') {
      // Handle quote requests
      response = await generateQuoteResponse(message)
    } else if (intent === 'info') {
      // Handle information requests with RAG
      const ragResponse = await getInsuranceKnowledge(message)
      response = ragResponse.answer
      sources = ragResponse.sources
    } else {
      // Handle general conversation
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: INSURANCE_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."
    }

    return NextResponse.json({ 
      message: response,
      sources: sources.length > 0 ? sources : undefined
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: "I'm having trouble connecting right now. Please try again later." },
      { status: 200 }
    )
  }
}
