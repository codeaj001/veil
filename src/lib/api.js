// VEIL Frontend API Client — Midnight Backend Service & Supabase Fast Cache
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE = 'http://localhost:3001/api';
const LOCAL_MARKETS_CACHE_KEY = 'veil_cached_markets';

export async function fetchWallet() {
  try {
    const res = await fetch(`${API_BASE}/wallet`);
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error fetching wallet:', e.message);
    return null;
  }
}

export async function provisionWallet(email) {
  try {
    const res = await fetch(`${API_BASE}/wallet/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Failed to provision wallet');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error provisioning wallet:', e.message);
    return null;
  }
}

export async function fetchMarkets() {
  // 1. Check local storage instant cache first (~0ms)
  try {
    const rawLocal = localStorage.getItem(LOCAL_MARKETS_CACHE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asynchronously refresh in background
        refreshMarketsCache().catch(() => {});
        return parsed;
      }
    }
  } catch (e) {
    // Ignore cache parse errors
  }

  return await refreshMarketsCache();
}

async function refreshMarketsCache() {
  // 2. Query Supabase markets table (~20ms)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbMarkets, error } = await supabase
        .from('markets')
        .select('*')
        .order('volume', { ascending: false });

      if (!error && Array.isArray(dbMarkets) && dbMarkets.length > 0) {
        const formatted = dbMarkets.map((m) => ({
          id: m.id,
          question: m.question,
          category: m.category || 'General',
          yesPrice: parseFloat(m.yes_price) || 0.5,
          noPrice: parseFloat(m.no_price) || 0.5,
          volume: `$${(parseFloat(m.volume) || 0).toLocaleString()}`,
          rawVolume: parseFloat(m.volume) || 0,
          verified: true,
          resolved: false
        }));

        localStorage.setItem(LOCAL_MARKETS_CACHE_KEY, JSON.stringify(formatted));
        return formatted;
      }
    } catch (err) {
      console.warn('[VEIL API] Supabase markets query notice:', err.message);
    }
  }

  // 3. Fallback to Local Backend Endpoint
  try {
    const res = await fetch(`${API_BASE}/markets`);
    if (!res.ok) throw new Error('Failed to fetch markets');
    const markets = await res.json();
    if (Array.isArray(markets) && markets.length > 0) {
      localStorage.setItem(LOCAL_MARKETS_CACHE_KEY, JSON.stringify(markets));
    }
    return markets;
  } catch (e) {
    console.error('[VEIL API] Error fetching markets:', e.message);
    return [];
  }
}

const USER_POSITIONS_KEY = 'veil_user_positions';

export async function submitPrivateBet(marketId, side, amount, marketQuestion = '') {
  let question = marketQuestion;
  if (!question) {
    const m = await fetchMarketById(marketId);
    question = m?.question || marketId;
  }

  const newPosition = {
    id: `pos_${Date.now()}`,
    market_id: marketId,
    market: question,
    side: side,
    amount: Number(amount) || 100,
    entry: '$0.50',
    pnl: 0,
    timestamp: new Date().toISOString()
  };

  // 1. Persist position in local storage (~0ms)
  try {
    const existing = JSON.parse(localStorage.getItem(USER_POSITIONS_KEY) || '[]');
    const updated = [newPosition, ...existing];
    localStorage.setItem(USER_POSITIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[VEIL API] Failed to update local positions:', e.message);
  }

  // 2. Persist in Supabase user_positions table if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('user_positions').insert([{
        user_id: localStorage.getItem('veil_user_email') || 'anonymous',
        market_id: marketId,
        outcome: side,
        amount: Number(amount) || 100
      }]);
    } catch (err) {
      console.warn('[VEIL API] Supabase bet insertion notice:', err.message);
    }
  }

  // 3. Fallback to Local Backend Endpoint
  try {
    await fetch(`${API_BASE}/markets/${marketId}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side, amount })
    });
  } catch (e) {
    // Ignore backend connection error on Vercel deployment
  }

  return newPosition;
}

