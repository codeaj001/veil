// Testnet Automated Wallet Provisioning & Preprod Verification Script
import assert from 'assert';
import { provisionUserWallet, deriveWalletKeys, generateRandomSeedHex } from '../walletService.js';
import { getPreprodNetworkStatus } from '../indexerClient.js';
import { CONFIG } from '../config.js';

async function runTestnetVerification() {
  console.log('=== Midnight Preprod Automated Wallet & Testnet Verification ===\n');

  // Test 1: Network Status & Indexer Connection
  console.log('[Test 1] Querying Midnight Preprod Network Status & Indexer...');
  const netStatus = await getPreprodNetworkStatus();
  assert(netStatus);
  console.log(`✓ Network: ${CONFIG.NETWORK_ID}`);
  console.log(`✓ RPC Node: ${CONFIG.MIDNIGHT_NODE_URL}`);
  console.log(`✓ Indexer GraphQL: ${CONFIG.INDEXER_GRAPHQL_URL}`);
  console.log(`✓ Faucet Endpoint: ${CONFIG.FAUCET_URL}\n`);

  // Test 2: Seed & HD Wallet Key Derivation
  console.log('[Test 2] Testing HD Wallet Seed & Key Derivation...');
  const seed = generateRandomSeedHex();
  const keys = deriveWalletKeys(seed);
  assert(keys.unshieldedAddress.startsWith('mn_1'));
  assert(keys.dustAddress.startsWith('mn_dust_1'));
  assert(keys.keys.zswap);
  console.log(`✓ Seed Generated: ${seed.substring(0, 16)}...`);
  console.log(`✓ Derived Unshielded Address: ${keys.unshieldedAddress}`);
  console.log(`✓ Derived Dust Address: ${keys.dustAddress}\n`);

  // Test 3: Full Automated User Onboarding Flow
  console.log('[Test 3] Executing Full Automated Testnet Provisioning Flow...');
  const userWallet = await provisionUserWallet('testnet_user@veil.app');
  assert.strictEqual(userWallet.status, 'provisioned');
  assert.strictEqual(userWallet.network, 'preprod');
  assert.strictEqual(userWallet.balances.tNIGHT, 100);
  assert.strictEqual(userWallet.dustRegistration.status, 'registered');
  console.log(`✓ Provisioned Wallet for ${userWallet.email}`);
  console.log(`✓ Address: ${userWallet.unshieldedAddress}`);
  console.log(`✓ Preprod Faucet: ${userWallet.faucetStatus.amount} (tx: ${userWallet.faucetStatus.txHash})`);
  console.log(`✓ DUST Registration: ${userWallet.dustRegistration.status} (tx: ${userWallet.dustRegistration.txHash})\n`);

  console.log('🎉 ALL PREPROD AUTOMATED TESTNET VERIFICATION TESTS PASSED!');
}

runTestnetVerification().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
