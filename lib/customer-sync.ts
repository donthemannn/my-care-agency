import { createClient } from '@supabase/supabase-js'
import neo4j from 'neo4j-driver'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
)

export async function syncCustomersToGraph() {
  console.log('🔄 Syncing customers from Supabase to Neo4j...')
  
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
    
    if (error) throw error
    if (!customers?.length) {
      console.log('📝 No customers found in Supabase')
      return
    }

    const session = driver.session()
    
    for (const customer of customers) {
      await session.run(`
        MERGE (c:Customer {supabaseId: $id})
        SET c += $props
        SET c.lastSynced = datetime()
      `, {
        id: customer.id,
        props: {
          email: customer.email,
          name: customer.name || customer.full_name,
          phone: customer.phone,
          state: customer.state,
          zipCode: customer.zip_code,
          dateOfBirth: customer.date_of_birth,
          createdAt: customer.created_at
        }
      })
    }

    await session.close()
    console.log(`✅ Synced ${customers.length} customers to Neo4j`)
    
  } catch (error) {
    console.error('❌ Customer sync failed:', error)
    throw error
  }
}

export async function syncAgentRelationships() {
  console.log('🔄 Syncing agent-customer relationships...')
  
  try {
    const { data: relationships, error } = await supabase
      .from('customer_agents')
      .select(`
        customer_id,
        agent_id,
        assigned_at,
        customers!inner(name, email),
        agents!inner(name, email)
      `)
    
    if (error) throw error
    if (!relationships?.length) return

    const session = driver.session()
    
    for (const rel of relationships) {
      await session.run(`
        MATCH (c:Customer {supabaseId: $customerId})
        MATCH (a:Agent {supabaseId: $agentId})
        MERGE (c)-[r:ASSIGNED_TO]->(a)
        SET r.assignedAt = $assignedAt
        SET r.lastSynced = datetime()
      `, {
        customerId: rel.customer_id,
        agentId: rel.agent_id,
        assignedAt: rel.assigned_at
      })
    }

    await session.close()
    console.log(`✅ Synced ${relationships.length} agent relationships`)
    
  } catch (error) {
    console.error('❌ Agent relationship sync failed:', error)
    throw error
  }
}

export async function syncPolicyRelationships() {
  console.log('🔄 Syncing customer-policy relationships...')
  
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
    
    if (error) throw error
    if (!policies?.length) return

    const session = driver.session()
    
    for (const policy of policies) {
      await session.run(`
        MATCH (c:Customer {supabaseId: $customerId})
        MERGE (p:Policy {supabaseId: $policyId})
        SET p += $props
        MERGE (c)-[r:HAS_POLICY]->(p)
        SET r.effectiveDate = $effectiveDate
        SET r.lastSynced = datetime()
      `, {
        customerId: policy.customer_id,
        policyId: policy.id,
        effectiveDate: policy.effective_date,
        props: {
          policyNumber: policy.policy_number,
          carrier: policy.carrier,
          planType: policy.plan_type,
          premium: policy.monthly_premium,
          status: policy.status
        }
      })
    }

    await session.close()
    console.log(`✅ Synced ${policies.length} policy relationships`)
    
  } catch (error) {
    console.error('❌ Policy relationship sync failed:', error)
    throw error
  }
}

export async function syncReferralNetwork() {
  console.log('🔄 Syncing referral network...')
  
  try {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*')
    
    if (error) throw error
    if (!referrals?.length) return

    const session = driver.session()
    
    for (const referral of referrals) {
      await session.run(`
        MATCH (referrer:Customer {supabaseId: $referrerId})
        MATCH (referred:Customer {supabaseId: $referredId})
        MERGE (referrer)-[r:REFERRED]->(referred)
        SET r.referredAt = $referredAt
        SET r.commissionPaid = $commissionPaid
        SET r.lastSynced = datetime()
      `, {
        referrerId: referral.referrer_id,
        referredId: referral.referred_id,
        referredAt: referral.created_at,
        commissionPaid: referral.commission_paid || 0
      })
    }

    await session.close()
    console.log(`✅ Synced ${referrals.length} referral relationships`)
    
  } catch (error) {
    console.error('❌ Referral sync failed:', error)
    throw error
  }
}

export async function fullCustomerSync() {
  console.log('🚀 Starting full customer sync to knowledge graph...')
  
  try {
    await syncCustomersToGraph()
    await syncAgentRelationships()
    await syncPolicyRelationships()
    await syncReferralNetwork()
    
    console.log('🎉 Full customer sync completed successfully!')
    
  } catch (error) {
    console.error('💥 Full sync failed:', error)
    throw error
  } finally {
    await driver.close()
  }
}

// Function to create a single customer node (for plan recommendations)
export async function createCustomerNode(customerData: {
  supabaseId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  state: string;
  planType: string;
  householdSize: number;
  estimatedIncome?: number;
}) {
  const NEO4J_URI = process.env.NEO4J_URI || 'neo4j://localhost:7687'
  const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j'
  const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password'
  
  if (NEO4J_URI.includes('localhost')) {
    console.log('Neo4j not configured, skipping customer node creation')
    return null
  }
  
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD))
  
  try {
    const session = driver.session()
    
    const result = await session.run(`
      MERGE (c:Customer {supabaseId: $supabaseId})
      SET c.firstName = $firstName,
          c.lastName = $lastName,
          c.email = $email,
          c.dateOfBirth = $dateOfBirth,
          c.state = $state,
          c.planType = $planType,
          c.householdSize = $householdSize,
          c.estimatedIncome = $estimatedIncome,
          c.updatedAt = datetime()
      RETURN c
    `, customerData)
    
    await session.close()
    return result.records[0]?.get('c')
    
  } catch (error) {
    console.error('Error creating customer node:', error)
    throw error
  } finally {
    await driver.close()
  }
}

if (require.main === module) {
  fullCustomerSync()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
