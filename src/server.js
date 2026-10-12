import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import { chromium } from 'playwright-core';
import { GUIDELINES, DEFAULT_GUIDELINES, buildGuidelineText } from './guidelines.js';

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || undefined; // 例: /opt/pw-browsers/chromium

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const anthropic = new Anthropic();

app.use(express.static(new URL('../public', import.meta.url).pathname));

app.get('/api/guidelines', (_req, res) => {
  res.json({
    defaults: DEFAULT_GUIDELINES,
    items: Object.entries(GUIDELINES).map(([id, g]) => ({ id, name: g.name, url: g.url, note: g.note })),
  });
});

const VIEWPORTS = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
};

async function screenshotUrl(url, device) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('http(s) のURLを指定してください');
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  try {
    const page = await browser.newPage({ viewport: VIEWPORTS[device] || VIEWPORTS.mobile });
    try {
      await page.goto(parsed.href, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      // 通信が鳴り止まないページは load 済みならそのまま撮影する
      if (e.name !== 'TimeoutError') throw new Error(`ページを開けませんでした: ${e.message.split('\n')[0]}`);
    }
    // 長すぎるページは画像サイズ上限を超えるので上部 3000px までに制限する
    const vp = page.viewportSize();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    return await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: vp.width, height: Math.min(height, 3000) } });
  } finally {
    await browser.close();
  }
}

const SYSTEM_PROMPT = `あなたは経験豊富なUI/UXデザインレビュアーです。
与えられた画面のスクリーンショットを、指定されたガイドラインの観点に基づいてレビューしてください。
- 画像から実際に確認できることだけを根拠にし、推測の場合は「推測」と明記する
- 寸法やコントラスト比は画像からの目安として述べる
- 改善点は具体的に（どの要素を・どう変えるか）
- 良い点も挙げる
出力は必ず次のJSONのみ（コードブロック不要）:
{
  "summary": "全体所見（2〜3文）",
  "score": 0〜100の整数,
  "good_points": ["..."],
  "issues": [
    {
      "title": "短い見出し",
      "severity": "high" | "medium" | "low",
      "guideline": "根拠となるガイドラインのid",
      "rule": "該当する観点",
      "location": "画面上の場所",
      "problem": "何が問題か",
      "suggestion": "具体的な改善案"
    }
  ]
}`;

function parseJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AIの応答を解析できませんでした');
  return JSON.parse(m[0]);
}

app.post('/api/check', upload.single('image'), async (req, res) => {
  try {
    const keys = String(req.body.guidelines || DEFAULT_GUIDELINES.join(',')).split(',').filter(Boolean);
    const context = (req.body.context || '').slice(0, 2000);
    let image, mediaType;

    if (req.file) {
      image = req.file.buffer;
      mediaType = req.file.mimetype;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mediaType)) {
        return res.status(400).json({ error: 'PNG / JPEG / WebP / GIF の画像を指定してください' });
      }
    } else if (req.body.url) {
      image = await screenshotUrl(req.body.url, req.body.device);
      mediaType = 'image/png';
    } else {
      return res.status(400).json({ error: '画像またはURLを指定してください' });
    }

    const userText = [
      '## 参照するガイドライン',
      buildGuidelineText(keys),
      context ? `## 補足情報（対象ユーザー・目的など）\n${context}` : '',
      req.body.url ? `## 対象URL\n${req.body.url}（${req.body.device === 'desktop' ? 'デスクトップ' : 'モバイル'}表示）` : '',
      'この画面をレビューしてください。',
    ].filter(Boolean).join('\n\n');

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image.toString('base64') } },
          { type: 'text', text: userText },
        ],
      }],
    });

    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    res.json({
      result: parseJson(text),
      screenshot: `data:${mediaType};base64,${image.toString('base64')}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'エラーが発生しました' });
  }
});

app.listen(PORT, () => console.log(`UI/UX Design Checker: http://localhost:${PORT}`));
