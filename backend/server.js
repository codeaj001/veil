// VEIL Backend Express Server — Midnight Preprod Testnet Integration
import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { midnightService } from './midnightService.js';
import { provisionUserWallet } from './walletService.js';
import { getPreprodNetworkStatus } from './indexerClient.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health & Testnet Status Check
app.get('/api/health', async (req, res) => {
  const status = await getPreprodNetworkStatus();
  res.json({
    status: 'online',
    network: CONFIG.NETWORK_ID,
    midnightNode: CONFIG.MIDNIGHT_NODE_URL,
    indexer: CONFIG.INDEXER_GRAPHQL_URL,
    faucet: CONFIG.FAUCET_URL,
    tokens: CONFIG.NATIVE_TOKENS,
    preprodStatus: status
  });
});

// Automated Testnet Wallet Provisioning Endpoint
app.post('/api/wallet/provision', async (req, res) => {
  try {
    const { email } = req.body;
    const wallet = await provisionUserWallet(email);
    res.status(201).json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet Info Endpoint
app.get('/api/wallet', async (req, res) => {
  try {
    const wallet = await midnightService.getWalletInfo();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Markets List
app.get('/api/markets', async (req, res) => {
  try {
    const markets = await midnightService.getMarkets();
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Market Detail
app.get('/api/markets/:id', async (req, res) => {
  try {
    const market = await midnightService.getMarketById(req.params.id);
    res.json(market);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create Market Endpoint
app.post('/api/markets/create', async (req, res) => {
  try {
    const result = await midnightService.createMarket(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submit Private Bet with ZK Proof
app.post('/api/markets/:id/bet', async (req, res) => {
  try {
    const { side, amount } = req.body;
    const result = await midnightService.submitPrivateBet({
      marketId: req.params.id,
      side,
      amount
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Oracle Market Resolution
app.post('/api/markets/:id/resolve', async (req, res) => {
  try {
    const { outcome } = req.body;
    const result = await midnightService.resolveMarket(req.params.id, outcome);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Claim Payout Endpoint
app.post('/api/markets/:id/claim', async (req, res) => {
  try {
    const result = await midnightService.claimPayout(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Midnight Proof Explorer Chain Events
app.get('/api/proofs', async (req, res) => {
  try {
    const proofs = await midnightService.getProofs();
    res.json(proofs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Network Activity Feed
app.get('/api/activity', async (req, res) => {
  try {
    const activity = await midnightService.getActivity();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard Endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await midnightService.getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Portfolio Endpoint
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await midnightService.getPortfolio();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`[VEIL Backend] Running on http://localhost:${CONFIG.PORT}`);
    console.log(`[VEIL Backend] Network Target: ${CONFIG.NETWORK_ID} (${CONFIG.MIDNIGHT_NODE_URL})`);
    console.log(`[VEIL Backend] Indexer GraphQL: ${CONFIG.INDEXER_GRAPHQL_URL}`);
  });
}

export default app;
