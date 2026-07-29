import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const docsRoot = path.join(repoRoot, "docs");
const demoPages = new Set([
  "docs/cafe/index.html",
  "docs/gym/index.html",
  "docs/seitai/index.html",
]);
const mobileMenuPhonePages = new Set([
  "docs/cafe/index.html",
  "docs/seitai/index.html",
]);

const errors = [];
let checkedLocalReferences = 0;
let checkedImages = 0;

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRepo(filePath) {
  return toPosix(path.relative(repoRoot, filePath));
}

function lineNumber(source, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) line += 1;
  }
  return line;
}

function report(document, index, message) {
  errors.push({
    file: document.relativePath,
    line: lineNumber(document.source, Math.max(0, index)),
    message,
  });
}

function maskComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, (comment) =>
    comment.replace(/[^\n]/g, " ")
  );
}

function collectTags(source) {
  const tags = [];
  const tagPattern = /<([a-z][a-z0-9:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  let match;

  while ((match = tagPattern.exec(source)) !== null) {
    tags.push({
      name: match[1].toLowerCase(),
      raw: match[0],
      index: match.index,
    });
  }

  return tags;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function attributeValue(tag, name) {
  const escapedName = escapeRegExp(name);
  const pattern = new RegExp(
    `\\s${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`,
    "i"
  );
  const match = tag.raw.match(pattern);
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? "";
}

function hasAttribute(tag, name) {
  const escapedName = escapeRegExp(name);
  return new RegExp(`\\s${escapedName}(?:\\s|=|/?>)`, "i").test(tag.raw);
}

function walkHtml(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtml(absolutePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function isExternalReference(value) {
  return (
    /^\/\//.test(value) ||
    /^(?:https?|mailto|tel|sms|facetime|geo|data|blob):/i.test(value)
  );
}

function splitReference(value) {
  const hashIndex = value.indexOf("#");
  const beforeHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : value.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf("?");

  return {
    pathname: queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex),
    hash,
  };
}

function resolveLocalReference(documentPath, value) {
  const { pathname, hash } = splitReference(value);
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return { error: `URLをデコードできません: ${value}` };
  }

  let targetPath;
  if (!decodedPath) {
    targetPath = documentPath;
  } else if (decodedPath.startsWith("/")) {
    targetPath = path.resolve(docsRoot, decodedPath.replace(/^\/+/, ""));
  } else {
    targetPath = path.resolve(path.dirname(documentPath), decodedPath);
  }

  const relativeTarget = path.relative(repoRoot, targetPath);
  if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
    return { error: `リポジトリ外を参照しています: ${value}` };
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    targetPath = path.join(targetPath, "index.html");
  }

  return { targetPath, hash };
}

function decodeHash(hash) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function imageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();

  if (
    extension === ".png" &&
    buffer.length >= 24 &&
    buffer.toString("ascii", 1, 4) === "PNG"
  ) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (
    extension === ".gif" &&
    buffer.length >= 10 &&
    buffer.toString("ascii", 0, 3) === "GIF"
  ) {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (
    extension === ".webp" &&
    buffer.length >= 30 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
    if (chunk === "VP8L" && buffer[20] === 0x2f) {
      const bits = buffer.readUInt32LE(21);
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      };
    }
    if (chunk === "VP8 " && buffer.length >= 30) {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
          marker
        )
      ) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  }

  return null;
}

const documents = walkHtml(docsRoot).map((absolutePath) => {
  const source = fs.readFileSync(absolutePath, "utf8");
  const maskedSource = maskComments(source);
  const tags = collectTags(maskedSource);
  const ids = new Map();

  return {
    absolutePath,
    relativePath: relativeToRepo(absolutePath),
    source,
    maskedSource,
    tags,
    ids,
  };
});

const documentsByPath = new Map(
  documents.map((document) => [path.normalize(document.absolutePath), document])
);

for (const document of documents) {
  for (const tag of document.tags) {
    const id = attributeValue(tag, "id");
    if (id === null) continue;

    if (document.ids.has(id)) {
      report(
        document,
        tag.index,
        `id="${id}" が重複しています（最初の定義: ${document.ids.get(id)}行）`
      );
    } else {
      document.ids.set(id, lineNumber(document.source, tag.index));
    }
  }
}

