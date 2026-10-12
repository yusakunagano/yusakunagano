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

サーバー不要の静的サイトです（GitHub Pages で無料公開）。

1. [Google AI Studio](https://aistudio.google.com/apikey) で自分の Gemini APIキーを無料発行
2. 公開ページを開き、APIキーを入力（ブラウザ内にだけ保存され、Google 以外には送信されません）
3. 画像をアップロード、またはURLを入力してチェック

- AI: Gemini API（デフォルト `gemini-2.5-flash`。画面上で変更可）
- URLの画面撮影: [microlink.io](https://microlink.io) の無料API（1日50回まで）

## 公開手順（初回のみ）

1. このブランチを `main` にマージ
2. リポジトリの Settings → Pages → Source を「GitHub Actions」に変更
3. `main` への push で自動公開 → `https://yusakunagano.github.io/yusakunagano/`

ローカルで試す場合: `python3 -m http.server -d public` → http://localhost:8000
