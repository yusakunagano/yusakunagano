# 株ナビ

市場動向（日経平均・TOPIX・S&P500・ドル円）とウォッチリストを一画面で確認し、
証券会社の MCP サーバー経由で注文まで行えるダッシュボードです。

## 起動

```bash
npm install
npm start   # http://localhost:3000
```

`MONEX_MCP_COMMAND` が無い場合は **デモモード**（発注しない・ダミー保有資産）で動きます。

## 証券会社 MCP との接続

stdio で動く MCP サーバーの起動コマンドを環境変数で渡します。

```bash
MONEX_MCP_COMMAND="node /path/to/monex-mcp-server.js" \
MCP_TOOL_PORTFOLIO=get_portfolio \
MCP_TOOL_ORDER=place_order \
npm start
```

- `MCP_TOOL_PORTFOLIO` / `MCP_TOOL_ORDER` は MCP サーバー側のツール名に合わせて変更してください。
  接続後 `/api/status` で利用可能なツール一覧を確認できます。
- 注文ツールには `{ symbol, side, quantity, price, order_type }` を渡します。引数名が違う場合は `broker.js` を調整してください。

## シグナルについて

5日/25日移動平均と RSI(14) から「注目 / 様子見 / 過熱注意」を表示します。
機械的な目安であり、売買を推奨するものではありません。
