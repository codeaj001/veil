// VEIL Backend & Midnight Smart Contract Integration Test Suite
import assert from 'assert';
import { midnightService } from '../midnightService.js';

async function runTests() {
  console.log('=== Starting VEIL Midnight E2E Verification Tests ===\n');

  // Test 1: Fetch Wallet & tDUST Balance
  console.log('[Test 1] Fetching Wallet & Native tDUST Balance...');
  const wallet = await midnightService.getWalletInfo();
  assert.strictEqual(wallet.token, 'tDUST');
  assert(wallet.balance > 0);
  console.log(`✓ Wallet Address: ${wallet.address}`);
  console.log(`✓ Balance: ${wallet.balance} ${wallet.token} (Available: ${wallet.available})\n`);

  // Test 2: Create New Market
  console.log('[Test 2] Creating New Prediction Market...');
  const newMktRes = await midnightService.createMarket({
    question: 'Will Midnight Testnet launch mainnet in Q3?',
    category: 'Technology',
    initialLiquidity: 1000
  });
  assert(newMktRes.market.id);
  console.log(`✓ Created Market ID: ${newMktRes.market.id}`);
  console.log(`✓ ZK Event Log: ${newMktRes.proof.id} (tx: ${newMktRes.proof.txHash})\n`);

  // Test 3: Query Live Markets
  console.log('[Test 3] Querying Prediction Markets...');
  const markets = await midnightService.getMarkets();
  assert(markets.length > 0);
  console.log(`✓ Retried ${markets.length} active markets on Midnight ledger.`);
  const targetMarket = markets[0];
  console.log(`  Top Market: "${targetMarket.question}" (YES Pool: ${targetMarket.yesPool}, NO Pool: ${targetMarket.noPool})\n`);

  // Test 4: Submit Private Bet with ZK Proof
  console.log('[Test 4] Submitting Private Bet via Midnight ZK Circuit...');
  const initialAvailable = wallet.available;
  const betRes = await midnightService.submitPrivateBet({
    marketId: targetMarket.id,
    side: 'YES',
    amount: 150
  });
  assert.strictEqual(betRes.status, 'success');
  assert.strictEqual(betRes.newBalance.available, initialAvailable - 150);
  console.log(`✓ Private Bet Executed: 150 tDUST staked on YES`);
  console.log(`✓ ZK Proof Generated: ${betRes.proof.id}`);
  console.log(`✓ Updated Market Volume: $${betRes.updatedMarket.volume}`);
  console.log(`✓ New Available Balance: ${betRes.newBalance.available} tDUST\n`);

  // Test 5: Oracle Market Resolution
  console.log('[Test 5] Resolving Market via Authorized Oracle Trigger...');
  const resolveRes = await midnightService.resolveMarket(targetMarket.id, 'YES');
  assert.strictEqual(resolveRes.market.isResolved, true);
  assert.strictEqual(resolveRes.market.winningOutcome, 'YES');
  console.log(`✓ Market ${targetMarket.id} resolved as YES`);
  console.log(`✓ Proof Chain Event: ${resolveRes.proof.id}\n`);

  // Test 6: Claim Payout Winnings
  console.log('[Test 6] Claiming Parimutuel Payout via ZK Proof Claim...');
  const claimRes = await midnightService.claimPayout(targetMarket.id);
  assert.strictEqual(claimRes.status, 'claimed');
  assert(claimRes.payout > 150); // Winner gets stake + proportional share of losing pool
  console.log(`✓ Payout Claimed: ${claimRes.payout} tDUST credited to wallet`);
  console.log(`✓ Proof Event: ${claimRes.proof.id}\n`);

  // Test 7: Verify Proof Chain
  console.log('[Test 7] Verifying Midnight Proof Chain Audit Trail...');
  const proofs = await midnightService.getProofs();
  assert(proofs.length >= 4);
  console.log(`✓ Total ZK Proof Events on Chain: ${proofs.length}\n`);

  console.log('🎉 ALL 7 E2E VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
