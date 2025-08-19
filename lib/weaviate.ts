import weaviate, { ApiKey } from 'weaviate-ts-client';
import { WEAVIATE_ENABLED } from './featureFlags';

let client: ReturnType<typeof weaviate.client> | null = null;

export function getWeaviateClient() {
  if (!WEAVIATE_ENABLED) {
    return null;
  }
  
  if (!client) {
    const weaviateUrl = process.env.WEAVIATE_URL!;
    const weaviateApiKey = process.env.WEAVIATE_API_KEY!;
    
    try {
      client = weaviate.client({
        scheme: 'https',
        host: weaviateUrl.replace('https://', ''),
        apiKey: new ApiKey(weaviateApiKey),
      });
    } catch (error) {
      console.error('Failed to create Weaviate client:', error);
      return null;
    }
  }
  
  return client;
}

export const weaviateClient = getWeaviateClient();

export interface InsuranceCarrier {
  name: string;
  state: string;
  naicCode?: string;
  description?: string;
  website?: string;
  phone?: string;
  planTypes?: string[];
  rating?: string;
  [key: string]: unknown;
}

export interface InsuranceGuide {
  title: string;
  content: string;
  state: string;
  category: string;
  lastUpdated: string;
  source: string;
  tags?: string[];
  [key: string]: unknown;
}

export class WeaviateService {
  private getClient() {
    return getWeaviateClient();
  }
  
  isAvailable(): boolean {
    return this.getClient() !== null
  }
  
  private checkClient() {
    const client = this.getClient();
    if (!client) {
      console.warn('Weaviate client not available')
      return false
    }
    return true
  }

