import crypto from 'crypto';

export function generateApiKey(): string {
  return ("API_" + crypto.randomBytes(32).toString('hex'));
}

export function validateApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.length === 64 && apiKey.startsWith("API_");
}