// LINE 振り分けの実演。キーワードの一致数で種類を決め、迷う時は人へ回す（本番の方針と同じ）。
type Rule = { id: string; name: string; words: string[]; reply: string | null };

export function initRouter(root: ParentNode = document) {
  const box = root.querySelector<HTMLElement>("[data-router]");
  if (!box) return;
  const rules: Rule[] = JSON.parse(box.querySelector("[data-router-rules]")?.textContent || "[]");
  const input = box.querySelector<HTMLTextAreaElement>("[data-router-input]")!;
  const result = box.querySelector<HTMLElement>("[data-router-result]")!;
  const verdict = result.querySelector<HTMLElement>(".verdict")!;
  const reply = result.querySelector<HTMLElement>(".reply")!;

  const judge = (text: string) => {
    const t = text.trim();
    if (!t) return { kind: "empty" as const };
    const hits = rules
      .map((r) => ({ r, n: r.words.filter((w) => t.includes(w)).length }))
      .filter((h) => h.n > 0)
      .sort((a, b) => b.n - a.n);
    if (hits.length === 0) return { kind: "unknown" as const };
    if (hits[0].r.reply === null) return { kind: "human" as const, rule: hits[0].r };
    if (hits.length > 1 && hits[1].n === hits[0].n) return { kind: "tie" as const, a: hits[0].r, b: hits[1].r };
    return { kind: "ok" as const, rule: hits[0].r, n: hits[0].n };
  };

  const show = () => {
    const j = judge(input.value);
    result.classList.remove("ok", "human");
    reply.textContent = "";
    if (j.kind === "empty") { verdict.textContent = "何か打ってから判定してください"; return; }
    if (j.kind === "unknown") { result.classList.add("human"); verdict.textContent = "どの種類にも当てはまらない → 何も返さず、人へ回す（Discord に通知）"; return; }
    if (j.kind === "human") { result.classList.add("human"); verdict.textContent = `${j.rule.name} → 定型文なし。何も返さず、人へ回す（Discord に通知）`; return; }
    if (j.kind === "tie") { result.classList.add("human"); verdict.textContent = `${j.a.name}と${j.b.name}の両方に当てはまる → 迷うので人へ回す`; return; }
    result.classList.add("ok");
    verdict.textContent = `${j.rule.name} → 定型文を選んで送る`;
    reply.textContent = j.rule.reply!;
  };

  box.querySelector("[data-router-run]")?.addEventListener("click", show);
  input.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") show(); });
  box.querySelectorAll<HTMLButtonElement>("[data-router-sample]").forEach((b) =>
    b.addEventListener("click", () => { input.value = b.dataset.routerSample || ""; show(); })
  );
}
