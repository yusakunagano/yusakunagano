# UI/UX デザインチェッカー

画面のスクリーンショット、またはURLをAI（Claude）が見て、UI/UXガイドラインに沿って改善点を挙げるWebアプリです。

## 参照できるガイドライン

| id | ガイドライン | 備考 |
|---|---|---|
| apple | Apple Human Interface Guidelines | iOS/macOS 公式 |
| material | Google Material Design 3 | Android/Web 公式 |
| paypay | PayPay系 国内決済アプリのUXパターン | PayPay社は網羅的なガイドラインを一般公開していないため、公開アプリの傾向をもとにした観点 |
| nielsen | ニールセンの10のユーザビリティヒューリスティクス | UX評価の定番 |
| wcag | WCAG 2.2 | アクセシビリティの国際基準 |
| digital_agency | デジタル庁デザインシステム | 日本語UI・フォーム |
| laws_of_ux | Laws of UX | フィッツ・ヒックの法則など |

チェック観点は `src/guidelines.js` にまとめてあり、編集すれば追加・変更できます。

## 使い方

```bash
npm install
npx playwright install chromium   # URLチェックを使う場合（またはCHROMIUM_PATHで既存のChromiumを指定）
export ANTHROPIC_API_KEY=sk-ant-...
npm start
# → http://localhost:3000
```

環境変数

- `ANTHROPIC_API_KEY`（必須）
- `CLAUDE_MODEL`（任意、デフォルト `claude-sonnet-5-5`）
- `CHROMIUM_PATH`（任意、Chromium 実行ファイルのパス）
- `PORT`（任意、デフォルト 3000）

## 仕組み

1. 画像アップロード（貼り付け・ドラッグ可）または URL → Playwright でモバイル/デスクトップ幅のスクリーンショットを撮影
2. 選んだガイドラインの観点をプロンプトに入れ、画像と一緒に Claude に送る
3. スコア・良い点・重要度別の改善点（根拠ガイドライン／場所／改善案）を表示
