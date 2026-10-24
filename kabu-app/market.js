// 株価取得 (Yahoo Finance のチャート API)。取得できないときはダミーデータを返す。
const cache = new Map();

function demoSeries(symbol) {
  let seed = [...symbol].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  let p = 1000 + rand() * 4000;
  return Array.from({ length: 90 }, (_, i) => {
    p *= 1 + (rand() - 0.48) * 0.03;
    return { t: Date.now() - (89 - i) * 864e5, c: Math.round(p * 10) / 10 };
  });
}

export async function getSeries(symbol) {
  const hit = cache.get(symbol);
  if (hit && Date.now() - hit.at < 60_000) return hit.data;
  let data;
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(res.status);
    const r = (await res.json()).chart.result[0];
    const closes = r.indicators.quote[0].close;
    data = { symbol, demo: false, points: r.timestamp
      .map((t, i) => ({ t: t * 1000, c: closes[i] }))
      .filter((p) => p.c != null) };
  } catch {
    data = { symbol, demo: true, points: demoSeries(symbol) };
  }
  cache.set(symbol, { at: Date.now(), data });
  return data;
}

const sma = (arr, n) => arr.slice(-n).reduce((a, b) => a + b, 0) / n;

function rsi(closes, n = 14) {
  let gain = 0, loss = 0;
  for (let i = closes.length - n; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    d > 0 ? (gain += d) : (loss -= d);
  }
  return loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
}

// テクニカル指標から「注目度」を出す。売買の推奨ではなく、検討のきっかけ。
export function analyze(series) {
  const closes = series.points.map((p) => p.c);
  const last = closes.at(-1), prev = closes.at(-2);
  const s5 = sma(closes, 5), s25 = sma(closes, 25), r = rsi(closes);
  const reasons = [];
  let score = 0;
  if (s5 > s25) { score++; reasons.push("短期線(5日)が中期線(25日)を上回る"); }
  if (r < 30) { score++; reasons.push(`RSI ${r.toFixed(0)}：売られすぎ水準`); }
  if (r > 70) { score--; reasons.push(`RSI ${r.toFixed(0)}：買われすぎ水準`); }
  if (last > s25) reasons.push("株価が25日線より上");
  const signal = score >= 1 ? "注目" : score <= -1 ? "過熱注意" : "様子見";
  return { last, change: ((last - prev) / prev) * 100, sma5: s5, sma25: s25, rsi: r, signal, reasons };
}

// 直近20日の回帰直線を5営業日先に延ばした値。予言ではなくトレンドの延長。
export function trendForecast(closes, n = 20, ahead = 5) {
  const y = closes.slice(-n), xm = (n - 1) / 2, ym = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  y.forEach((v, i) => { num += (i - xm) * (v - ym); den += (i - xm) ** 2; });
  const slope = num / den;
  return ym + slope * (n - 1 - xm + ahead);
}

// 日次リターンの標準偏差 (値動きの荒さ)
export function volatility(closes, n = 20) {
  const r = closes.slice(-n - 1).map((v, i, a) => (i ? v / a[i - 1] - 1 : 0)).slice(1);
  const m = r.reduce((a, b) => a + b, 0) / r.length;
  return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length);
}
