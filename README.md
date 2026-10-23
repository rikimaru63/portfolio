# Ando Portfolio

公開 URL: <https://rikimaru63.github.io/portfolio/>

Astro で作った静的サイト。`main` に push すると GitHub Actions がビルドして GitHub Pages へ出す。

## 構成

| 場所 | 中身 |
|---|---|
| `src/pages/index.astro` | トップ（依頼できること・事例・進め方・料金・作例・自己紹介・相談） |
| `src/content/cases/*.md` | 事例。1 件 1 ファイル。ファイルを増やせばトップと詳細ページの両方に出る |
| `src/data/site.ts` | 名前・メール・X・稼働条件・料金の目安。数字を直すのはここだけ |
| `src/pages/cases/[slug].astro` | 事例の詳細ページ |
| `public/demo/` | 架空の業種で作った Web サイトの作例 3 本（手書きの HTML。そのまま配信） |
| `scripts/check-dist.mjs` | ビルド結果の検査（リンク切れ・meta・作例の「架空」表示・使わない言い回し） |

## 方針

- 実績は守秘義務に合わせて匿名化する。クライアント名、認証情報、非公開 URL、売上は載せない。
- 架空の実績を書かない。「作った物」と「稼いだ額」を混ぜない。数字はリポジトリから確かめられる物だけ。
- 事例の挿絵に生成画像を使わない。図が要る時は文字の流れ図（`.flow`）で書く。
- 英語の飾り見出し、均一なカードの格子、AI らしい定型句（検査の `banned` にある語）を使わない。

## 手元での確認

```sh
npm install
npm run dev        # http://localhost:4321/portfolio/
npm run build      # dist/ に出力
npm run check      # 型検査 + dist の検査
```

## 公開の切り替え（初回だけ）

いままでは `main` の `/docs` を GitHub Pages が直接配信していた。この版からは Actions でビルドするので、リポジトリの設定を 1 回だけ変える。

```sh
GH_TOKEN=$(gh auth token --user rikimaru63) gh api -X PUT repos/rikimaru63/portfolio/pages -f build_type=workflow
```

画面でやるなら Settings → Pages → Build and deployment → Source を「GitHub Actions」にする。

## 公開前に本人が確認する所

- `src/data/site.ts` の料金の目安・稼働条件（提案値のまま）
- `src/data/site.ts` の `x`（公開してよい X アカウントがあれば入れる）
- 顔写真か名前を出すか（出すなら `src/pages/index.astro` の自己紹介へ）
