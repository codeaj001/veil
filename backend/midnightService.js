// Midnight SDK Integration Service Layer for VEIL
import { CONFIG } from './config.js';
import { fetchPolymarketMarkets } from './polymarketIngestor.js';
import { supabaseServer } from './supabaseClient.js';

// In-memory ledger sync cache simulating indexer output for local test/dev environment
const mockState = {
  wallet: {
    address: 'mn_17a3f9c2b1e4d8a6f0c5b3d9e7a1f2c4b6d8e0f91',
    unshieldedAddress: 'mn_17a3f9c2b1e4d8a6f0c5b3d9e7a1f2c4b6d8e0f91',
    dustAddress: 'mn_dust_10c5b3d9e7a1f2c4b6d8e0f91',
    balance: 1000.00,
    available: 1000.00,
    locked: 0.00,
    token: CONFIG.NATIVE_TOKENS.DUST.symbol,
    tNIGHT: 100.00,
    username: 'Trader'
  },
  customMarkets: [],
  positions: [],
  proofs: [],
  activity: []
};

export class MidnightService {
  constructor() {
    this.network = CONFIG.NETWORK_ID;
    this.proofServer = CONFIG.PROOF_SERVER_URL;
  }

  async getWalletInfo() {
    return mockState.wallet;
  }

  async getMarkets() {
    const livePolymarkets = await fetchPolymarketMarkets();
    return [...mockState.customMarkets, ...livePolymarkets];
  }

  async getMarketById(id) {
    const all = await this.getMarkets();
    return all.find((m) => m.id === id) || all[0];
  }

  async createMarket(data) {
    const marketId = `mkt-${Date.now().toString(36)}`;
    const newMarket = {
      id: marketId,
      category: data.category || 'General',
      flag: data.flag || '🔮',
      question: data.question,
      yes: 50.0,
      yesPool: Number(data.initialLiquidity) / 2 || 250,
      noPool: Number(data.initialLiquidity) / 2 || 250,
      volume: Number(data.initialLiquidity) || 500,
      liquidity: Number(data.initialLiquidity) || 500,
      traders: 1,
      endsInDays: 30,
      status: 'live',
      change24h: 0,
      history: [50],
      oracle: CONFIG.DEFAULT_ORACLE_PUBKEY,
      isResolved: false
    };

    mockState.customMarkets.unshift(newMarket);

    // Record on Midnight Proof Chain
    const proofId = `#${184923 + mockState.proofs.length}`;
    const proofEvent = {
      id: proofId,
      txHash: `0x${Math.random().toString(16).substr(2, 16)}`,
      type: 'Market Created',
      private: false,
      timestamp: new Date().toISOString()
    };
    mockState.proofs.unshift(proofEvent);

    return { market: newMarket, proof: proofEvent };
  }

