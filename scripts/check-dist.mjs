// ビルド結果（dist/）の検査。Node の標準機能だけで動く。
// 1. 内部リンク・画像の参照先が存在するか
// 2. 各 HTML に title / description / viewport があるか
// 3. 作例ページに「架空」の表示が残っているか
// 4. 使わないと決めた言い回し（AI らしい定型句・英語の飾り見出し）が本文に無いか
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const dist = path.join(root, "dist");
const base = "/portfolio/";
const errors = [];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(dist);
const htmls = files.filter((f) => f.endsWith(".html"));
const demo = (f) => f.includes(`${path.sep}demo${path.sep}`);

const banned = [
  "いかがでしたか",
  "伴走",
  "寄り添",
  "シームレス",
  "最適な",
  "ワンストップ",
  "最先端",
  "革新的",
  "What can be built",
  "How it proceeds",
  "Behind the scenes",
  "Case studies",
];

for (const file of htmls) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(dist, file);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: title が無い`);
  if (!/name="viewport"/.test(html)) errors.push(`${rel}: viewport が無い`);
  if (!demo(file) && !/name="description"/.test(html)) errors.push(`${rel}: description が無い`);
  if (demo(file) && !/架空/.test(html)) errors.push(`${rel}: 作例ページに「架空」の表示が無い`);

  if (!demo(file)) {
    const text = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    for (const w of banned) if (text.includes(w)) errors.push(`${rel}: 使わない言い回し「${w}」`);
  }

  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|#|data:|tel:)/.test(ref)) continue;
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    let target;
    if (clean.startsWith(base)) target = path.join(dist, clean.slice(base.length));
    else if (clean.startsWith("/")) { errors.push(`${rel}: base を含まない絶対パス ${ref}`); continue; }
    else target = path.resolve(path.dirname(file), clean);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) errors.push(`${rel}: 参照先が無い ${ref}`);
  }
}

console.log(`HTML ${htmls.length} 枚、ファイル ${files.length} 個を検査`);
if (errors.length) {
  for (const e of errors) console.error("NG " + e);
  process.exit(1);
}
console.log("OK");
