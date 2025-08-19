import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const r2 = r2Client;

export async function uploadToR2(key: string, body: Buffer | Uint8Array | string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await r2.send(command);
}

export async function getFromR2(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  return await r2.send(command);
}

export async function listR2Objects(prefix?: string) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME!,
    Prefix: prefix,
  });

  return await r2.send(command);
}

export function getR2PublicUrl(key: string): string {
  return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}
