# Ando Portfolio

公開 URL: <https://rikimaru63.github.io/portfolio/>

Astro で作った静的サイト。`main` に push すると GitHub Actions がビルドして GitHub Pages へ出す。

## 構成

| 場所 | 中身 |
|---|---|
| `src/pages/index.astro` | トップ。3D の街（最初の画面）、本物の画面を 3D で順に通る「作った物」、画面を出せない物、全リポジトリ、LINE 振り分けの実演、基盤、連絡 |
| `src/scripts/world.ts` | Three.js r186 の 3D。67 リポジトリの実データを街に（高さ＝コミット、色＝言語、公開は屋根が明るい）、スクロールで通路を進み、本物の画面を貼った 3D スクリーンの前で止まる。bloom、霧、格子の床のシェーダー。スマホは軽い設定 |
| `src/scripts/motion.ts` | 動きの層の起動。GSAP ScrollTrigger / SplitText、Lenis、数字のカウント、3D の起動と WebGL が無い時の退避 |
| `src/data/repos.json` | GitHub の全リポジトリ（名前は公開分のみ、言語・コミット数・作成月）。`docs/実績台帳_2026-10-23.md` の調査で取得 |
| `src/data/works.ts` | 作った物。本物の画面がある物（`public/work/*.jpg`）と、画面を出せない物 |
| `src/components/LineDemo.astro` と `src/scripts/router.ts` | 触れる物。打った文の種類を判定して、承認済みの定型文を選ぶか人へ回す |
| `src/content/cases/*.md` | 事例の詳細。1 件 1 ファイル |
| `docs/実績台帳_2026-10-23.md` | 実績の全数調査（GitHub 67 件、Coolify 15 プロジェクト、公開 URL の生死） |
| `public/demo/` | 架空の業種で作った Web サイトの作例 3 本 |
| `scripts/check-dist.mjs` | ビルド結果の検査（リンク切れ・meta・架空表示・使わない言い回し） |
| `.claude/skills/` | デザイン（taste-skill、impeccable）、文章（humanizer、humanizer-japanese）、Three.js と GSAP の公式スキル |

## デザインの決め方

- 方向は本人が「3D・WebGL の体験型」を選んだ（2026-10-23）。参考は brunosimon.com と tomoyaokada.com。
- 着想は主題から。本人の GitHub の全リポジトリが街になり、本物の画面が 3D のスクリーンになる。数字は全部実測。
- 文章は humanizer と humanizer-japanese の規則で書く。架空の実績・お客様の声は書かない。依頼主の製品は「依頼主の製品」と明記し、載せるかは本人が決める。
- 画面の撮影は `scratchpad/shooter/shoot.mjs`（playwright-core＋Chromium、SwiftShader で WebGL）で、スクロール位置ごとに行う。

## 検査

```sh
npm install
npm run build
npm run check                     # astro check + dist の検査
node .claude/skills/design-taste-frontend/scripts/lint.mjs src
npx astro preview --port 4399 &   # 実ブラウザ検査は URL に対して
CHROME_PATH=/path/to/chrome node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:4399/portfolio/ --out .taste-skill/roundN
```

`inspect.mjs` は 1440 / 768 / 390 で測り、スクリーンショットを `.taste-skill/roundN/` に置く。FAIL が 0 になるまで直す。

## 公開の切り替え（初回だけ）

いままでは `main` の `/docs` を GitHub Pages が直接配信していた。この版からは Actions でビルドするので、リポジトリの設定を 1 回だけ変える。

```sh
GH_TOKEN=$(gh auth token --user rikimaru63) gh api -X PUT repos/rikimaru63/portfolio/pages -f build_type=workflow
```

画面でやるなら Settings → Pages → Build and deployment → Source を「GitHub Actions」にする。

## 公開前に本人が確認する所

- 依頼主の製品の画面を載せてよいか（`src/data/works.ts` の `client: true`: 採用サイト、HERCULiS、DirecTo、スクール HP）
- `src/data/site.ts` の料金の目安・稼働条件（提案値のまま）
- 顔写真か名前を出すか
- `docs/実績台帳_2026-10-23.md` の「本人に確認する物」
