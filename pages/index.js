import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

function Sparkline({ series, width=120, height=28, strokeWidth=2 }) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const step = (width - 2) / (series.length - 1);
  const points = series.map((v, i) => {
    const x = 1 + i * step;
    const y = height - 1 - ((v - min) / range) * (height - 2);
    return `${x},${y}`;
  }).join(' ');
  const rising = series[series.length - 1] >= series[0];
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        points={points} style={{ color: rising ? 'var(--success)' : 'var(--danger)' }} />
    </svg>
  );
}

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const timerRef = useRef(null);

  async function fetchData() {
    try {
      setError(null);
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('Failed to fetch prices');
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    fetchData();
    timerRef.current = setInterval(fetchData, 60_000);
    return () => clearInterval(timerRef.current);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  const filtered = data.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  return (
    <main className="container">
      <div className="header" style={{ marginBottom: 8 }}>
        <h1>Crypto Dashboard <span className="badge">Plexus Web3 demo</span></h1>
        <div className="header-actions">
          <input className="input" placeholder="Search coin…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn" onClick={fetchData} title="Refresh now">Refresh</button>
          <button className="btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? 'Dark' : 'Light'} mode
          </button>
          <a className="btn" href="https://calendly.com/aaron-bennett-plexusrs/intro" target="_blank" rel="noreferrer">Book with Aaron</a>
        </div>
      </div>

      <p className="small" style={{ marginTop: 0, marginBottom: 12 }}>
        Top 10 coins by market cap (live from CoinGecko) • Themeable • Auto-refresh every 60s • 7d trend sparklines
      </p>

      {lastUpdated && (
        <p className="small" style={{ marginTop: 0, marginBottom: 24 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
          {' '}• <Link className="link" href="/about">About this demo</Link>
          {' '}• <a className="link" href="https://plexusrs.com/" target="_blank" rel="noreferrer">Visit PlexusRS</a>
        </p>
      )}

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'var(--danger)' }}>Error: {error}</p>}

      {!loading && !error && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price (USD)</th>
                <th>24h %</th>
                <th>Market Cap</th>
                <th>7d</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.symbol.toUpperCase()}</td>
                  <td>${Number(c.current_price).toLocaleString()}</td>
                  <td style={{ color: c.price_change_percentage_24h >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {c.price_change_percentage_24h?.toFixed(2)}%
                  </td>
                  <td>${Number(c.market_cap).toLocaleString()}</td>
                  <td><Sparkline series={c?.sparkline_in_7d?.price || []} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="small" style={{ marginTop: 16 }}>
        Data from CoinGecko public API. Demo project for interviews.
      </footer>
    </main>
  );
}
