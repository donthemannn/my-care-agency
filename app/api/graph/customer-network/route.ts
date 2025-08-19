import { NextRequest, NextResponse } from 'next/server'
import { getCustomerNetwork, findInfluentialCustomers } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const action = searchParams.get('action')

  try {
    if (action === 'influential') {
      const influentialCustomers = await findInfluentialCustomers()
      return NextResponse.json({ 
        success: true, 
        data: influentialCustomers,
        message: 'Top referral champions in your network'
      })
    }

    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'customerId required' 
      }, { status: 400 })
    }

    const network = await getCustomerNetwork(customerId, 3)
    
    return NextResponse.json({ 
      success: true, 
      data: {
        customerId,
        networkSize: network.length,
        connections: network
      },
      message: `Found ${network.length} connected customers in network`
    })

  } catch (error) {
    console.error('Customer network API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch customer network' 
    }, { status: 500 })
  }
}
