import fs from 'fs';
import path from 'path';

// Automatically load .env file variables into process.env for Node backend processes
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const val = valueParts.join('=').trim();
        const cleanKey = key.trim();
        if (cleanKey && !process.env[cleanKey]) {
          process.env[cleanKey] = val;
        }
      }
    });
  }
} catch (err) {
  // Ignore env load errors
}

// VEIL Backend Configuration — Midnight Preprod Testnet
export const CONFIG = {
  PORT: process.env.PORT || 3001,
  NETWORK_ID: 'preprod',
  MIDNIGHT_NODE_URL: process.env.MIDNIGHT_NODE_URL || 'https://rpc.preprod.midnight.network',
  INDEXER_GRAPHQL_URL: process.env.INDEXER_GRAPHQL_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql',
  FAUCET_URL: process.env.FAUCET_URL || 'https://midnight-tmnight-preprod.nethermind.dev/',
  PROOF_SERVER_URL: process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300',
  NATIVE_TOKENS: {
    NIGHT: { symbol: 'tNIGHT', name: 'Midnight Testnet Governance Token' },
    DUST: { symbol: 'tDUST', decimals: 6, name: 'Midnight Testnet Shielded Asset' }
  },
  DEFAULT_ORACLE_PUBKEY: '0x02a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
};
