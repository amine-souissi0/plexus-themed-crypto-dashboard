export default async function handler(req, res) {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1' +
      '&sparkline=true&price_change_percentage=24h,7d';
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: 'Upstream error', detail: text });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