function validateLocalReference(document, tag, attribute, value) {
  if (!value) {
    report(document, tag.index, `${attribute} が空です`);
    return null;
  }

  if (/^javascript:/i.test(value)) {
    report(document, tag.index, `javascript: URLは禁止です: ${value}`);
    return null;
  }

  if (isExternalReference(value)) return null;

  if (value === "#") {
    report(document, tag.index, 'href="#" は移動先が不明です');
    return null;
  }

  const resolved = resolveLocalReference(document.absolutePath, value);
  if (resolved.error) {
    report(document, tag.index, resolved.error);
    return null;
  }

  checkedLocalReferences += 1;

  if (!fs.existsSync(resolved.targetPath)) {
    report(
      document,
      tag.index,
      `ローカル参照先が見つかりません: ${value} → ${relativeToRepo(resolved.targetPath)}`
    );
    return null;
  }

  if (resolved.hash) {
    const targetDocument = documentsByPath.get(path.normalize(resolved.targetPath));
    if (!targetDocument) {
      report(document, tag.index, `HTML以外の参照先に #${resolved.hash} が付いています`);
    } else {
      const decoded = decodeHash(resolved.hash);
      if (!targetDocument.ids.has(decoded)) {
        report(
          document,
          tag.index,
          `リンク先の id="#${decoded}" が見つかりません: ${value}`
        );
      }
    }
  }

  return resolved.targetPath;
}

