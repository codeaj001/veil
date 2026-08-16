// VEIL Polymarket Ingestion Service
// Ingests live prediction markets dynamically from Polymarket Gamma API

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';

const CATEGORY_TAG_MAP = [
  { tag: 'crypto', name: 'Crypto', flag: '₿' },
  { tag: 'politics', name: 'Politics', flag: '🏛️' },
  { tag: 'sports', name: 'Sports', flag: '⚽' },
  { tag: 'tech', name: 'Technology', flag: '🤖' },
  { tag: 'pop-culture', name: 'Culture', flag: '🍿' },
  { tag: 'economics', name: 'Economics', flag: '📈' }
];

let cachedMarkets = [];
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function fetchPolymarketMarkets(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedMarkets.length > 0 && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedMarkets;
  }

  try {
    const allFetched = [];

    // Query Polymarket events for each target category in parallel
    const promises = CATEGORY_TAG_MAP.map(async ({ tag, name, flag }) => {
      try {
        const url = `${POLYMARKET_API_BASE}/events?limit=15&active=true&closed=false&order=volume24hr&ascending=false&tag_slug=${tag}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const events = await res.json();
        if (!Array.isArray(events)) return [];

        return events.flatMap((event) => {
          if (!event.markets || event.markets.length === 0) return [];
          const m = event.markets[0];
          if (!m || !m.question) return [];

          let outcomePrices = [0.5, 0.5];
          try {
            if (typeof m.outcomePrices === 'string') {
              outcomePrices = JSON.parse(m.outcomePrices);
            } else if (Array.isArray(m.outcomePrices)) {
              outcomePrices = m.outcomePrices;
            }
          } catch (e) {
            outcomePrices = [0.5, 0.5];
          }

          const yesProb = Math.min(99.9, Math.max(0.1, Math.round(Number(outcomePrices[0] || 0.5) * 1000) / 10));
          const totalVol = Math.round(Number(event.volume || m.volume || m.volume24hr || 1000));
          const totalLiq = Math.round(Number(event.liquidity || m.liquidity || 500));
          const yesPool = Math.round(totalLiq * (yesProb / 100));
          const noPool = Math.max(1, totalLiq - yesPool);

          let endsInDays = 30;
          if (m.endDate || event.endDate) {
            const endMs = new Date(m.endDate || event.endDate).getTime();
            const diffDays = Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24));
            if (!isNaN(diffDays) && diffDays > 0) endsInDays = diffDays;
          }

          return [{
            id: `poly-${m.id || event.id}`,
            category: name,
            flag: flag,
            question: m.question || event.title,
            description: m.description || event.description || '',
            yes: yesProb,
            yesPool: yesPool,
            noPool: noPool,
            volume: totalVol,
            liquidity: totalLiq,
            traders: Math.max(5, Math.round(totalVol / 120)),
            endsInDays: endsInDays,
            status: 'live',
            change24h: Math.round((Number(m.oneDayPriceChange || 0) * 100) * 10) / 10,
            history: [
              Math.max(1, Math.round(yesProb * 0.9)),
              Math.max(1, Math.round(yesProb * 0.95)),
              yesProb
            ],
            oracle: m.conditionId || m.questionID || '0x02a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
            isResolved: false,
            source: 'Polymarket',
            image: event.image || event.icon || m.image || m.icon || null,
            polymarketUrl: `https://polymarket.com/event/${event.slug || m.slug || ''}`
          }];
        });
      } catch (err) {
        console.error(`[Polymarket Ingestor] Error fetching category ${name}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(promises);
    const flattened = results.flat();

    // Deduplicate by question title
    const seen = new Set();
    const uniqueMarkets = [];
    for (const m of flattened) {
      if (!seen.has(m.question)) {
        seen.add(m.question);
        uniqueMarkets.push(m);
      }
    }

    if (uniqueMarkets.length > 0) {
      cachedMarkets = uniqueMarkets;
      lastFetchTimestamp = now;
      console.log(`[Polymarket Ingestor] Successfully synced ${cachedMarkets.length} live Polymarket markets across all categories.`);
    }

    return cachedMarkets;
  } catch (err) {
    console.error('[Polymarket Ingestor] Failed to fetch Polymarket API:', err.message);
    return cachedMarkets;
  }
}
