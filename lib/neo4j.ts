import neo4j from 'neo4j-driver';
import { NEO4J_ENABLED } from './featureFlags';

let driver: ReturnType<typeof neo4j.driver> | null = null;

export function getDriver() {
  if (!NEO4J_ENABLED) {
    return null;
  }
  
  if (!driver) {
    const NEO4J_URI = process.env.NEO4J_URI!;
    const NEO4J_USER = process.env.NEO4J_USER!;
    const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD!;
    
    try {
      driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    } catch (error) {
      console.error('Failed to create Neo4j driver:', error);
      return null;
    }
  }
  
  return driver;
}

export const neo4jDriver = getDriver();

export async function getConversationHistory(conversationId: string, limit: number = 10) {
  const driver = getDriver();
  if (!driver) return [];
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Conversation {id: $conversationId})-[:HAS_MESSAGE]->(m:Message)
       RETURN m.content as content, m.role as role, m.timestamp as timestamp
       ORDER BY m.timestamp DESC
       LIMIT $limit`,
      { conversationId, limit }
    );
    
    return result.records.map(record => ({
      content: record.get('content'),
      role: record.get('role'),
      timestamp: record.get('timestamp')
    }));
  } catch (error) {
    console.error('Neo4j conversation history error:', error);
    return [];
  } finally {
    await session.close();
  }
}

export async function saveMessage(conversationId: string, role: string, content: string) {
  const driver = getDriver();
  if (!driver) return null;
  const session = driver.session();
  try {
    await session.run(
      `MERGE (c:Conversation {id: $conversationId})
       CREATE (m:Message {
         id: randomUUID(),
         role: $role,
         content: $content,
         timestamp: datetime()
       })
       CREATE (c)-[:HAS_MESSAGE]->(m)`,
      { conversationId, role, content }
    );
  } catch (error) {
    console.error('Neo4j save message error:', error);
  } finally {
    await session.close();
  }
}

export async function getClientRelationships(clientId: string) {
  const driver = getDriver();
  if (!driver) return null;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Client {id: $clientId})-[r]-(related)
       RETURN type(r) as relationship, labels(related) as labels, related.name as name
       LIMIT 20`,
      { clientId }
    );
    
    return result.records.map(record => ({
      relationship: record.get('relationship'),
      labels: record.get('labels'),
      name: record.get('name')
    }));
  } catch (error) {
    console.error('Neo4j client relationships error:', error);
    return [];
  } finally {
    await session.close();
  }
}

export async function createCustomerNetwork(customerId: string, customerData: any) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  try {
    await session.run(
      `MERGE (c:Customer {id: $customerId})
       SET c.name = $name, c.email = $email, c.phone = $phone`,
      { 
        customerId, 
        name: customerData.name, 
        email: customerData.email, 
        phone: customerData.phone 
      }
    );
  } catch (error) {
    console.error('Neo4j create customer error:', error);
  } finally {
    await session.close();
  }
}

export async function linkCustomerToAgent(customerId: string, agentId: string) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (c:Customer {id: $customerId})
       MERGE (a:Agent {id: $agentId})
       MERGE (a)-[:MANAGES]->(c)`,
      { customerId, agentId }
    );
  } catch (error) {
    console.error('Neo4j link customer to agent error:', error);
  } finally {
    await session.close();
  }
}

export async function createReferralChain(referrerId: string, referredId: string) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  try {
    await session.run(
      `MATCH (referrer:Customer {id: $referrerId})
       MATCH (referred:Customer {id: $referredId})
       MERGE (referrer)-[:REFERRED]->(referred)`,
      { referrerId, referredId }
    );
  } catch (error) {
    console.error('Neo4j create referral error:', error);
  } finally {
    await session.close();
  }
}

export async function findInfluentialCustomers() {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Customer)-[r:REFERRED]->(others)
       RETURN c.id AS customerId, 
              c.name AS name,
              count(r) AS referralCount
       ORDER BY referralCount DESC
       LIMIT 20`
    );
    
    return result.records.map(record => ({
      id: record.get('customerId'),
      name: record.get('name'),
      referralCount: record.get('referralCount').toNumber()
    }));
  } catch (error) {
    console.error('Neo4j influential customers error:', error);
    return [];
  } finally {
    await session.close();
  }
}

