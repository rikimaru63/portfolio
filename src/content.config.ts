import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 事例は 1 件 1 ファイル（src/content/cases/*.md）。
// 新しい事例を足す時はファイルを 1 つ増やすだけで、トップと詳細の両方に出る。
const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cases" }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    frags: z.array(z.string()).default([]),
    order: z.number(),
    period: z.string(),
    client: z.string(),
    oneLine: z.string(),
    scope: z.array(z.string()),
    scale: z.array(z.string()),
    stack: z.array(z.string()),
    own: z.boolean().default(false),
  }),
});

export const collections = { cases };
