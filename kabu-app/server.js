import express from "express";
import { connectBroker, isDemo, listTools, getPortfolio, placeOrder } from "./broker.js";
import { getSeries, analyze, trendForecast, volatility } from "./market.js";

const INDICES = [
  { symbol: "^N225", name: "日経平均" },
  { symbol: "^TPX", name: "TOPIX" },
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "JPY=X", name: "ドル円" },
];
const watchlist = new Map([
  ["7203.T", "トヨタ自動車"], ["6758.T", "ソニーグループ"],
  ["9984.T", "ソフトバンクG"], ["8306.T", "三菱UFJ"],
]);

// 提案の対象にする銘柄 (主要な大型株)。1株単位で買える銘柄を想定。
const UNIVERSE = [
  ["7203.T", "トヨタ自動車"], ["6758.T", "ソニーグループ"], ["9984.T", "ソフトバンクG"],
  ["8306.T", "三菱UFJ"], ["8316.T", "三井住友FG"], ["6861.T", "キーエンス"],
  ["9432.T", "NTT"], ["9433.T", "KDDI"], ["8058.T", "三菱商事"], ["8001.T", "伊藤忠商事"],
  ["4063.T", "信越化学"], ["6501.T", "日立製作所"], ["7974.T", "任天堂"], ["4502.T", "武田薬品"],
  ["6098.T", "リクルート"], ["8035.T", "東京エレクトロン"], ["2914.T", "JT"], ["7267.T", "ホンダ"],
  ["9983.T", "ファーストリテイリング"], ["4568.T", "第一三共"],
];

const app = express();
app.use(express.json());
app.use(express.static("public"));

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(500).json({ error: e.message }));

app.get("/api/status", wrap(async (_req, res) => res.json({ demo: isDemo(), tools: await listTools() })));

app.get("/api/market", wrap(async (_req, res) => {
  res.json(await Promise.all(INDICES.map(async (ix) => {
    const s = await getSeries(ix.symbol);
    return { ...ix, demo: s.demo, points: s.points, ...analyze(s) };
  })));
}));

app.get("/api/watchlist", wrap(async (_req, res) => {
  res.json(await Promise.all([...watchlist].map(async ([symbol, name]) => {
    const s = await getSeries(symbol);
    return { symbol, name, demo: s.demo, points: s.points, ...analyze(s) };
  })));
}));

app.post("/api/watchlist", (req, res) => {
  const { symbol, name } = req.body;
  if (!symbol) return res.status(400).json({ error: "symbol は必須です" });
  watchlist.set(symbol.toUpperCase(), name || symbol);
  res.json({ ok: true });
});

app.delete("/api/watchlist/:symbol", (req, res) => {
  watchlist.delete(req.params.symbol);
  res.json({ ok: true });
});

// 予算内で「今買うならこれ」を出す。上昇トレンド・過熱していない・値動きが荒すぎない銘柄を優先。
app.get("/api/suggest", wrap(async (req, res) => {
  const budget = Math.max(1000, Number(req.query.budget) || 50000);
  const rows = await Promise.all(UNIVERSE.map(async ([symbol, name]) => {
    const s = await getSeries(symbol);
    const closes = s.points.map((p) => p.c);
    const a = analyze(s);
    const forecast = trendForecast(closes);
    const expected = (forecast / a.last - 1) * 100;
    const vol = volatility(closes) * 100;
    let score = expected - vol * 0.5;
    if (a.sma5 > a.sma25) score += 1;
    if (a.rsi > 70) score -= 3;
    if (a.rsi < 30) score += 1;
    return { symbol, name, demo: s.demo, price: a.last, change: a.change, rsi: a.rsi, forecast, expected, vol, score, reasons: a.reasons };
  }));
  const picks = rows.filter((r) => r.expected > 0 && r.rsi <= 70 && r.price <= budget)
    .sort((a, b) => b.score - a.score).slice(0, 3);
  // 予算をスコア上位3銘柄で均等に割り、1株単位で株数を決める
  let left = budget;
  const plan = picks.map((r) => {
    const qty = Math.floor(budget / picks.length / r.price);
    left -= qty * r.price;
    return { ...r, qty, cost: qty * r.price };
  });
  // 余りで買える分は上位から1株ずつ足す
  for (const p of plan) while (left >= p.price) { p.qty++; p.cost += p.price; left -= p.price; }
  res.json({
    budget, at: Date.now(), demo: rows.some((r) => r.demo),
    plan: plan.filter((p) => p.qty > 0), rest: Math.round(left),
    ranking: rows.sort((a, b) => b.score - a.score),
  });
}));

app.get("/api/portfolio", wrap(async (_req, res) => res.json(await getPortfolio())));

// 発注は必ず画面上の確認を経由させる (confirmed: true が無いと拒否)
app.post("/api/order", wrap(async (req, res) => {
  const { symbol, side, qty, price, confirmed } = req.body;
  if (!confirmed) return res.status(400).json({ error: "確認されていない注文です" });
  if (!symbol || !["buy", "sell"].includes(side) || !(qty > 0)) {
    return res.status(400).json({ error: "注文内容が不正です" });
  }
  res.json(await placeOrder({ symbol, side, qty: Number(qty), price: price ? Number(price) : undefined }));
}));

const port = process.env.PORT || 3000;
try {
  if (await connectBroker()) console.log("証券会社 MCP サーバーに接続しました");
  else console.log("MONEX_MCP_COMMAND 未設定のためデモモードで起動します");
} catch (e) {
  console.error("MCP 接続に失敗したためデモモードで起動します:", e.message);
}
app.listen(port, () => console.log(`http://localhost:${port}`));
