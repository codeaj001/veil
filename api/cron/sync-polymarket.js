// Vercel Cron Serverless Function: /api/cron/sync-polymarket
import { createClient } from '@supabase/supabase-js';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';
const CATEGORY_TAG_MAP = [
  { tag: 'crypto', name: 'Crypto' },
  { tag: 'politics', name: 'Politics' },
  { tag: 'sports', name: 'Sports' },
  { tag: 'tech', name: 'Technology' },
  { tag: 'pop-culture', name: 'Culture' },
  { tag: 'economics', name: 'Economics' }
];

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials missing in environment.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const allMarkets = [];

    // Fetch top active markets per category from Polymarket
    for (const { tag, name } of CATEGORY_TAG_MAP) {
      try {
        const url = `${POLYMARKET_API_BASE}/events?limit=15&active=true&closed=false&order=volume24hr&ascending=false&tag_slug=${tag}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const events = await response.json();
        if (!Array.isArray(events)) continue;

        for (const event of events) {
          if (!event.markets || event.markets.length === 0) continue;
          const m = event.markets[0];
          if (!m || !m.question) continue;

          let yesPrice = 0.5;
          let noPrice = 0.5;
          try {
            const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
            if (Array.isArray(prices) && prices.length >= 2) {
              yesPrice = parseFloat(prices[0]) || 0.5;
              noPrice = parseFloat(prices[1]) || 0.5;
            }
          } catch (e) {
            // Default 50/50 fallback
          }

          allMarkets.push({
            id: `pm-${m.id || Math.random().toString(36).substring(2, 9)}`,
            question: m.question,
            category: name,
            yes_price: Math.round(yesPrice * 100) / 100,
            no_price: Math.round(noPrice * 100) / 100,
            volume: Math.round(parseFloat(event.volume24hr || event.volume || m.volume || 1000)),
            image: event.image || m.image || null,
            end_date: event.endDate || m.endDate || null,
            synced_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`[Cron Sync Notice] Tag ${tag} fetch warning:`, err.message);
      }
    }

    // Deduplicate by question title
    const uniqueMap = new Map();
    for (const m of allMarkets) {
      if (!uniqueMap.has(m.question)) {
        uniqueMap.set(m.question, m);
      }
    }
    const uniqueMarkets = Array.from(uniqueMap.values());

    if (uniqueMarkets.length > 0) {
      const { error: upsertError } = await supabase
        .from('markets')
        .upsert(uniqueMarkets, { onConflict: 'id' });

      if (upsertError) {
        throw upsertError;
      }
    }

    return res.status(200).json({
      success: true,
      syncedCount: uniqueMarkets.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Vercel Cron Sync Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