for (const document of documents) {
  const mainTags = document.tags.filter((tag) => tag.name === "main");
  if (mainTags.length !== 1) {
    report(document, 0, `<main> は1つ必要です（検出: ${mainTags.length}）`);
  }

  const h1Tags = document.tags.filter((tag) => tag.name === "h1");
  if (h1Tags.length !== 1) {
    report(document, 0, `<h1> は1つ必要です（検出: ${h1Tags.length}）`);
  }

  const hasSkipLink = document.tags.some((tag) => {
    if (tag.name !== "a") return false;
    const className = attributeValue(tag, "class") ?? "";
    return className.includes("skip-link") && attributeValue(tag, "href") === "#main-content";
  });
  if (!hasSkipLink) {
    report(document, 0, "本文へのスキップリンクがありません");
  }

  if (!document.maskedSource.includes(":focus-visible")) {
    report(document, 0, "focus-visible の表示規則がありません");
  }
  if (!document.maskedSource.includes("prefers-reduced-motion: reduce")) {
    report(document, 0, "prefers-reduced-motion への対応がありません");
  }
  if (!document.maskedSource.includes("scroll-margin-top")) {
    report(document, 0, "アンカー見出し用の scroll-margin-top がありません");
  }

  for (const tag of document.tags) {
    const href = attributeValue(tag, "href");
    if (href !== null && (tag.name === "a" || tag.name === "link")) {
      validateLocalReference(document, tag, "href", href.trim());
    }

    const src = attributeValue(tag, "src");
    let localImagePath = null;
    if (src !== null) {
      localImagePath = validateLocalReference(document, tag, "src", src.trim());
    }

    if (tag.name !== "img") continue;
    checkedImages += 1;

    if (attributeValue(tag, "alt") === null) {
      report(document, tag.index, "画像に alt 属性がありません");
    }

    if (src === null || !src.trim()) {
      report(document, tag.index, "画像に src 属性がありません");
      continue;
    }

    if (!localImagePath) continue;

    const widthValue = attributeValue(tag, "width");
    const heightValue = attributeValue(tag, "height");
    const width = Number(widthValue);
    const height = Number(heightValue);

    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      report(document, tag.index, "ローカル画像には正の整数の width / height が必要です");
      continue;
    }

    const dimensions = imageDimensions(localImagePath);
    if (dimensions && (dimensions.width !== width || dimensions.height !== height)) {
      report(
        document,
        tag.index,
        `画像寸法が実ファイルと一致しません: 宣言 ${width}x${height}, 実体 ${dimensions.width}x${dimensions.height}`
      );
    }

    const loading = attributeValue(tag, "loading");
    if (!["lazy", "eager"].includes(loading ?? "")) {
      report(document, tag.index, 'ローカル画像には loading="lazy" または "eager" が必要です');
    }
  }

  const cssUrlPattern = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)"'\s]+))\s*\)/gi;
  let cssUrlMatch;
  while ((cssUrlMatch = cssUrlPattern.exec(document.maskedSource)) !== null) {
    const value = cssUrlMatch[1] ?? cssUrlMatch[2] ?? cssUrlMatch[3] ?? "";
    if (!value || value.startsWith("#") || isExternalReference(value)) continue;
    const pseudoTag = { raw: `<style url="${value}">`, index: cssUrlMatch.index };
    validateLocalReference(document, pseudoTag, "CSS url", value);
  }

  const inlineScriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = inlineScriptPattern.exec(document.source)) !== null) {
    const openingTag = { raw: `<script${scriptMatch[1]}>`, index: scriptMatch.index };
    if (attributeValue(openingTag, "src") !== null) continue;
    const type = (attributeValue(openingTag, "type") ?? "").toLowerCase();
    if (type && !["text/javascript", "application/javascript"].includes(type)) continue;

    try {
      new vm.Script(scriptMatch[2], { filename: document.relativePath });
    } catch (error) {
      report(
        document,
        scriptMatch.index,
        `インラインJavaScriptの構文エラー: ${String(error.message).split("\n")[0]}`
      );
    }
  }

  if (!demoPages.has(document.relativePath)) continue;

  const titleTag = document.tags.find((tag) => tag.name === "title");
  const titleStart = titleTag?.index ?? 0;
  const titleSlice = document.source.slice(titleStart, titleStart + 180);
  if (!titleSlice.includes("架空デモ")) {
    report(document, titleStart, "<title> に架空デモの表示がありません");
  }

  const robotsMeta = document.tags.find(
    (tag) =>
      tag.name === "meta" &&
      (attributeValue(tag, "name") ?? "").toLowerCase() === "robots"
  );
  if (!robotsMeta || !(attributeValue(robotsMeta, "content") ?? "").includes("noindex")) {
    report(document, 0, 'デモページには robots="noindex" が必要です');
  }

  const noticeTag = document.tags.find(
    (tag) => tag.name === "aside" && attributeValue(tag, "id") === "demo-notice"
  );
  const firstHeader = document.tags.find((tag) => tag.name === "header");
  const firstMain = document.tags.find((tag) => tag.name === "main");
  if (!noticeTag || !document.source.includes("架空のデモサイト")) {
    report(document, 0, "最初に見える「架空のデモサイト」表示がありません");
  } else if (
    (firstHeader && noticeTag.index > firstHeader.index) ||
    (firstMain && noticeTag.index > firstMain.index)
  ) {
    report(document, noticeTag.index, "デモ表示はヘッダーと本文より前に置く必要があります");
  }

  const returnLink = document.tags.find(
    (tag) => tag.name === "a" && hasAttribute(tag, "data-demo-return")
  );
  if (!returnLink || attributeValue(returnLink, "href") !== "../#demos") {
    report(document, 0, "ポートフォリオのWeb作例一覧へ戻るリンクがありません");
  }

  if (
    mobileMenuPhonePages.has(document.relativePath) &&
    !document.tags.some(
      (tag) =>
        tag.name === "a" &&
        hasAttribute(tag, "data-demo-safe-link") &&
        (attributeValue(tag, "aria-label") ?? "").includes("架空の電話番号") &&
        (attributeValue(tag, "class") ?? "").split(/\s+/).includes("mobile-nav-link")
    )
  ) {
    report(document, 0, "モバイルメニューの架空電話リンクに閉鎖処理用classがありません");
  }

  const dangerousScheme = /^(?:tel|mailto|sms|facetime|geo|javascript):/i;
  const socialHost =
    /(?:instagram\.com|line\.me|twitter\.com|x\.com|facebook\.com|wa\.me|whatsapp\.com)/i;
  for (const anchor of document.tags.filter((tag) => tag.name === "a")) {
    const href = (attributeValue(anchor, "href") ?? "").trim();
    if (dangerousScheme.test(href) || socialHost.test(href)) {
      report(document, anchor.index, `架空の連絡・SNSリンクが外部行動につながります: ${href}`);
    }
  }

  for (const form of document.tags.filter((tag) => tag.name === "form")) {
    if (attributeValue(form, "data-demo-form") !== "non-submitting") {
      report(document, form.index, "デモフォームに non-submitting 宣言がありません");
    }
    if (attributeValue(form, "action") !== null) {
      report(document, form.index, "デモフォームに action を設定しないでください");
    }
  }

  for (const iframe of document.tags.filter((tag) => tag.name === "iframe")) {
    const src = attributeValue(iframe, "src") ?? "";
    if (!isExternalReference(src)) continue;
    const style = attributeValue(iframe, "style") ?? "";
    if (
      !hasAttribute(iframe, "data-demo-inert") ||
      attributeValue(iframe, "tabindex") !== "-1" ||
      !/pointer-events\s*:\s*none/i.test(style)
    ) {
      report(document, iframe.index, "外部iframeは操作不能であることを明示してください");
    }
  }
}

if (errors.length > 0) {
  console.error(`Static site check failed (${errors.length}件)`);
  for (const error of errors) {
    console.error(`${error.file}:${error.line} - ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Static site check passed: HTML ${documents.length}件 / ローカル参照 ${checkedLocalReferences}件 / 画像 ${checkedImages}件 / 架空デモ ${demoPages.size}件`
  );
}
