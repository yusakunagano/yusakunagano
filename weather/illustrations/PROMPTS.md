# 服装イラスト 生成プロンプト集

天気アプリの服装カードで使うイラストを、画像生成AI(ChatGPT など)で作るためのプロンプトです。

## 作る画像(全16枚)

| ファイル名 | 内容 |
|---|---|
| `f1.png` 〜 `f7.png` | 女性 7段階 |
| `m1.png` 〜 `m7.png` | 男性 7段階 |
| `umbrella-long.png` | 長傘(アイテム画像) |
| `umbrella-fold.png` | 折りたたみ傘(アイテム画像) |

傘は人物に持たせず、別のアイテム画像としてカードの横に並べます(ファッション誌のアイテム紹介のような見せ方です)。こうすると、人物の画像は14枚で済みます。

## 進め方のコツ

1. **女性は女性、男性は男性で、それぞれ1つのチャットにまとめて** 生成してください。同じチャットで続けると、顔や画風がそろいやすくなります。
2. 最初に「共通スタイル」と1枚目のプロンプトを一緒に送ります。
3. 2枚目からは、各プロンプトの頭に「**同じ人物、同じ画風、同じポーズ、同じ構図で。**」と付けて送ります。
4. 顔や画風が変わってしまったら、1枚目の画像を添付して「この人物と画風に合わせて」と伝えると戻りやすくなります。
5. できた画像はファイル名を付けて保存し、このチャットに貼ってください。

---

## 共通スタイル(最初の1枚目と一緒に送る)

```
Fashion magazine style hand-drawn illustration, elegant and sophisticated adult fashion illustration.
Soft pencil line art with light watercolor and gouache coloring, subtle paper texture, muted natural palette.
Slender, realistic proportions (about 8 heads tall), relaxed natural standing pose, walking slightly, one hand relaxed.
Full body from head to shoes, centered, facing slightly to the left, the figure fills about 90% of the height.
Calm, gentle facial expression with simple, refined facial features.
Transparent background (PNG), no background objects, no shadow on the ground, no text, no logo, no watermark.
Portrait orientation, aspect ratio 2:3.
Do not imitate any specific living artist's style.
```

---

## 女性(f1〜f7)

人物設定(全枚共通で入れる):
```
A Japanese woman in her late 20s, shoulder-length dark brown hair tied in a low ponytail, natural makeup.
```

**f1 真夏(27°以上)**
```
Outfit: a light, flowy sleeveless midi dress in soft sage green, flat leather sandals, a small straw bag. Summer, airy feeling.
```

**f2 半袖(22〜27°)**
```
Outfit: a short-sleeved white cotton blouse tucked into a navy pleated midi skirt, white sneakers.
```

**f3 長袖1枚(18〜22°)**
```
Outfit: a long-sleeved ivory blouse, a dark green pleated midi skirt, simple black flat shoes.
```

**f4 薄着にカーディガン(15〜18°)**
```
Outfit: a long-sleeved white top with a light lavender knit cardigan worn open, a navy midi skirt, loafers.
```

**f5 ジャケット(11〜15°)**
```
Outfit: a beige cotton trench coat worn open over a thin black knit top, wide straight beige trousers, black loafers.
```

**f6 コートとマフラー(6〜11°)**
```
Outfit: a long camel wool coat, a mustard yellow wool scarf, a grey knit sweater, a dark navy midi skirt, black tights, short black boots.
```

**f7 ダウン(6°未満)**
```
Outfit: a long off-white puffer down coat, a thick knitted red scarf, red knitted gloves, black wide trousers, warm short boots. Winter, cozy feeling.
```

---

## 男性(m1〜m7)

人物設定(全枚共通で入れる):
```
A Japanese man in his late 20s, short neat black hair, clean-shaven, slim build.
```

**m1 真夏(27°以上)**
```
Outfit: a loose white short-sleeved T-shirt, beige knee-length chino shorts, simple leather sandals. Summer, airy feeling.
```

**m2 半袖(22〜27°)**
```
Outfit: a light blue short-sleeved linen shirt, beige chino trousers, white sneakers.
```

**m3 長袖1枚(18〜22°)**
```
Outfit: a long-sleeved light blue oxford button-down shirt, navy slim trousers, brown loafers.
```

**m4 薄着にカーディガン(15〜18°)**
```
Outfit: a white long-sleeved T-shirt with a light grey knit cardigan worn open, navy chino trousers, white sneakers.
```

**m5 ジャケット(11〜15°)**
```
Outfit: a charcoal grey unstructured jacket over a navy crewneck sweater, dark grey trousers, brown leather shoes.
```

**m6 コートとマフラー(6〜11°)**
```
Outfit: a long navy wool chesterfield coat, a mustard yellow wool scarf, a grey knit sweater, charcoal trousers, black leather shoes.
```

**m7 ダウン(6°未満)**
```
Outfit: a dark navy puffer down jacket, a thick knitted red scarf, red knitted gloves, black trousers, warm boots. Winter, cozy feeling.
```

---

## 傘(アイテム画像・2枚)

人物とは別のチャットでかまいません。

**umbrella-long.png 長傘**
```
Fashion magazine style hand-drawn item illustration, soft pencil line art with light watercolor coloring, subtle paper texture.
A single closed long umbrella in dusty blue with a curved wooden handle, standing upright, slightly tilted.
Transparent background (PNG), no shadow, no text, no logo, no watermark. Portrait orientation, aspect ratio 1:2.
```

**umbrella-fold.png 折りたたみ傘**
```
Fashion magazine style hand-drawn item illustration, soft pencil line art with light watercolor coloring, subtle paper texture.
A single compact folding umbrella in dusty blue, folded and closed inside its matching sleeve case, short straight handle.
Transparent background (PNG), no shadow, no text, no logo, no watermark. Square, aspect ratio 1:1.
```

---

## うまくいかないとき

- **背景が透明にならない**:「背景を透明にしたPNGで出力して」と追加で送ってください。どうしても無理な場合は、白い背景のままでかまいません(アプリ側で目立たないように調整します)。
- **全身が入らない**:「頭から靴まで全身が入るように、少し引きで」と伝えてください。
- **アニメ風になる**:「アニメ調ではなく、ファッション誌の手描きイラスト風で」と伝えてください。
