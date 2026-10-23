// 動きの層と 3D の起動。静止した状態がまず完成していて、script はそこに到着と空間を足す。
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { initRouter } from "./router";
import repos from "../data/repos.json";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const touch = () => matchMedia("(pointer: coarse)").matches;

function smooth() {
  if (reduced() || touch()) return;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function lines() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-lines]")];
  if (!els.length || reduced()) return;
  document.fonts.ready.then(() => {
    els.forEach((el) => {
      const split = SplitText.create(el, { type: "lines", linesClass: "line", aria: "auto", autoSplit: false });
      split.lines.forEach((line, i) => {
        const inner = document.createElement("span");
        inner.style.setProperty("--i", String(i));
        inner.append(...line.childNodes);
        line.append(inner);
      });
      el.classList.add("is-split");
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => {
          el.classList.add("is-in");
          el.querySelector(".line:last-of-type > span")?.addEventListener("transitionend", () => { split.revert(); el.classList.remove("is-split", "is-in"); }, { once: true });
        },
      });
    });
  });
}

function reveals() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (!els.length) return;
  if (reduced() || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
  els.forEach((el) => io.observe(el));
}

function counters() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-count]")];
  if (!els.length) return;
  els.forEach((el) => {
    const target = Number(el.dataset.count || "0");
    if (reduced()) { el.textContent = target.toLocaleString(); return; }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 1.6, ease: "expo.out", onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString(); } }),
    });
  });
}

async function world() {
  const canvas = document.querySelector<HTMLCanvasElement>("#world");
  const gallery = document.querySelector<HTMLElement>("[data-gallery]");
  const tip = document.querySelector<HTMLElement>("#tip");
  if (!canvas || !gallery || !tip) return;
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) { document.documentElement.classList.add("no-webgl"); return; }
  const cards = [...gallery.querySelectorAll<HTMLElement>("[data-work-card]")];
  const count = gallery.querySelector<HTMLElement>("[data-work-count]");
  const works = cards.map((c) => ({ id: c.dataset.id || "", img: c.dataset.img || "" }));
  const base = (document.body.dataset.base || "/") as string;
  try {
    const { startWorld } = await import("./world");
    startWorld({
      canvas, repos, works, base, tip, gallery,
      onWork: (i) => {
        cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
        if (count) count.textContent = i < 0 ? "" : `${i + 1} / ${cards.length}`;
        document.documentElement.classList.toggle("in-gallery", i >= 0);
      },
    });
    document.documentElement.classList.add("has-world");
    // 確認用: ?p=0.4 で作った物の途中へ飛ぶ
    const p = Number(new URLSearchParams(location.search).get("p"));
    if (p > 0) setTimeout(() => scrollTo(0, gallery.offsetTop + p * (gallery.offsetHeight - innerHeight)), 300);
  } catch (err) {
    console.error(err);
    document.documentElement.classList.add("no-webgl");
  }
}

function header() {
  const hd = document.querySelector<HTMLElement>("[data-header]");
  if (!hd) return;
  const set = () => hd.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", set, { passive: true });
  set();
}

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  smooth();
  header();
  lines();
  reveals();
  counters();
  initRouter();
  world();
  addEventListener("load", () => ScrollTrigger.refresh());
}
