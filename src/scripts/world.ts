// 3D の世界。67 のリポジトリ（実データ）を街として浮かべ、スクロールでその中を進むと
// 本物の画面が 3D のスクリーンとして現れる。Three.js r186、GSAP ScrollTrigger。
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Repo = { n: string; l: string; c: number; y: string; p: boolean };

// 言語ごとの色相。明るさと彩度は全部同じにして、どの言語も同じ強さで光らせる
const LANG_HUE: Record<string, number> = {
  Python: 0.47,      // 青緑
  TypeScript: 0.60,  // 青
  JavaScript: 0.12,  // 琥珀
  GDScript: 0.75,    // 紫
  HTML: 0.05,        // 朱
  CSS: 0.90,         // 桃
  Astro: 0.08,       // 橙
  Shell: 0.33,       // 緑
  "-": 0.62,         // 文書: 青灰
};
const hueOf = (l: string) => LANG_HUE[l] ?? LANG_HUE["-"];

export type WorldOptions = {
  canvas: HTMLCanvasElement;
  repos: Repo[];
  works: { id: string; img: string; title: string }[];
  base: string;
  tip: HTMLElement;
  gallery: HTMLElement;
  onWork: (i: number) => void;
};

export function startWorld(o: WorldOptions) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const small = Math.min(innerWidth, innerHeight) < 700;

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f1a);
  scene.fog = new THREE.FogExp2(0x0b0f1a, 0.009);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 400);

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x141a2a, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(18, 30, 10);
  scene.add(key);

  // ---------- floor: a faint grid that fades out ----------
  const floorMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x4a6fb5) }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vPos;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vPos = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime; varying vec3 vPos;
      void main(){
        vec2 g = abs(fract(vPos.xz * 0.5 - 0.5) - 0.5) / fwidth(vPos.xz * 0.5);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        float d = length(vPos.xz);
        float fade = smoothstep(90.0, 10.0, d);
        float pulse = 0.5 + 0.5 * sin(uTime * 0.6 - d * 0.12);
        gl_FragColor = vec4(uColor, line * fade * (0.10 + 0.05 * pulse));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  // ---------- city: one instanced mesh for 67 repos ----------
  const repos = o.repos;
  const n = repos.length;
  const cols = Math.ceil(Math.sqrt(n * 1.4));
  const gap = 2.6;
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0); // grow from the floor
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.08 });
  const city = new THREE.InstancedMesh(box, bodyMat, n);
  const roofMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const roofGeo = new THREE.BoxGeometry(1, 0.06, 1);
  const roofs = new THREE.InstancedMesh(roofGeo, roofMat, n);
  const place = new THREE.Object3D();
  const heights: number[] = [];
  const maxC = Math.max(...repos.map((r) => r.c));
  const color = new THREE.Color();
  const cityGroup = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const r = repos[i];
    // 螺旋に並べる: コミットの多い物ほど中心に
    const t = i * 2.399963; // golden angle
    const rad = 1.4 + Math.sqrt(i) * gap * 0.62;
    const x = Math.cos(t) * rad;
    const z = Math.sin(t) * rad;
    const h = 0.6 + (Math.log1p(r.c) / Math.log1p(maxC)) * 11;
    heights.push(h);
    const w = 1 + Math.min(1.2, r.c / 400) * 0.6;
    place.position.set(x, 0, z);
    place.scale.set(w, h, w);
    place.rotation.set(0, 0, 0);
    place.updateMatrix();
    city.setMatrixAt(i, place.matrix);
    const sat = r.l === "-" ? 0.12 : 0.45;
    color.setHSL(hueOf(r.l), sat, 0.42);
    city.setColorAt(i, color.clone());
    place.position.set(x, h, z);
    place.scale.set(w, 1, w);
    place.updateMatrix();
    roofs.setMatrixAt(i, place.matrix);
    // 公開リポの屋根は、その言語の色のまま光る（白飛びさせない）
    color.setHSL(hueOf(r.l), r.l === "-" ? 0.15 : 0.8, r.p ? 0.58 : 0.5);
    roofs.setColorAt(i, color.clone().multiplyScalar(r.p ? 1.35 : 0.9));
  }
  city.instanceMatrix.needsUpdate = true;
  roofs.instanceMatrix.needsUpdate = true;
  if (city.instanceColor) city.instanceColor.needsUpdate = true;
  if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;
  cityGroup.add(city, roofs);
  cityGroup.visible = false; // 街はやめた。依頼主が知りたいのは作った物なので、最初から画面を見せる
  void cols;

  // ---------- screens: the real screenshots ----------
  const screens: THREE.Mesh[] = [];
  const frames: THREE.Mesh[] = [];
  const loader = new THREE.TextureLoader();
  const screenGeo = new THREE.PlaneGeometry(16, 10);
  const frameGeo = new THREE.PlaneGeometry(16.5, 10.5);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x8fb4ff, toneMapped: false, transparent: true, opacity: 0.5 });
  const path: { pos: THREE.Vector3; look: THREE.Vector3 }[] = [];
  o.works.forEach((w, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x1a2236 });
    const m = new THREE.Mesh(screenGeo, mat);
    const side = i % 2 === 0 ? 1 : -1;
    const z = -40 - i * 30;
    const x = side * 11;
    const y = 7 + Math.sin(i * 0.9) * 1.5;
    m.position.set(x, y, z);
    m.rotation.y = side * -0.5;
    const f = new THREE.Mesh(frameGeo, frameMat);
    f.position.copy(m.position);
    f.rotation.copy(m.rotation);
    f.position.add(new THREE.Vector3(Math.sin(-m.rotation.y) * 0.08, 0, -Math.cos(m.rotation.y) * 0.08));
    scene.add(f, m);
    screens.push(m);
    frames.push(f);
    // the camera stops in front of each screen, offset to the other side
    const pos = new THREE.Vector3(-side * 1.5, 7.5, z + 19);
    path.push({ pos, look: m.position.clone() });
    loader.load(`${o.base}work/${w.img}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      mat.map = tex;
      mat.color.set(0xd6d6d6);
      mat.needsUpdate = true;
    });
  });

  // ---------- post ----------
  let composer: EffectComposer | null = null;
  if (!small) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.38, 0.55, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // ---------- camera: hero orbit → gallery path ----------
  const heroPos = new THREE.Vector3(-7, 9, 0);
  const heroLook = new THREE.Vector3(7, 6.5, -70);
  const camPos = heroPos.clone();
  const camLook = heroLook.clone();
  const targetPos = heroPos.clone();
  const targetLook = heroLook.clone();
  let progress = 0; // 0 = hero, 1 = last screen
  let heroT = 1; // 1 = in hero, 0 = fully in gallery
  const mouse = new THREE.Vector2(0, 0);
  let currentWork = -1;

  const curve = new THREE.CatmullRomCurve3([heroPos.clone(), ...path.map((p) => p.pos)], false, "centripetal", 0.6);
  const lookCurve = new THREE.CatmullRomCurve3([heroLook.clone(), ...path.map((p) => p.look)], false, "centripetal", 0.6);

  const setProgress = (p: number) => {
    progress = p;
    const u = Math.min(1, Math.max(0, p));
    if (u <= 0) { heroT = 1; targetPos.copy(heroPos); targetLook.copy(heroLook); }
    else {
      heroT = 0;
      curve.getPointAt(u, targetPos);
      lookCurve.getPointAt(u, targetLook);
    }
    // 今どの画面の前にいるか: カメラの目標位置に最も近い停止点
    let i = -1;
    if (u > 0.02) {
      let best = Infinity;
      path.forEach((p, k) => { const d = Math.abs(p.pos.z - targetPos.z); if (d < best) { best = d; i = k; } });
    }
    if (i !== currentWork) { currentWork = i; o.onWork(i); }
  };

  ScrollTrigger.create({
    trigger: o.gallery,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => setProgress(self.progress),
    onLeaveBack: () => setProgress(0),
  });

  // ---------- hover on the city ----------
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-2, -2);
  let hovered = -1;
  const onMove = (e: PointerEvent) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    mouse.set(pointer.x, pointer.y);
    if (heroT < 1) return;
    o.tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
  };
  if (!coarse) addEventListener("pointermove", onMove, { passive: true });

  document.addEventListener("pointerleave", () => { pointer.set(-2, -2); hovered = -1; o.tip.hidden = true; });
  const pick = () => {
    if (heroT < 1 || coarse || scrollY > innerHeight * 0.4) { if (hovered >= 0 || !o.tip.hidden) { hovered = -1; o.tip.hidden = true; } return; }
    if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) { if (hovered >= 0 || !o.tip.hidden) { hovered = -1; o.tip.hidden = true; } return; }
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(screens, false)[0];
    const id = hit ? screens.indexOf(hit.object as THREE.Mesh) : -1;
    if (id === hovered) return;
    hovered = id;
    if (id < 0) { o.tip.hidden = true; return; }
    o.tip.innerHTML = `<b>${o.works[id].title}</b><span>スクロールで近づく</span>`;
    o.tip.hidden = false;
  };

  // ---------- loop ----------
  const timer = new THREE.Timer();
  timer.connect(document);
  const tmp = new THREE.Vector3();
  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(o.canvas);

  renderer.setAnimationLoop(() => {
    timer.update();
    const t = timer.getElapsed();
    const dt = Math.min(0.05, timer.getDelta());
    if (!visible && heroT < 1) return;
    floorMat.uniforms.uTime.value = t;
    if (scrollY < 2 && heroT < 1) setProgress(0); // 先頭へ戻ったのに視点が残る事故を防ぐ
    // hero: slow orbit + mouse parallax
    if (heroT === 1 && !reduced) {
      targetPos.set(-7 + Math.sin(t * 0.25) * 0.8 + mouse.x * 1.5, 9 + Math.sin(t * 0.18) * 0.4 + mouse.y * 1, 0);
      targetLook.set(7 + mouse.x * 4, 6.5 + mouse.y * 2.5, -70);
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    camPos.lerp(targetPos, k);
    camLook.lerp(targetLook, k);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    // the city breathes a little
    cityGroup.rotation.y = reduced ? 0 : Math.sin(t * 0.08) * 0.03;
    // screens look slightly at the camera as you pass
    screens.forEach((m, i) => {
      tmp.copy(camera.position).sub(m.position);
      const side = i % 2 === 0 ? -1 : 1;
      const want = side * -0.5 + THREE.MathUtils.clamp(tmp.x / 60, -0.25, 0.25);
      m.rotation.y += (want - m.rotation.y) * 0.05;
      frames[i].rotation.y = m.rotation.y;
    });
    pick();
    if (composer) composer.render(); else renderer.render(scene, camera);
  });

  const resize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    composer?.setSize(innerWidth, innerHeight);
  };
  addEventListener("resize", resize);
  setProgress(0);
  return { setProgress };
}
