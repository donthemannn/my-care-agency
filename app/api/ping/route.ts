import { NextResponse } from 'next/server'
import { pingNeo4j } from '@/lib/neo4j'
import { pingWeaviate } from '@/lib/weaviate'

export async function GET() {
  try {
    const [neo4jStatus, weaviateStatus] = await Promise.all([
      pingNeo4j(),
      pingWeaviate()
    ])

    return NextResponse.json({
      neo4j: neo4jStatus,
      weaviate: weaviateStatus,
      supabase: true, // Already working
      openai: !!process.env.OPENAI_API_KEY,
      cloudflare: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    })
  } catch (error) {
    console.error('Ping error:', error)
    return NextResponse.json({
      neo4j: false,
      weaviate: false,
      supabase: true,
      openai: !!process.env.OPENAI_API_KEY,
      cloudflare: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    })
  }
}