export async function createMarket(marketData) {
  try {
    const res = await fetch(`${API_BASE}/markets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marketData)
    });
    if (!res.ok) throw new Error('Failed to create market');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error creating market:', e.message);
    throw e;
  }
}

export async function fetchMarketById(id) {
  // 1. Look in cached markets / fetchMarkets list (~0ms)
  try {
    const markets = await fetchMarkets();
    const found = markets.find(m => String(m.id) === String(id));
    if (found) {
      const yesVal = found.yes !== undefined ? found.yes : Math.round((found.yesPrice || 0.5) * 100);
      return {
        ...found,
        yes: yesVal,
        volume: found.rawVolume || found.volume || 150000,
        liquidity: found.liquidity || 45000,
        traders: found.traders || 1280,
        endsInDays: found.endsInDays || 14,
        change24h: found.change24h || 2.4,
        history: found.history || [45, 48, 47, 52, 50, 54, yesVal]
      };
    }
  } catch (e) {
    console.warn('[VEIL API] Market lookup notice:', e.message);
  }

  // 2. Query Supabase directly by ID (~20ms)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: m, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && m) {
        const yesPct = Math.round((parseFloat(m.yes_price) || 0.5) * 100);
        return {
          id: m.id,
          question: m.question,
          category: m.category || 'General',
          yes: yesPct,
          volume: parseFloat(m.volume) || 150000,
          liquidity: 45000,
          traders: 1280,
          endsInDays: 14,
          change24h: 2.4,
          history: [45, 48, 47, 52, 50, 54, yesPct],
          source: m.source || 'Polymarket',
          polymarketUrl: m.polymarket_url || 'https://polymarket.com'
        };
      }
    } catch (err) {
      console.warn('[VEIL API] Supabase market query notice:', err.message);
    }
  }

  // 3. Fallback to Local Backend Endpoint
  try {
    const res = await fetch(`${API_BASE}/markets/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Ignore backend connection error on Vercel deployment
  }

  return null;
}

export async function fetchProofs() {
  try {
    const res = await fetch(`${API_BASE}/proofs`);
    if (!res.ok) throw new Error('Failed to fetch proof chain');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error fetching proofs:', e.message);
    return [];
  }
}

export async function fetchActivity() {
  try {
    const res = await fetch(`${API_BASE}/activity`);
    if (!res.ok) throw new Error('Failed to fetch activity feed');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error fetching activity:', e.message);
    return [];
  }
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error fetching leaderboard:', e.message);
    return [];
  }
}

export async function fetchPortfolio() {
  let positions = [];

  // 1. Read from localStorage instant positions cache
  try {
    const localPos = JSON.parse(localStorage.getItem(USER_POSITIONS_KEY) || '[]');
    if (Array.isArray(localPos) && localPos.length > 0) {
      positions = localPos;
    }
  } catch (e) {
    // ignore
  }

  // 2. Query Supabase user_positions if local is empty
  if (positions.length === 0 && isSupabaseConfigured && supabase) {
    try {
      const { data: dbPos } = await supabase
        .from('user_positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbPos && dbPos.length > 0) {
        positions = dbPos.map((p) => ({
          id: p.id,
          market: p.market_id || 'Active Position',
          side: p.outcome || 'YES',
          amount: p.amount || 100,
          pnl: 0
        }));
      }
    } catch (err) {
      console.warn('[VEIL API] Supabase portfolio query notice:', err.message);
    }
  }

  // 3. Fallback to local backend endpoint
  if (positions.length === 0) {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        if (data?.positions) positions = data.positions;
      }
    } catch (e) {
      // Backend unavailable on Vercel
    }
  }

  const totalAmountLocked = positions.reduce((acc, p) => acc + (Number(p.amount) || 100), 0);

  return {
    wallet: {
      balance: 1000,
      available: Math.max(0, 1000 - totalAmountLocked),
      locked: totalAmountLocked
    },
    positions,
    history: [
      { t: 'Day 1', v: 1000 },
      { t: 'Day 2', v: 1050 },
      { t: 'Day 3', v: 1020 },
      { t: 'Day 4', v: 1000 + totalAmountLocked }
    ],
    categories: [
      { name: 'Crypto', value: 60 },
      { name: 'Politics', value: 25 },
      { name: 'AI', value: 15 }
    ]
  };
}

export async function claimPayout(marketId) {
  try {
    const res = await fetch(`${API_BASE}/markets/${marketId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Claim payout failed');
    }
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Claim payout error:', e.message);
    throw e;
  }
}
