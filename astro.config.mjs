// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// GitHub Pages（rikimaru63.github.io/portfolio/）に置く前提。
// 独自ドメインへ移す時は site と base の 2 行だけ変える。
export default defineConfig({
  site: "https://rikimaru63.github.io",
  base: "/portfolio",
  trailingSlash: "always",
  integrations: [sitemap()],
  build: { format: "directory" },
});
