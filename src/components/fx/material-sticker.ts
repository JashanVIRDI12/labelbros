"use client";

import {
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { gsap } from "@/lib/gsap";
import { configureSurface, materialStudio, patchSurface, SURFACE_COLOUR } from "./material-surface";

/*
 * One sticker, close up, on its backing paper: the material lab's 3D (MaterialLab.tsx). It is a
 * thin film (not a card) with its top corner peeled up, showing the white adhesive side and
 * throwing a soft shadow on the glossy liner, which has its maker's name printed faintly across
 * it, as liners do. The material is the point: brushed silver and gold foil with stretched
 * highlights, holographic film whose rainbow slides as it turns, glitter facets that catch the
 * light, paper and kraft fibres, clear film you can see the liner through, gloss film with a
 * laminate shine; the ink sits on top of the foil, not in it. A dark studio with bright softboxes
 * lights it (metal needs something to reflect), and the studio turns with the pointer (slowly on
 * its own otherwise), so the highlights sweep across. Hover lifts the corner further; drag it to
 * peel; let go and it slaps back. A new material is laid down like a fresh sticker.
 */

export type Substrate = "white" | "clear" | "paper" | "kraft" | "silver" | "gold" | "holo" | "glitter";

const W = 3.4; // the sticker, in inches
const H = 2.1;
const R = 0.22;
const PAD = 0.42; // the backing paper round it
const SX = 100;
const SY = 62;
const CURL = 0.1; // radius the peeled film turns round
const TURN = 2.75; // how far it turns before running straight
const REST = 0.52; // how far the corner is lifted when nobody touches it
const IW = 1536; // the print's resolution
const IH = Math.round((IW * H) / W);
const TILT = 0.66; // the camera's angle from overhead

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
function cnv(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/* ---------------------------------------------------------------- surface relief */

/** Smooth value noise on an n × n tile that wraps. */
function valueNoise(n: number, cells: number, seed = 1) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const g = new Float32Array(cells * cells).map(() => rnd());
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const fx = (x / n) * cells;
      const fy = (y / n) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const at = (i: number, j: number) => g[((j + cells) % cells) * cells + ((i + cells) % cells)];
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      out[y * n + x] = a + (b - a) * sy;
    }
  return out;
}

/** Paper fibres as heights. */
function fibreHeights(n: number, count: number, alpha: number) {
  const c = cnv(n, n);
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = "rgb(128,128,128)";
  g.fillRect(0, 0, n, n);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * n;
    const y = Math.random() * n;
    const a = Math.random() * Math.PI;
    const l = 3 + Math.random() * 12;
    const v = Math.random() < 0.5 ? 40 : 220;
    g.strokeStyle = `rgba(${v},${v},${v},${alpha * (0.4 + Math.random() * 0.6)})`;
    g.lineWidth = 0.6 + Math.random() * 1.1;
    for (const [ox, oy] of [[0, 0], [n, 0], [-n, 0], [0, n], [0, -n]]) {
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
      g.stroke();
    }
  }
  const d = g.getImageData(0, 0, n, n).data;
  const out = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) out[i] = d[i * 4] / 255;
  return out;
}

function normalTexture(h: Float32Array, n: number, strength: number, repeat: [number, number]) {
  const c = cnv(n, n);
  const g = c.getContext("2d")!;
  const img = g.createImageData(n, n);
  const at = (x: number, y: number) => h[((y + n) % n) * n + ((x + n) % n)];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * n + x) * 4;
      img.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}

/* ---------------------------------------------------------------- the print */

const BASE: Record<Substrate, [number, number, number]> = {
  white: [250, 249, 246],
  paper: [246, 242, 233],
  kraft: [190, 145, 96],
  clear: [255, 255, 255],
  ...SURFACE_COLOUR,
};
const METAL = new Set<Substrate>(["silver", "gold", "holo", "glitter"]);