  async initializeSchema() {
    const client = this.getClient();
    if (!client) return
    const documentSchema = {
      class: 'Document',
      description: 'Document metadata for chunked content',
      vectorizer: 'none',
      properties: [
        {
          name: 'title',
          dataType: ['text'],
          description: 'Title of the document'
        },
        {
          name: 'source',
          dataType: ['text'],
          description: 'Source type: government, carrier, training, regulation'
        },
        {
          name: 'url',
          dataType: ['text'],
          description: 'URL or file path of the document'
        },
        {
          name: 'contentType',
          dataType: ['text'],
          description: 'Type of content: guide, carrier, training, regulation'
        },
        {
          name: 'createdAt',
          dataType: ['date'],
          description: 'When the document was created'
        },
        {
          name: 'metadata',
          dataType: ['object'],
          description: 'Additional metadata as JSON object'
        }
      ]
    };

    const documentChunkSchema = {
      class: 'DocumentChunk',
      description: 'Chunked content with vector embeddings',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'text-embedding-3-small',
          modelVersion: '002',
          type: 'text'
        }
      },
      invertedIndexConfig: {
        bm25: {
          b: 0.75,
          k1: 1.2
        }
      },
      properties: [
        {
          name: 'documentId',
          dataType: ['text'],
          description: 'Reference to parent document',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'content',
          dataType: ['text'],
          description: 'The actual chunk content',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'heading',
          dataType: ['text'],
          description: 'Section heading or title',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'page',
          dataType: ['int'],
          description: 'Page number if applicable',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'startTime',
          dataType: ['number'],
          description: 'Start time for video content',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'endTime',
          dataType: ['number'],
          description: 'End time for video content',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'contentType',
          dataType: ['text'],
          description: 'Type: guide, carrier, training, regulation',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'tokenCount',
          dataType: ['int'],
          description: 'Number of tokens in this chunk',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'metadata',
          dataType: ['object'],
          description: 'Additional metadata as JSON object',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        }
      ]
    };

    const carrierSchema = {
      class: 'InsuranceCarrier',
      description: 'Insurance carriers and their information',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'text-embedding-3-small',
          modelVersion: '002',
          type: 'text'
        }
      },
      properties: [
        {
          name: 'name',
          dataType: ['text'],
          description: 'Name of the insurance carrier',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'state',
          dataType: ['text'],
          description: 'State where carrier operates',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'naicCode',
          dataType: ['text'],
          description: 'NAIC company code',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'description',
          dataType: ['text'],
          description: 'Description of the carrier and services',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'website',
          dataType: ['text'],
          description: 'Carrier website URL',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'phone',
          dataType: ['text'],
          description: 'Carrier phone number',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'planTypes',
          dataType: ['text[]'],
          description: 'Types of insurance plans offered',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'rating',
          dataType: ['text'],
          description: 'Financial strength rating',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        }
      ]
    };

    const guideSchema = {
      class: 'InsuranceGuide',
      description: 'Insurance guides and documentation',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'text-embedding-3-small',
          modelVersion: '002',
          type: 'text'
        }
      },
      properties: [
        {
          name: 'title',
          dataType: ['text'],
          description: 'Title of the guide',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'content',
          dataType: ['text'],
          description: 'Full content of the guide',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'state',
          dataType: ['text'],
          description: 'State this guide applies to',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'category',
          dataType: ['text'],
          description: 'Category of the guide',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'lastUpdated',
          dataType: ['date'],
          description: 'When the guide was last updated',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'source',
          dataType: ['text'],
          description: 'Source of the guide information',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'tags',
          dataType: ['text[]'],
          description: 'Tags for categorization',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        }
      ]
    };

    try {
      await client.schema.classCreator().withClass(documentSchema).do();
      console.log('✅ Document schema created');
    } catch (error) {
      console.log('Document schema already exists or error:', error);
    }

    try {
      await client.schema.classCreator().withClass(documentChunkSchema).do();
      console.log('✅ DocumentChunk schema created');
    } catch (error) {
      console.log('DocumentChunk schema already exists or error:', error);
    }

    try {
      await client.schema.classCreator().withClass(carrierSchema).do();
      console.log('✅ InsuranceCarrier schema created');
    } catch (error) {
      console.log('InsuranceCarrier schema already exists or error:', error);
    }

    try {
      await client.schema.classCreator().withClass(guideSchema).do();
      console.log('✅ InsuranceGuide schema created');
    } catch (error) {
      console.log('InsuranceGuide schema already exists or error:', error);
    }
  }

  async addCarrier(carrier: InsuranceCarrier) {
    const client = this.getClient();
    if (!client) return null
    return await client.data
      .creator()
      .withClassName('InsuranceCarrier')
      .withProperties(carrier)
      .do();
  }

  async addGuide(guide: InsuranceGuide) {
    const client = this.getClient();
    if (!client) return null
    return await client.data
      .creator()
      .withClassName('InsuranceGuide')
      .withProperties(guide)
      .do();
  }

  async searchCarriers(query: string, state?: string, limit: number = 10) {
    const client = this.getClient();
    if (!client) return []
    let queryBuilder = client.graphql
      .get()
      .withClassName('InsuranceCarrier')
      .withFields('name state naicCode description website phone planTypes rating')
      .withNearText({ concepts: [query] })
      .withLimit(limit);

    if (state) {
      queryBuilder = queryBuilder.withWhere({
        path: ['state'],
        operator: 'Equal',
        valueText: state
      });
    }

    return await queryBuilder.do();
  }

  async searchGuides(query: string, state?: string, category?: string, limit: number = 10) {
    const client = this.getClient();
    if (!client) return []
    let queryBuilder = client.graphql
      .get()
      .withClassName('InsuranceGuide')
      .withFields('title content state category lastUpdated source tags')
      .withNearText({ concepts: [query] })
      .withLimit(limit);

    const whereConditions = [];
    
    if (state) {
      whereConditions.push({
        path: ['state'],
        operator: 'Equal',
        valueText: state
      });
    }

    if (category) {
      whereConditions.push({
        path: ['category'],
        operator: 'Equal',
        valueText: category
      });
    }

    if (whereConditions.length === 1) {
      queryBuilder = queryBuilder.withWhere(whereConditions[0]);
    } else if (whereConditions.length > 1) {
      queryBuilder = queryBuilder.withWhere({
        operator: 'And',
        operands: whereConditions
      });
    }

    return await queryBuilder.do();
  }

  async getCarriersByState(state: string) {
    const client = this.getClient();
    if (!client) return [];
    return await client.graphql
      .get()
      .withClassName('InsuranceCarrier')
      .withFields('name state naicCode description website phone planTypes rating')
      .withWhere({
        path: ['state'],
        operator: 'Equal',
        valueText: state
      })
      .do();
  }

  async bulkAddCarriers(carriers: InsuranceCarrier[]) {
    const client = this.getClient();
    if (!client) return null;
    const batcher = client.batch.objectsBatcher();
    
    carriers.forEach(carrier => {
      batcher.withObject({
        class: 'InsuranceCarrier',
        properties: carrier
      });
    });

    return await batcher.do();
  }

  async bulkAddGuides(guides: InsuranceGuide[]) {
    const client = this.getClient();
    if (!client) {
      console.log('⚠️ Weaviate client not available, skipping guide ingestion');
      return;
    }
    
    console.log(`📚 Adding ${guides.length} guides to Weaviate...`);
    const batcher = client.batch.objectsBatcher();
    
    guides.forEach(guide => {
      batcher.withObject({
        class: 'InsuranceGuide',
        properties: guide
      });
    });

    return await batcher.do();
  }

  async addDocument(document: any) {
    const client = this.getClient();
    if (!client) return null
    return await client.data
      .creator()
      .withClassName('Document')
      .withProperties(document)
      .do();
  }

  async addDocumentChunk(chunk: any) {
    const client = this.getClient();
    if (!client) return null
    return await client.data
      .creator()
      .withClassName('DocumentChunk')
      .withProperties(chunk)
      .do();
  }

  async bulkAddDocumentChunks(chunks: any[]) {
    const client = this.getClient();
    if (!client) return null
    const batcher = client.batch.objectsBatcher();
    
    chunks.forEach(chunk => {
      batcher.withObject({
        class: 'DocumentChunk',
        properties: chunk
      });
    });

    return await batcher.do();
  }

  async hybridSearchChunks(query: string, contentType?: string, limit: number = 10, alpha: number = 0.7) {
    const client = this.getClient();
    if (!client) return []
    let queryBuilder = client.graphql
      .get()
      .withClassName('DocumentChunk')
      .withFields('documentId content heading page startTime endTime contentType tokenCount metadata')
      .withHybrid({
        query: query,
        alpha: alpha
      })
      .withLimit(limit);

    if (contentType) {
      queryBuilder = queryBuilder.withWhere({
        path: ['contentType'],
        operator: 'Equal',
        valueText: contentType
      });
    }

    return await queryBuilder.do();
  }

  async searchChunksByVector(query: string, contentType?: string, limit: number = 10) {
    const client = this.getClient();
    if (!client) return []
    let queryBuilder = client.graphql
      .get()
      .withClassName('DocumentChunk')
      .withFields('documentId content heading page startTime endTime contentType tokenCount metadata')
      .withNearText({ concepts: [query] })
      .withLimit(limit);

    if (contentType) {
      queryBuilder = queryBuilder.withWhere({
        path: ['contentType'],
        operator: 'Equal',
        valueText: contentType
      });
    }

    return await queryBuilder.do();
  }
}

export const weaviateService = new WeaviateService();

export async function searchPolicies(query: string, limit: number = 3) {
  try {
    const client = getWeaviateClient();
    if (!client) return [];
    const result = await client.graphql
      .get()
      .withClassName('Policy')
      .withNearText({ concepts: [query] })
      .withFields('content title type')
      .withLimit(limit)
      .do();
    
    return result.data?.Get?.Policy || [];
  } catch (error) {
    console.error('Weaviate search error:', error);
    return [];
  }
}

export async function searchClients(query: string, limit: number = 3) {
  try {
    const client = getWeaviateClient();
    if (!client) return [];
    const result = await client.graphql
      .get()
      .withClassName('Client')
      .withNearText({ concepts: [query] })
      .withFields('name email phone policies')
      .withLimit(limit)
      .do();
    
    return result.data?.Get?.Client || [];
  } catch (error) {
    console.error('Weaviate client search error:', error);
    return [];
  }
}

export const pingWeaviate = async (): Promise<boolean> => {
  try {
    const client = getWeaviateClient();
    if (!client) return false;
    await client.misc.liveChecker().do();
    return true;
  } catch (error) {
    console.error('Weaviate connection failed:', error);
    return false;
  }
}
