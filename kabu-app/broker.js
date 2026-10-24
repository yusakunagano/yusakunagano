// 証券会社 MCP サーバーとの接続。MONEX_MCP_COMMAND が未設定ならデモモードで動く。
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 使うツール名は MCP サーバーごとに違うので環境変数で差し替えられるようにする
const TOOLS = {
  portfolio: process.env.MCP_TOOL_PORTFOLIO || "get_portfolio",
  order: process.env.MCP_TOOL_ORDER || "place_order",
};

let client = null;

export async function connectBroker() {
  const command = process.env.MONEX_MCP_COMMAND;
  if (!command) return false;
  const [cmd, ...args] = command.split(" ");
  client = new Client({ name: "kabu-app", version: "0.1.0" });
  await client.connect(new StdioClientTransport({ command: cmd, args, env: process.env }));
  return true;
}

export const isDemo = () => client === null;

export async function listTools() {
  if (isDemo()) return [{ name: "(demo)", description: "MCP 未接続のデモモード" }];
  return (await client.listTools()).tools;
}

function parseResult(res) {
  const text = res.content?.find((c) => c.type === "text")?.text ?? "";
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function getPortfolio() {
  if (isDemo()) {
    return {
      cash: 1_000_000,
      positions: [
        { symbol: "7203.T", name: "トヨタ自動車", qty: 100, avgPrice: 2800 },
        { symbol: "6758.T", name: "ソニーグループ", qty: 50, avgPrice: 3200 },
      ],
    };
  }
  return parseResult(await client.callTool({ name: TOOLS.portfolio, arguments: {} }));
}

export async function placeOrder({ symbol, side, qty, price }) {
  if (isDemo()) return { status: "demo", message: "デモモードのため発注していません", symbol, side, qty, price };
  return parseResult(await client.callTool({
    name: TOOLS.order,
    arguments: { symbol, side, quantity: qty, price, order_type: price ? "limit" : "market" },
  }));
}