export async function getCustomerNetwork(customerId: string, depth: number = 3) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (c:Customer {supabaseId: $customerId})-[*1..${depth}]-(connected)
       RETURN DISTINCT connected.supabaseId AS connectedId, 
              connected.name AS name,
              connected.email AS email
       LIMIT 100`,
      { customerId }
    );
    
    return result.records.map(record => ({
      id: record.get('connectedId'),
      name: record.get('name'),
      email: record.get('email')
    }));
  } catch (error) {
    console.error('Neo4j customer network error:', error);
    return [];
  } finally {
    await session.close();
  }
}

export async function getCustomerSubgraph(supabaseId: string, depth: number = 2) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  
  try {
    const result = await session.run(`
      MATCH (c:Customer {supabaseId: $id})
      OPTIONAL MATCH (c)-[r1:ASSIGNED_TO]->(agent:Agent)
      OPTIONAL MATCH (c)-[r2:HAS_POLICY]->(policy:Policy)
      OPTIONAL MATCH (c)-[r3:REFERRED]->(referred:Customer)
      OPTIONAL MATCH (referrer:Customer)-[r4:REFERRED]->(c)
      RETURN c, agent, policy, referred, referrer, r1, r2, r3, r4
    `, { id: supabaseId });
    
    const records = result.records;
    if (!records.length) return null;
    
    const customer = records[0].get('c')?.properties;
    const agent = records[0].get('agent')?.properties;
    const policies = records.map(r => r.get('policy')?.properties).filter(Boolean);
    const referredCustomers = records.map(r => r.get('referred')?.properties).filter(Boolean);
    const referrer = records[0].get('referrer')?.properties;
    
    return {
      customer,
      agent,
      policies,
      referredCustomers,
      referrer,
      summary: `Customer ${customer?.name || customer?.email} has ${policies.length} policies, referred ${referredCustomers.length} customers${referrer ? `, and was referred by ${referrer.name || referrer.email}` : ''}.`
    };
  } catch (error) {
    console.error('Neo4j customer subgraph error:', error);
    return null;
  } finally {
    await session.close();
  }
}

export async function getTopReferrers(limit: number = 10) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  
  try {
    const result = await session.run(`
      MATCH (c:Customer)-[r:REFERRED]->(referred:Customer)
      WITH c, count(referred) as referralCount
      ORDER BY referralCount DESC
      LIMIT $limit
      RETURN c.name as name, c.email as email, referralCount
    `, { limit });
    
    return result.records.map(record => ({
      name: record.get('name'),
      email: record.get('email'),
      referralCount: record.get('referralCount').toNumber()
    }));
  } catch (error) {
    console.error('Neo4j top referrers error:', error);
    return [];
  } finally {
    await session.close();
  }
}

export async function getAgentCustomerCount(agentId: string) {
  const driver = getDriver(); if (!driver) return null;
  const session = driver.session();
  
  try {
    const result = await session.run(`
      MATCH (a:Agent {supabaseId: $agentId})<-[:ASSIGNED_TO]-(c:Customer)
      RETURN count(c) as customerCount
    `, { agentId });
    
    return result.records[0]?.get('customerCount').toNumber() || 0;
  } catch (error) {
    console.error('Neo4j agent customer count error:', error);
    return 0;
  } finally {
    await session.close();
  }
}

export const pingNeo4j = async (): Promise<boolean> => {
  try {
    const driver = getDriver(); if (!driver) return false;
    await driver.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
}

export const closeNeo4j = async () => {
  const driver = getDriver(); if (driver) {
    await driver.close();
  }
}
