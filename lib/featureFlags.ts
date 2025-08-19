const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return !url.includes('your_') && !url.includes('localhost') && (url.startsWith('http') || url.startsWith('neo4j'));
};

const isValidCredential = (credential: string | undefined): boolean => {
  if (!credential) return false;
  return !credential.includes('your_') && credential.length > 10;
};

export const NEO4J_ENABLED = Boolean(
  process.env.NEO4J_URI && 
  process.env.NEO4J_USER && 
  process.env.NEO4J_PASSWORD &&
  isValidUrl(process.env.NEO4J_URI) &&
  isValidCredential(process.env.NEO4J_PASSWORD)
);

export const WEAVIATE_ENABLED = Boolean(
  process.env.WEAVIATE_URL && 
  process.env.WEAVIATE_API_KEY &&
  isValidUrl(process.env.WEAVIATE_URL) &&
  isValidCredential(process.env.WEAVIATE_API_KEY)
);

export const OPENAI_ENABLED = Boolean(
  process.env.OPENAI_API_KEY &&
  isValidCredential(process.env.OPENAI_API_KEY)
);

export const DB_ENABLED = NEO4J_ENABLED || WEAVIATE_ENABLED;

console.log('🔧 Feature Flags:', {
  NEO4J_ENABLED,
  WEAVIATE_ENABLED,
  OPENAI_ENABLED,
  DB_ENABLED
});
