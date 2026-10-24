import express from "express";
import { connectBroker, isDemo, listTools, getPortfolio, placeOrder } from "./broker.js";
import { getSeries, analyze } from "./market.js";

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