  async submitPrivateBet({ marketId, side, amount }) {
    const market = await this.getMarketById(marketId);
    if (!market) throw new Error('Market not found');

    const stake = Number(amount);
    if (mockState.wallet.available < stake) {
      throw new Error('Insufficient tDUST balance');
    }

    // Deduct available tDUST balance, move to locked
    mockState.wallet.available -= stake;
    mockState.wallet.locked += stake;

    // Update public volume pools while hiding individual bet parameters
    if (side.toUpperCase() === 'YES') {
      market.yesPool += stake;
    } else {
      market.noPool += stake;
    }
    market.volume += stake;
    market.traders += 1;
    market.yes = Number(((market.yesPool / (market.yesPool + market.noPool)) * 100).toFixed(1));
    market.history.push(market.yes);

    // Generate ZK proof record
    const proofId = `#${184923 + mockState.proofs.length}`;
    const proofEvent = {
      id: proofId,
      txHash: `0x${Math.random().toString(16).substr(2, 16)}`,
      type: 'Private Position',
      private: true,
      timestamp: new Date().toISOString(),
      claims: [
        'Wallet owns sufficient tDUST balance',
        'Market is active & unresolved',
        'Position satisfies Compact circuit rules',
        'Commitment nullifier unspent'
      ]
    };
    mockState.proofs.unshift(proofEvent);

    // Record user position
    const existingPos = mockState.positions.find((p) => p.market === market.question && p.side === side.toUpperCase());
    if (existingPos) {
      existingPos.amount += stake;
    } else {
      mockState.positions.push({
        market: market.question,
        side: side.toUpperCase(),
        amount: stake,
        pnl: 0,
        pnlPct: 0
      });
    }

    // Record activity
    mockState.activity.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Private position submitted via Midnight ZK (${stake} tDUST)`,
      market: market.question
    });

    return {
      status: 'success',
      proof: proofEvent,
      updatedMarket: market,
      newBalance: mockState.wallet
    };
  }

  async resolveMarket(marketId, outcome) {
    const market = await this.getMarketById(marketId);
    if (!market) throw new Error('Market not found');

    market.isResolved = true;
    market.status = 'closed';
    market.winningOutcome = outcome.toUpperCase();

    const proofId = `#${184923 + mockState.proofs.length}`;
    const proofEvent = {
      id: proofId,
      txHash: `0x${Math.random().toString(16).substr(2, 16)}`,
      type: 'Market Resolved',
      private: false,
      timestamp: new Date().toISOString()
    };
    mockState.proofs.unshift(proofEvent);

    return { status: 'resolved', market, proof: proofEvent };
  }

  async claimPayout(marketId) {
    const market = await this.getMarketById(marketId);
    if (!market) throw new Error('Market not found');
    if (!market.isResolved) throw new Error('Market is not resolved yet');

    const winningSide = market.winningOutcome;
    const posIndex = mockState.positions.findIndex((p) => p.market === market.question && p.side === winningSide && !p.claimed);
    if (posIndex === -1) {
      throw new Error('No unclaimed winning position found for this market');
    }

    const pos = mockState.positions[posIndex];
    const winningPool = winningSide === 'YES' ? market.yesPool : market.noPool;
    const losingPool = winningSide === 'YES' ? market.noPool : market.yesPool;

    // Parimutuel payout formula: Stake + (Stake * Losing Pool / Winning Pool)
    const bonus = winningPool > 0 ? (pos.amount * losingPool) / winningPool : 0;
    const totalPayout = Number((pos.amount + bonus).toFixed(2));

    // Release locked stake & add payout winnings to wallet
    mockState.wallet.locked = Math.max(0, mockState.wallet.locked - pos.amount);
    mockState.wallet.available += totalPayout;
    mockState.wallet.balance += Number((totalPayout - pos.amount).toFixed(2));

    pos.claimed = true;
    pos.pnl = Number((totalPayout - pos.amount).toFixed(2));

    // Record ZK Payout Claim Proof
    const proofId = `#${184923 + mockState.proofs.length}`;
    const proofEvent = {
      id: proofId,
      txHash: `0x${Math.random().toString(16).substr(2, 16)}`,
      type: 'Payout Claimed',
      private: true,
      timestamp: new Date().toISOString(),
      claims: [
        'Verified winning position ZK commitment',
        'Nullifier burned on Midnight testnet ledger',
        'Parimutuel payout released to wallet balance'
      ]
    };
    mockState.proofs.unshift(proofEvent);

    mockState.activity.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Claimed ${totalPayout} tDUST payout from resolved market`,
      market: market.question
    });

    return {
      status: 'claimed',
      payout: totalPayout,
      proof: proofEvent,
      newBalance: mockState.wallet
    };
  }

  async getProofs() {
    return mockState.proofs;
  }

  async getActivity() {
    return mockState.activity;
  }

  async getLeaderboard() {
    if (mockState.positions.length === 0) return [];
    return [
      {
        rank: 1,
        user: `${mockState.wallet.address.slice(0, 12)}...${mockState.wallet.address.slice(-4)}`,
        accuracy: 100.0,
        predictions: mockState.positions.length,
        calibration: 'A+'
      }
    ];
  }

  async getPortfolio() {
    return {
      wallet: mockState.wallet,
      positions: mockState.positions,
      history: []
    };
  }
}

export const midnightService = new MidnightService();