/** The artwork: YOUR BRAND, a yellow rule and the material's name, in ink. */
function inkCanvas(line: string) {
  const c = cnv(IW, IH);
  const g = c.getContext("2d")!;
  const ink = "#121110";
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim() || "Arial";
  g.strokeStyle = ink;
  g.lineWidth = 9;
  rr(g, 70, 70, IW - 140, IH - 140, 92);
  g.stroke();
  g.lineWidth = 3.5;
  rr(g, 98, 98, IW - 196, IH - 196, 70);
  g.stroke();
  g.fillStyle = ink;
  g.textAlign = "center";
  g.font = `900 ${Math.round(IH * 0.25)}px ${sans}, Arial, sans-serif`;
  if ("fontStretch" in g) (g as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "expanded";
  g.fillText("YOUR BRAND", IW / 2, IH * 0.55, IW * 0.78);
  g.fillStyle = "#ffd21f";
  g.fillRect(IW / 2 - 110, IH * 0.62, 220, 16);
  g.fillStyle = ink;
  g.font = `700 ${Math.round(IH * 0.058)}px ${sans}, Arial, sans-serif`;
  if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "10px";
  g.fillText(line.toUpperCase(), IW / 2, IH * 0.77);
  return g.getImageData(0, 0, IW, IH).data;
}

/** The sticker's colour (shape in alpha) and its mask map: R film/foil, G roughness, B metal. */
/** Gives the browser a turn (input, the next frame) before carrying on. */
const breathe = () => new Promise<void>((done) => setTimeout(done, 0));

async function printMaps(look: Substrate, ink: Uint8ClampedArray, fibre: Float32Array, fn: number) {
  const shape = cnv(IW, IH).getContext("2d", { willReadFrequently: true })!;
  shape.fillStyle = "#fff";
  rr(shape, 0, 0, IW, IH, (R / W) * IW);
  shape.fill();
  const sa = shape.getImageData(0, 0, IW, IH).data;
  const col = new ImageData(IW, IH);
  const msk = new ImageData(IW, IH);
  const c = col.data;
  const m = msk.data;
  const [br, bg, bb] = BASE[look];
  const metal = METAL.has(look);
  let slice = performance.now();
  for (let y = 0; y < IH; y++) {
    // never more than a few milliseconds without letting the page draw and answer input
    if (performance.now() - slice > 6) {
      await breathe();
      slice = performance.now();
    }
    for (let x = 0; x < IW; x++) {
      const i = (y * IW + x) * 4;
      const a = sa[i + 3];
      if (!a) continue;
      const k = ink[i + 3] / 255;
      let r = br;
      let g = bg;
      let b = bb;
      if (look === "kraft" || look === "paper") {
        const f = 1 + (fibre[(y % fn) * fn + (x % fn)] - 0.5) * (look === "kraft" ? 0.32 : 0.08);
        r *= f;
        g *= f;
        b *= f;
      }
      // ink: printed over the material (on kraft it soaks in, multiplying)
      if (look === "kraft") {
        r = r * (1 - k) + ((r * ink[i]) / 255) * k;
        g = g * (1 - k) + ((g * ink[i + 1]) / 255) * k;
        b = b * (1 - k) + ((b * ink[i + 2]) / 255) * k;
      } else {
        r = r * (1 - k) + ink[i] * k;
        g = g * (1 - k) + ink[i + 1] * k;
        b = b * (1 - k) + ink[i + 2] * k;
      }
      c[i] = r;
      c[i + 1] = g;
      c[i + 2] = b;
      c[i + 3] = a;
      const show = 1 - k;
      const rough = look === "holo" ? 0.23 : look === "glitter" ? 0.3 : metal ? 0.26 : 0.5;
      m[i] = 255 * show;
      m[i + 1] = 255 * clamp(rough * show + 0.5 * k, 0, 1);
      m[i + 2] = metal ? 255 * show : 0;
      m[i + 3] = 255;
    }
  }
  const toTex = (d: ImageData, srgb: boolean) => {
    const cv = cnv(IW, IH);
    cv.getContext("2d")!.putImageData(d, 0, 0);
    const t = new CanvasTexture(cv);
    if (srgb) t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  return { map: toTex(col, true), mask: toTex(msk, false) };
}

/** Holographic film's thin-film thickness (G channel): diagonal bands, so the rainbow runs across it. */
function holoThickness() {
  const n = 512;
  const c = cnv(n, n);
  const g = c.getContext("2d")!;
  const img = g.createImageData(n, n);
  const wob = valueNoise(n, 5, 11);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const t = 0.5 + 0.5 * Math.sin(((x * 0.9 + y) / n) * Math.PI * 2 + wob[y * n + x] * 1.2);
      const i = (y * n + x) * 4;
      img.data[i + 1] = 255 * t;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** The backing paper: glossy release liner with its maker's name printed faintly across it. */
function linerTexture() {
  const w = 1600;
  const h = Math.round((w * (H + PAD * 2)) / (W + PAD * 2));
  const c = cnv(w, h);
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3f0e9";
  rr(g, 0, 0, w, h, 34);
  g.fill();
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim() || "Arial";
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(-0.42);
  g.fillStyle = "rgba(30,63,216,0.13)";
  g.font = `900 34px ${sans}, Arial, sans-serif`;
  if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
  for (let y = -h * 1.4; y < h * 1.4; y += 74) for (let x = -w * 1.4 + ((y / 74) % 2) * 160; x < w * 1.4; x += 330) g.fillText("LABEL BROS", x, y);
  g.restore();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A soft shadow for the backing to lie on. */
function shadowTexture() {
  const c = cnv(256, 256);
  const g = c.getContext("2d")!;
  g.shadowColor = "#fff";
  g.shadowBlur = 26;
  g.shadowOffsetX = 1000;
  g.fillRect(36 - 1000, 36, 184, 184);
  return new CanvasTexture(c);
}

/* ---------------------------------------------------------------- the studio */

/* ---------------------------------------------------------------- the scene */

type Look = { mat: MeshPhysicalMaterial; tex: Texture[] };
const idle = () => new Promise<void>((done) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => done(), { timeout: 1500 }) : setTimeout(done, 200)));

export class MaterialSticker {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(26, 1, 0.1, 60);
  private board = new Group();
  private key = new DirectionalLight(0xfafcff, 1.1);
  private environmentTarget: ReturnType<typeof materialStudio>;
  private sticker: Mesh<PlaneGeometry, MeshPhysicalMaterial>;
  private flat: Float32Array;
  private liner: Mesh<PlaneGeometry, MeshPhysicalMaterial>;
  private shade: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private looks = new Map<string, Promise<Look>>();
  private made: Look[] = [];
  private compiled = new Set<string>();
  private destroyed = false;
  private shadowAt = "";
  private normals = new Map<string, Texture>();
  private fibre: Float32Array;
  private holoThick: Texture | null = null;
  /** where the holographic rainbow sits: it slides as the studio turns and the board tilts */
  private shift = { value: 0 };
  private dir = new Vector2();
  private support = 1;
  private peel = { v: REST };
  private s = { tiltX: 0, tiltY: 0, env: 0, sweep: 0 };
  private hovering = false;
  private drag: { id: number; start: Vector3; peel: number; touch: boolean; moved: boolean; x: number; y: number } | null = null;
  private visible = false;
  private dirty = true;
  private t0 = performance.now();
  private cleanup: (() => void)[] = [];
  private ray = new Raycaster();
  private inv = new Matrix4();
  private reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  current: Substrate = "white";

  constructor(private host: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    // the shadow is redrawn only when the sticker or the light moves (tick), not every frame
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.domElement.className = "ml-canvas";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(this.renderer.domElement);

    this.environmentTarget = materialStudio(this.renderer);
    this.scene.environment = this.environmentTarget.texture;
    this.scene.environmentIntensity = 1;

    // the key light, which casts the peeled corner's shadow
    this.key.position.set(-2.4, 3.2, 5.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    const sc = this.key.shadow.camera;
    sc.left = -3;
    sc.right = 3;
    sc.top = 3;
    sc.bottom = -3;
    sc.near = 1;
    sc.far = 14;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.012;
    this.key.shadow.radius = 5;
    this.key.shadow.intensity = 0.62;
    this.scene.add(this.key);

    // the backing paper and the soft shadow it lies on
    this.shade = new Mesh(new PlaneGeometry((W + PAD * 2) * 1.25, (H + PAD * 2) * 1.35), new MeshBasicMaterial({ map: shadowTexture(), color: "#050b33", transparent: true, opacity: 0.6, depthWrite: false }));
    this.shade.position.set(0.08, -0.16, -0.03);
    this.liner = new Mesh(
      new PlaneGeometry(W + PAD * 2, H + PAD * 2),
      new MeshPhysicalMaterial({ map: linerTexture(), roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.25, alphaTest: 0.5 }),
    );
    this.liner.receiveShadow = true;

    // the sticker: a thin film, a hair above the liner
    const geo = new PlaneGeometry(W, H, SX, SY);
    this.flat = Float32Array.from(geo.attributes.position.array as Float32Array);
    this.sticker = new Mesh(geo, new MeshPhysicalMaterial());
    this.sticker.position.z = 0.004;
    this.sticker.castShadow = true;
    this.sticker.receiveShadow = true;
    this.fibre = fibreHeights(512, 3600, 0.5);

    this.board.add(this.shade, this.liner, this.sticker);
    this.board.rotation.z = -0.06;
    this.scene.add(this.board);
    this.setCorner();
    this.deform();
  }

  async init(look: Substrate = "white", line = "White gloss film") {
    this.current = look;
    this.use(await this.prepare(look, line));
    this.resize();
    this.bind();
    await this.renderer.compileAsync(this.scene, this.camera).catch(() => undefined);
    gsap.ticker.add(this.tick);
    if (!this.reduce) {
      this.peel.v = this.maxPeel() * 0.7;
      gsap.to(this.peel, { v: REST, duration: 0.9, delay: 0.15, ease: "slap", onUpdate: this.deform });
    }
  }

  /**
   * Make every material ahead of time, one after another while the page is idle, and compile its
   * shader in the background, so choosing one never has to wait for either.
   */
  async warm(list: { k: Substrate; line: string }[]) {
    for (const { k, line } of list) {
      if (this.destroyed) return;
      await idle();
      const look = await this.prepare(k, line);
      if (this.destroyed) return;
      await this.precompile(k, look);
    }
  }

  /** A new material, laid down like a fresh sticker (the ink line names it). */
  show(k: Substrate, line: string) {
    if (k === this.current) return;
    this.current = k;
    const ready = this.prepare(k, line);
    if (this.reduce || this.drag) {
      void ready.then((look) => this.current === k && this.use(look));
      return;
    }
    // the old one lifts at once; the new one goes down as soon as it's ready (at once, if warmed)
    gsap.killTweensOf(this.peel);
    const lift = gsap.to(this.peel, { v: this.maxPeel() * 0.72, duration: 0.32, ease: "power2.in", onUpdate: this.deform });
    void Promise.all([ready, lift.then()]).then(([look]) => {
      if (this.current !== k || this.destroyed) return;
      this.use(look);
      gsap.to(this.peel, { v: this.hovering ? REST + 0.3 : REST, duration: 0.75, delay: 0.04, ease: "slap", onUpdate: this.deform });
      gsap.fromTo(this.s, { sweep: -1.3 }, { sweep: 0, duration: 1.4, ease: "power2.out" });
    });
  }

  private use(look: Look) {
    this.sticker.material = look.mat;
    this.dirty = true;
    this.shadowAt = "";
  }

  /** Compile a material's shader off the main thread, on a mesh that is never drawn. */
  private async precompile(k: Substrate, look: Look) {
    if (this.compiled.has(k)) return;
    this.compiled.add(k);
    const probe = new Mesh(this.sticker.geometry, look.mat);
    probe.castShadow = true;
    probe.receiveShadow = true;
    probe.matrixWorld.copy(this.sticker.matrixWorld);
    await this.renderer.compileAsync(probe, this.camera, this.scene).catch(() => undefined);
  }

  /* -------------------------------------------------------------- materials */

  private normal(k: Substrate) {
    const kind = k === "paper" || k === "kraft" ? k : "film";
    let t = this.normals.get(kind);
    if (t) return t;
    const n = 512;
    if (kind === "film") t = normalTexture(valueNoise(n, 48, 5), n, 1.2, [3, 2]);
    else if (kind === "paper") t = normalTexture(this.fibre, n, 2.2, [2.2, 1.4]);
    else t = normalTexture(this.fibre, n, 4, [2.2, 1.4]);
    this.normals.set(kind, t);
    return t;
  }

  private prepare(k: Substrate, line: string): Promise<Look> {
    const key = `${k}|${line}`;
    let p = this.looks.get(key);
    if (!p) {
      p = this.make(k, line);
      this.looks.set(key, p);
    }
    return p;
  }

  private async make(k: Substrate, line: string): Promise<Look> {
    {
      const { map, mask } = await printMaps(k, inkCanvas(line), this.fibre, 512);
      const metal = METAL.has(k);
      const m = new MeshPhysicalMaterial({
        map,
        side: DoubleSide,
        alphaTest: 0.5,
        normalMap: metal ? null : this.normal(k),
        normalScale: new Vector2(1, 1),
        roughness: 0.5,
        metalness: 0,
      });
      switch (k) {
        case "white":
          m.roughness = 0.34;
          m.specularIntensity = 0.6;
          m.clearcoat = 0.6;
          m.clearcoatRoughness = 0.08;
          m.normalScale.set(0.25, 0.25);
          break;
        case "paper":
          m.roughness = 0.9;
          m.normalScale.set(0.2, 0.2);
          m.sheen = 0.3;
          m.sheenRoughness = 0.8;
          break;
        case "kraft":
          m.roughness = 0.96;
          m.normalScale.set(0.3, 0.3);
          break;
        case "clear":
          // the film lets the liner show through; the ink on it doesn't
          m.transmission = 1;
          m.transmissionMap = mask;
          m.thickness = 0.02;
          m.ior = 1.45;
          m.roughness = 0.1;
          m.clearcoat = 1;
          m.clearcoatRoughness = 0.04;
          m.normalScale.set(0.2, 0.2);
          break;
        default:
          // foils: metal wherever there's no ink, with a laminate over the top
          m.roughness = 1;
          m.roughnessMap = mask;
          m.metalness = 1;
          m.metalnessMap = mask;
          // the film foils keep some of their own colour, so they read bright, not chrome-dark
          if (k === "holo") m.metalness = 0.62;
          if (k === "holo") {
            this.holoThick ??= holoThickness();
            m.iridescence = 0.9;
            m.iridescenceMap = mask;
            m.iridescenceIOR = 1.8;
            m.iridescenceThicknessRange = [180, 860];
            m.iridescenceThicknessMap = this.holoThick;
          }
          configureSurface(m, k as "silver" | "gold" | "holo" | "glitter");
      }
      if (k === "clear") m.envMapIntensity = 0.8;
      // the back of the film is its white adhesive side
      const holo = k === "holo";
      m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
        if (metal) patchSurface(sh, k as "silver" | "gold" | "holo" | "glitter", mask, W, H);
        if (holo) sh.uniforms.uShift = this.shift;
        sh.fragmentShader = sh.fragmentShader
          .replace("#include <common>", `#include <common>\n${holo ? "uniform float uShift;" : ""}`)
          .replace(
            "#include <map_fragment>",
            `#include <map_fragment>
            ${
              holo
                ? `if (gl_FrontFacing) {
                     // the foil (not the ink) takes a rainbow that runs across it and slides as it turns
                     float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                     float foil = smoothstep(0.35, 0.7, luma);
                     float ph = (vMapUv.x * 1.25 + vMapUv.y * 0.7) * 1.3 + uShift;
                     vec3 spec = 0.55 + 0.45 * cos(6.28318 * (ph + vec3(0.0, 0.33, 0.67)));
                     diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * spec * 1.12, foil * 0.4);
                   }`
                : ""
            }
            if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.93, 0.925, 0.9);`,
          )
          .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nif (!gl_FrontFacing) metalnessFactor = 0.0;")
          .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nif (!gl_FrontFacing) roughnessFactor = 0.85;");
      };
      m.customProgramCacheKey = () => `lb-sticker-${k}`;
      const look = { mat: m, tex: [map, mask] };
      this.made.push(look);
      return look;
    }
  }

  /* -------------------------------------------------------------- the peel */

  /** Peel from the top right corner, towards the middle. */
  private setCorner() {
    this.dir.set(-W, -H).normalize();
    const p = this.flat;
    let s = -Infinity;
    for (let i = 0; i < p.length; i += 3) s = Math.max(s, -(p[i] * this.dir.x + p[i + 1] * this.dir.y));
    this.support = s;
  }

  private maxPeel() {
    return this.support * 1.15;
  }

  private deform = () => {
    const pos = this.sticker.geometry.attributes.position;
    const a = pos.array as Float32Array;
    const f = this.flat;
    const d = this.dir;
    const ex = -d.x;
    const ey = -d.y;
    const peel = this.peel.v;
    const arc = CURL * TURN;
    for (let i = 0; i < a.length; i += 3) {
      const x = f[i];
      const y = f[i + 1];
      const t = x * d.x + y * d.y + this.support;
      const u = peel - t;
      if (u <= 0) {
        a[i] = x;
        a[i + 1] = y;
        a[i + 2] = 0;
        continue;
      }
      const fx = x + d.x * u;
      const fy = y + d.y * u;
      const th = Math.min(u / CURL, TURN);
      let px = fx + ex * CURL * Math.sin(th);
      let py = fy + ey * CURL * Math.sin(th);
      let pz = CURL * (1 - Math.cos(th));
      if (u > arc) {
        const r = u - arc;
        px += Math.cos(th) * ex * r;
        py += Math.cos(th) * ey * r;
        pz += Math.sin(th) * r;
      }
      a[i] = px;
      a[i + 1] = py;
      a[i + 2] = pz;
    }
    pos.needsUpdate = true;
    this.sticker.geometry.computeVertexNormals();
    // no tangents: the shader derives its tangent frame from the surface itself, so the curl
    // costs one normals pass a frame, not two
    this.sticker.geometry.computeBoundingSphere();
    this.dirty = true;
  };

  /* -------------------------------------------------------------- camera and input */

  private resize() {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    // 1.5 is sharp on retina screens at a little over half the pixels of 2
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const t = Math.tan((this.camera.fov * Math.PI) / 360);
    const half = (W + PAD * 2) * 0.52;
    const d = Math.max(half / (t * this.camera.aspect), ((H + PAD * 2) * 0.62) / t);
    this.camera.position.set(0, -d * Math.sin(TILT), d * Math.cos(TILT));
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(0, 0.05, 0);
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  /** Where the pointer meets the sticker's plane, in the sticker's own coordinates. */
  private at(e: { clientX: number; clientY: number }) {
    const r = this.host.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    this.board.updateMatrixWorld();
    const plane = new Plane(new Vector3(0, 0, 1), 0).applyMatrix4(this.board.matrixWorld);
    const p = this.ray.ray.intersectPlane(plane, new Vector3());
    return p ? p.applyMatrix4(this.inv.copy(this.board.matrixWorld).invert()) : null;
  }
  private inside(p: Vector3) {
    return Math.abs(p.x) <= W / 2 && Math.abs(p.y) <= H / 2;
  }

  private lift(over: boolean) {
    if (over === this.hovering || this.drag) return;
    this.hovering = over;
    gsap.to(this.peel, { v: over ? REST + 0.3 : REST, duration: over ? 0.5 : 0.55, ease: over ? "peel" : "slap", overwrite: true, onUpdate: this.deform });
  }

  private bind() {
    const el = this.host;
    const on = <K extends keyof HTMLElementEventMap>(t: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(t, fn as EventListener);
      this.cleanup.push(() => el.removeEventListener(t, fn as EventListener));
    };
    on("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      const ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      const d = this.drag;
      if (d && d.id === e.pointerId) {
        if (d.touch) {
          d.moved ||= Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8;
          return;
        }
        const p = this.at(e);
        if (!p) return;
        const dx = p.x - d.start.x;
        const dy = p.y - d.start.y;
        const along = dx * this.dir.x + dy * this.dir.y;
        this.peel.v = clamp(d.peel + Math.max(along, Math.hypot(dx, dy) * 0.6) * 0.55, 0.05, this.maxPeel());
        d.moved = true;
        this.deform();
        return;
      }
      if (e.pointerType !== "mouse") return;
      // the board leans to the pointer and the studio turns, so the highlights sweep across
      gsap.to(this.s, { tiltX: ny * 0.14, tiltY: nx * 0.2, env: nx * 1.1, duration: this.reduce ? 0 : 1, ease: "power3.out", overwrite: "auto" });
      const p = this.at(e);
      this.lift(Boolean(p && this.inside(p)));
    });
    on("pointerleave", () => {
      if (this.drag) return;
      this.lift(false);
      gsap.to(this.s, { tiltX: 0, tiltY: 0, env: 0, duration: 1.4, ease: "power3.out", overwrite: "auto" });
    });
    on("pointerdown", (e) => {
      if (e.button !== 0) return;
      const p = this.at(e);
      if (!p || !this.inside(p)) return;
      const touch = e.pointerType !== "mouse";
      gsap.killTweensOf(this.peel);
      if (!touch) {
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "";
      }
      this.drag = { id: e.pointerId, start: p, peel: this.peel.v, touch, moved: false, x: e.clientX, y: e.clientY };
    });
    const up = (e: PointerEvent) => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (d.touch) {
        if (d.moved || e.type === "pointercancel") return;
        gsap
          .timeline({ onUpdate: this.deform })
          .to(this.peel, { v: this.maxPeel() * 0.6, duration: this.reduce ? 0 : 0.5, ease: "peel" })
          .to(this.peel, { v: REST, duration: this.reduce ? 0 : 0.6, ease: "slap" }, "+=0.4");
        return;
      }
      gsap.to(this.peel, { v: this.hovering ? REST + 0.3 : REST, duration: this.reduce ? 0 : 0.6, ease: "slap", onUpdate: this.deform });
    };
    on("pointerup", up);
    on("pointercancel", up);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(el);
    this.cleanup.push(() => ro.disconnect());
    const io = new IntersectionObserver(([en]) => {
      this.visible = en.isIntersecting;
      this.dirty = true;
    });
    io.observe(el);
    this.cleanup.push(() => io.disconnect());
  }

  private tick = () => {
    if (!this.visible) return;
    const t = (performance.now() - this.t0) / 1000;
    const drift = this.reduce ? 0 : Math.sin(t * 0.3) * 0.35;
    const s = this.s;
    this.board.rotation.x = s.tiltX;
    this.board.rotation.y = s.tiltY;
    this.scene.environmentRotation.set(0.32 + s.tiltX * 0.3, -s.tiltY * 0.3, (s.env + drift + s.sweep) * 0.65);
    this.shift.value = (s.env + drift + s.sweep) * 0.45 + s.tiltY * 1.5 - s.tiltX;
    this.key.position.set(-2.4 + s.env * 1.5, 3.2, 5.6);
    const at = `${this.peel.v.toFixed(4)}|${s.tiltX.toFixed(4)}|${s.tiltY.toFixed(4)}|${s.env.toFixed(3)}`;
    if (at !== this.shadowAt) {
      this.shadowAt = at;
      this.renderer.shadowMap.needsUpdate = true;
    }
    // the studio drifts slowly on its own, so it always renders while on screen (unless reduced)
    if (!this.reduce || this.dirty) {
      this.dirty = false;
      this.renderer.render(this.scene, this.camera);
    }
  };

  destroy() {
    this.destroyed = true;
    for (const off of this.cleanup) off();
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this.peel);
    gsap.killTweensOf(this.s);
    for (const l of this.made) {
      l.mat.dispose();
      for (const t of l.tex) t.dispose();
    }
    for (const t of this.normals.values()) t.dispose();
    this.holoThick?.dispose();
    this.sticker.geometry.dispose();
    this.liner.material.map?.dispose();
    this.liner.material.dispose();
    this.liner.geometry.dispose();
    this.shade.material.map?.dispose();
    this.shade.material.dispose();
    this.shade.geometry.dispose();
    this.environmentTarget.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
