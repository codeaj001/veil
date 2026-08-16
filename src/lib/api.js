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

export async function submitPrivateBet(marketId, side, amount) {
  try {
    const res = await fetch(`${API_BASE}/markets/${marketId}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side, amount })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Bet submission failed');
    }
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Bet submission error:', e.message);
    throw e;
  }
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
  try {
    const res = await fetch(`${API_BASE}/markets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch market detail');
    return await res.json();
  } catch (e) {
    console.error(`[VEIL API] Error fetching market ${id}:`, e.message);
    return null;
  }
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
  try {
    const res = await fetch(`${API_BASE}/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return await res.json();
  } catch (e) {
    console.error('[VEIL API] Error fetching portfolio:', e.message);
    return { positions: [], history: [], categories: [] };
  }
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
