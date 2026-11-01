"use client";

import {
  CanvasTexture,
  Color,
  DoubleSide,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  type Texture,
} from "three";
import { gsap } from "@/lib/gsap";
import { DESIGNS, renderSticker, yieldToMain, type RenderedSticker, type StickerDesign } from "./art";
import { warmFonts } from "./fonts";
import { pickLayout, type Layout, type Placement } from "./layout";
import { shadowFragment, shadowVertex, stickerFragment, stickerVertex } from "./shaders";

const FOV = 18;
const LIFT = 130; // px a held sticker rises toward the camera
const ANGLES = 96; // resolution of each sticker's support-function table
const SHADOW_MARGIN = 48; // px of room around a sticker for its blurred shadow
const SHADOW_COLOR = new Color(0.02, 0.05, 0.22);
const BACK_COLOR = new Color(0.94, 0.92, 0.87);

const FINISH = {
  gloss: { holo: 0, gloss: 1, glitter: 0 },
  matte: { holo: 0, gloss: 0.25, glitter: 0 },
  kraft: { holo: 0, gloss: 0.1, glitter: 0 },
  holo: { holo: 1, gloss: 0.8, glitter: 0 },
  glitter: { holo: 0, gloss: 0.7, glitter: 1 },
} as const;

type Rect = { x: number; y: number; w: number; h: number };

type State = {
  x: number;
  y: number;
  rot: number; // radians, clockwise on screen
  scale: number; // multiplies the resting size (1 on the table)
  lift: number; // 0 on the table, 1 held
  peel: number; // px the fold has travelled in from the edge
  radius: number; // curl radius, px
  curl: number; // max curl angle, radians
  pa: number; // direction (local, y-up) of the edge being peeled
  tiltX: number;
  tiltY: number;
  opacity: number;
};

type Sticker = {
  design: StickerDesign;
  art: RenderedSticker;
  texScale: number;
  itemScale: number; // per-placement size, for a collage with hierarchy
  mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  shadow: Mesh<PlaneGeometry, ShaderMaterial>;
  support: Float32Array;
  state: State;
  home: { x: number; y: number; rot: number };
  paTarget: number | null;
  hoverOn: boolean;
  active: boolean;
  moved: boolean;
  proxy: HTMLButtonElement;
  landing: gsap.core.Tween | null; // pending slap after a throw or a reset
};

type Drag = {
  s: Sticker;
  id: number;
  offX: number;
  offY: number;
  rot0: number;
  sway: number;
  samples: { t: number; x: number; y: number }[];
};

export type StageOptions = {
  host: HTMLElement;
  mount: HTMLElement;
  proxies: HTMLElement;
  reduceMotion: boolean;
  onMovedChange: (moved: boolean) => void;
  onReady: () => void;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Half extents of a w×h box turned by `rot`. */
function extents(w: number, h: number, rot: number) {
  const c = Math.abs(Math.cos(rot));
  const n = Math.abs(Math.sin(rot));
  return { hw: (w * c + h * n) / 2, hh: (w * n + h * c) / 2 };
}

/** Push a start position up until a box no longer covers any of the rects. */
function avoid(home: { x: number; y: number; rot: number }, w: number, h: number, rects: Rect[], top: number) {
  const e = extents(w, h, home.rot);
  const hw = e.hw * 0.92;
  const hh = e.hh * 0.92;
  const gap = 12;
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (const r of rects) {
      const clear =
        home.x + hw < r.x - gap || home.x - hw > r.x + r.w + gap || home.y + hh < r.y - gap || home.y - hh > r.y + r.h + gap;
      if (clear) continue;
      home.y = r.y - gap - hh;
      moved = true;
    }
    if (!moved) break;
  }
  home.y = Math.max(home.y, top * 0.55);
}

export class StickerStage {
  private o: StageOptions;
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 10, 8000);
  private stickers: Sticker[] = [];
  private stack: Sticker[] = [];
  private flat: HTMLCanvasElement[] = [];
  private layoutDef: Layout | null = null;
  private W = 1;
  private H = 1;
  private base = 1;
  private rect: DOMRect | null = null;
  private drag: Drag | null = null;
  private hover: Sticker | null = null;
  private light = new Vector2(0, 0);
  private dirty = true;
  private inView = true;
  private destroyed = false;
  private lastClickBlock = 0;
  private movedFlag = false;
  private time = 0;
  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private teaseCall?: gsap.core.Tween;
  private texScale = 2;
  private building = false;

  constructor(o: StageOptions) {
    this.o = o;
  }

  /* ------------------------------------------------------------ setup */

  async init() {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "sticker-canvas";
    try {
      // no MSAA: every visible edge comes from texture alpha, so it would only cost fill rate
      this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true });
    } catch {
      return false;
    }
    this.renderer.setClearColor(0x000000, 0);
    this.o.mount.appendChild(canvas);

    const rect = this.o.host.getBoundingClientRect();
    const layout = pickLayout(rect.width);
    const band = this.band(rect.height);
    const base = layout.scale(rect.width, rect.height, band.bottom - band.top);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.texScale = clamp(dpr * Math.max(base * 1.15, 0.8) * 1.15, 1.5, 2.8);

    // the finished artwork is images; fonts only matter if one falls back to the drawn version
    if (DESIGNS.some((d) => !d.image)) void warmFonts();

    // only the stickers this screen shows; others are made if the layout ever needs them
    await this.ensure(this.neededIds(rect.width, layout));
    if (this.destroyed) return false;
    await this.renderer.compileAsync(this.scene, this.camera).catch(() => undefined);
    if (this.destroyed) return false;

    this.layout(true);
    this.bind();
    gsap.ticker.add(this.tick);
    this.intro();
    this.o.onReady();
    // dev only: lets QA scripts find stickers
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __lbStage: this });
    return true;
  }

  /** No WebGL: lay the same artwork out as still images so the table is never empty. */
  async fallback() {
    const rect = this.o.host.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const def = pickLayout(W);
    const band = this.band(H);
    const keep = this.keepouts();
    const base = def.scale(W, H, band.bottom - band.top);
    for (const p of def.items) {
      if (!this.fits(p, W, band.bottom - band.top)) continue;
      const design = DESIGNS.find((d) => d.id === p.id);
      if (!design) continue;
      const art = await renderSticker(design, Math.min(window.devicePixelRatio || 1, 2));
      if (this.destroyed) return;
      const k = base * (p.s ?? 1);
      const w = art.width * k;
      const h = art.height * k;
      const home = { x: p.x * W, y: this.homeY(p, H, band), rot: (p.rot * Math.PI) / 180 };
      avoid(home, w, h, keep, band.top);
      const c = art.canvas;
      c.setAttribute("aria-hidden", "true");
      c.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform:translate(${home.x - w / 2}px,${home.y - h / 2}px) rotate(${home.rot}rad)`;
      this.o.mount.appendChild(c);
      this.flat.push(c);
    }
  }

  private fits(it: Placement, W: number, bandH: number) {
    return W >= (it.minWidth ?? 0) && bandH >= (it.minBand ?? 0);
  }

  private neededIds(W: number, def: Layout) {
    const band = this.band(this.o.host.offsetHeight);
    return def.items.filter((it) => this.fits(it, W, band.bottom - band.top)).map((it) => it.id);
  }

  /** Build any missing stickers, one short task at a time. */
  private async ensure(ids: string[]) {
    const r = this.renderer;
    if (!r) return;
    const aniso = r.capabilities.getMaxAnisotropy();
    for (const design of DESIGNS) {
      if (!ids.includes(design.id) || this.stickers.some((s) => s.design.id === design.id)) continue;
      const art = await renderSticker(design, this.texScale);
      if (this.destroyed) return;
      const s = this.build(design, art, this.texScale, aniso);
      s.active = false;
      s.mesh.visible = s.shadow.visible = false;
      this.stickers.push(s);
      this.stack.push(s);
      r.initTexture(s.mesh.material.uniforms.map.value as Texture); // upload now, not on first frame
      await yieldToMain();
      if (this.destroyed) return;
    }
    this.restack();
  }

  private build(design: StickerDesign, art: RenderedSticker, texScale: number, aniso: number): Sticker {
    const tex = new CanvasTexture(art.canvas);
    tex.colorSpace = NoColorSpace;
    tex.premultiplyAlpha = true;
    tex.anisotropy = Math.min(8, aniso);
    tex.needsUpdate = true;

    const f = FINISH[design.finish];
    const mat = new ShaderMaterial({
      vertexShader: stickerVertex,
      fragmentShader: stickerFragment,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: true,
      depthWrite: true,
      side: DoubleSide,
      uniforms: {
        map: { value: tex },
        uDir: { value: new Vector2(-1, 0) },
        uSupport: { value: 0 },
        uPeel: { value: 0 },
        uRadius: { value: 12 },
        uMaxAngle: { value: Math.PI * 0.6 },
        uOpacity: { value: 1 },
        uHolo: { value: f.holo },
        uGloss: { value: f.gloss },
        uGlitter: { value: f.glitter },
        uTime: { value: 0 },
        uLight: { value: this.light },
        uBack: { value: BACK_COLOR },
      },
    });
    const mesh = new Mesh(new PlaneGeometry(art.width, art.height, 56, 56), mat);

    const sw = art.width + SHADOW_MARGIN * 2;
    const sh = art.height + SHADOW_MARGIN * 2;
    const smat = new ShaderMaterial({
      vertexShader: shadowVertex,
      fragmentShader: shadowFragment,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        map: { value: tex },
        uExpand: { value: new Vector2(sw / art.width, sh / art.height) },
        uSpread: { value: new Vector2(0, 0) },
        uLod: { value: 1 },
        uOpacity: { value: 0.4 },
        uColor: { value: SHADOW_COLOR },
      },
    });
    const shadow = new Mesh(new PlaneGeometry(sw, sh), smat);
    this.scene.add(shadow, mesh);

    const proxy = document.createElement("button");
    proxy.type = "button";
    proxy.className = "sticker-proxy";
    proxy.setAttribute("aria-label", `${design.name} sticker, ${design.spec.toLowerCase()}`);
    proxy.setAttribute("aria-describedby", "sticker-help");
    this.o.proxies.appendChild(proxy);

    const s: Sticker = {
      design,
      art,
      texScale,
      itemScale: 1,
      mesh,
      shadow,
      support: this.supportTable(art),
      state: { x: 0, y: 0, rot: 0, scale: 1, lift: 0, peel: 0, radius: 10, curl: Math.PI * 0.6, pa: -Math.PI / 4, tiltX: 0, tiltY: 0, opacity: 1 },
      home: { x: 0, y: 0, rot: 0 },
      paTarget: null,
      hoverOn: false,
      active: true,
      moved: false,
      proxy,
      landing: null,
    };
    proxy.addEventListener("keydown", (e) => this.onKey(e, s));
    return s;
  }

  /** For each direction, how far the sticker's outline reaches: the edge a peel starts from. */
  private supportTable(art: RenderedSticker) {
    const table = new Float32Array(ANGLES).fill(-1e9);
    const { mask, maskW, maskH, width, height } = art;
    const sx = width / maskW;
    const sy = height / maskH;
    const cos = new Float32Array(ANGLES);
    const sin = new Float32Array(ANGLES);
    for (let k = 0; k < ANGLES; k++) {
      cos[k] = Math.cos((k / ANGLES) * Math.PI * 2);
      sin[k] = Math.sin((k / ANGLES) * Math.PI * 2);
    }
    for (let j = 0; j < maskH; j++) {
      for (let i = 0; i < maskW; i++) {
        if (mask[j * maskW + i] < 110) continue;
        const edge =
          i === 0 || j === 0 || i === maskW - 1 || j === maskH - 1 ||
          mask[j * maskW + i - 1] < 110 || mask[j * maskW + i + 1] < 110 ||
          mask[(j - 1) * maskW + i] < 110 || mask[(j + 1) * maskW + i] < 110;
        if (!edge) continue;
        const lx = (i + 0.5) * sx - width / 2;
        const ly = height / 2 - (j + 0.5) * sy;
        for (let k = 0; k < ANGLES; k++) {
          const d = lx * cos[k] + ly * sin[k];
          if (d > table[k]) table[k] = d;
        }
      }
    }
    return table;
  }

  private support(s: Sticker, pa: number) {
    const f = ((((pa / (Math.PI * 2)) % 1) + 1) % 1) * ANGLES;
    const i = Math.floor(f) % ANGLES;
    const t = f - Math.floor(f);
    return s.support[i] * (1 - t) + s.support[(i + 1) % ANGLES] * t + 1;
  }

  private restack() {
    this.stack.forEach((s, i) => {
      s.mesh.renderOrder = i * 2 + 1;
      s.shadow.renderOrder = i * 2;
      s.mesh.userData.z = i * 0.8;
    });
    this.dirty = true;
  }

  private toTop(s: Sticker) {
    this.stack = this.stack.filter((x) => x !== s);
    this.stack.push(s);
    this.restack();
  }

  /** Resting scale of a sticker on screen. */
  private k(s: Sticker) {
    return this.base * s.itemScale;
  }

  /* ------------------------------------------------------------ layout */

  private homeY(p: Placement, H: number, band: { top: number; bottom: number }) {
    return p.zone === "full" ? p.y * H : band.top + p.y * (band.bottom - band.top);
  }

  private layout(initial: boolean) {
    const r = this.renderer;
    if (!r) return;
    const rect = this.o.host.getBoundingClientRect();
    this.rect = rect;
    const W = Math.max(1, rect.width);
    const H = Math.max(1, rect.height);
    const prevW = this.W;
    const prevH = this.H;
    this.W = W;
    this.H = H;
    // cap the backing store on very large retina screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pr = W * H * dpr * dpr > 6e6 ? Math.min(dpr, 1.5) : dpr;
    if (r.getPixelRatio() !== pr) r.setPixelRatio(pr);
    r.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.camera.position.set(0, 0, H / 2 / Math.tan((FOV * Math.PI) / 360));
    this.camera.near = 10;
    this.camera.far = this.camera.position.z * 3;
    this.camera.updateProjectionMatrix();

    const def = pickLayout(W);
    const changed = def !== this.layoutDef;
    this.layoutDef = def;
    const needed = this.neededIds(W, def);
    if (!initial && !this.building && needed.some((id) => !this.stickers.some((s) => s.design.id === id))) {
      this.building = true;
      void this.ensure(needed).then(() => {
        this.building = false;
        if (!this.destroyed) this.layout(false);
      });
    }
    const band = this.band(H);
    const keep = this.keepouts();
    this.base = def.scale(W, H, band.bottom - band.top);

    for (const s of this.stickers) {
      const p = def.items.find((it) => it.id === s.design.id && this.fits(it, W, band.bottom - band.top));
      s.active = !!p;
      s.mesh.visible = s.shadow.visible = s.active;
      s.proxy.hidden = !s.active;
      if (!p) continue;
      s.itemScale = p.s ?? 1;
      s.home = { x: p.x * W, y: this.homeY(p, H, band), rot: (p.rot * Math.PI) / 180 };
      avoid(s.home, (s.art.width - 8) * this.k(s), (s.art.height - 8) * this.k(s), keep, band.top);
      if (initial || changed || !s.moved) {
        gsap.killTweensOf(s.state, "x,y,rot");
        s.state.x = s.home.x;
        s.state.y = s.home.y;
        s.state.rot = s.home.rot;
        if (changed && !initial) s.moved = false;
      } else {
        const next = this.settle(s, s.state.x * (W / prevW), s.state.y * (H / prevH), s.state.rot);
        s.state.x = next.x;
        s.state.y = next.y;
      }
      // keyboard stand-in: sized once here, only transformed per frame
      s.proxy.style.width = `${s.art.width * this.k(s)}px`;
      s.proxy.style.height = `${s.art.height * this.k(s)}px`;
    }
    if (changed && !initial) this.emitMoved();
    this.dirty = true;
  }

  /** Elements stickers must keep off. `hard` ones (paragraph, buttons) also can't be landed on. */
  private keepouts(hardOnly = false): Rect[] {
    const host = this.o.host;
    return [...host.querySelectorAll<HTMLElement>("[data-keepout]")]
      .filter((el) => el.offsetWidth > 0 && (!hardOnly || el.dataset.keepout === "hard"))
      .map((el) => {
        // offsets, not getBoundingClientRect: the intro transforms must not skew the measurement
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = el;
        while (n && n !== host) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        return { x, y, w: el.offsetWidth, h: el.offsetHeight };
      });
  }

  private headerH() {
    return document.querySelector<HTMLElement>("header")?.offsetHeight ?? 72;
  }

  /** The strip between the header and the headline where the collage lives. */
  private band(H: number) {
    const top = this.headerH();
    const keep = this.keepouts();
    const textTop = keep.length ? Math.min(...keep.map((r) => r.y)) : H * 0.55;
    return { top, bottom: Math.max(top + 140, textTop - 6) };
  }

  /**
   * Where a sticker may come to rest: mostly on the table, below the header, and never on the
   * paragraph, the buttons or the controls (so it can't bury the call to action).
   */
  private settle(s: Sticker, x: number, y: number, rot: number) {
    const { hw, hh } = extents((s.art.width - 8) * this.k(s), (s.art.height - 8) * this.k(s), rot);
    const minY = Math.min(this.H / 2, this.headerH() + hh * 0.75);
    let nx = clamp(x, hw * 0.45, this.W - hw * 0.45);
    let ny = clamp(y, minY, this.H - hh * 0.5);
    const gap = 10;
    for (const r of this.keepouts(true)) {
      const clear =
        nx + hw * 0.9 < r.x - gap || nx - hw * 0.9 > r.x + r.w + gap || ny + hh * 0.9 < r.y - gap || ny - hh * 0.9 > r.y + r.h + gap;
      if (!clear) ny = Math.min(ny, r.y - gap - hh * 0.9);
    }
    nx = clamp(nx, hw * 0.45, this.W - hw * 0.45);
    return { x: nx, y: Math.max(ny, minY * 0.9) };
  }

  /* ------------------------------------------------------------ intro */

  private intro() {
    const live = this.stickers.filter((s) => s.active);
    if (this.o.reduceMotion) {
      this.dirty = true;
      return;
    }
    const order = [...live].sort((a, b) => a.home.x + a.home.y * 0.4 - (b.home.x + b.home.y * 0.4));
    order.forEach((s, i) => {
      const st = s.state;
      st.opacity = 0;
      st.lift = 1.5;
      st.scale = 1.08;
      st.rot = s.home.rot + (i % 2 ? 0.35 : -0.35);
      st.peel = 26;
      st.radius = 14;
      st.curl = Math.PI * 0.7;
      st.pa = s.home.rot > 0 ? Math.PI * 0.25 : Math.PI * 0.75;
      const at = 0.28 + i * 0.075;
      gsap.to(st, { opacity: 1, duration: 0.14, delay: at, ease: "none" });
      gsap.to(st, { lift: 0, duration: 0.55, delay: at, ease: "slap" });
      gsap.to(st, { rot: s.home.rot, duration: 0.7, delay: at, ease: "expo.out" });
      gsap.to(st, { peel: 0, duration: 0.5, delay: at + 0.32, ease: "power2.out" });
      gsap
        .timeline({ delay: at + 0.4 })
        .to(st, { scale: 0.97, duration: 0.14, ease: "power2.in" })
        .to(st, { scale: 1, duration: 0.4, ease: "expo.out" });
    });
    const end = 0.28 + order.length * 0.075 + 0.9;
    this.teaseCall = gsap.delayedCall(end, () => this.tease("label-bros"));
  }

  /** One sticker lifts a corner by itself, once, so people see that they peel. */
  private tease(id: string) {
    const s = this.stickers.find((x) => x.design.id === id && x.active);
    if (!s || this.drag || this.hover || s.moved) return;
    const st = s.state;
    st.pa = -Math.atan2(s.art.height, s.art.width); // bottom-right corner
    gsap
      .timeline()
      .to(st, { peel: this.hoverPeel(s) * 1.5, radius: 9, curl: Math.PI * 0.82, duration: 0.7, ease: "peel" })
      .to(st, { peel: 0, duration: 0.55, ease: "slap" }, "+=0.6");
  }

  /* ------------------------------------------------------------ pointer */

  private bind() {
    const h = this.o.host;
    h.addEventListener("pointerdown", this.onDown);
    h.addEventListener("pointermove", this.onMove);
    h.addEventListener("pointerup", this.onUp);
    h.addEventListener("pointercancel", this.onUp);
    h.addEventListener("pointerleave", this.onLeave);
    h.addEventListener("touchstart", this.onTouchStart, { passive: false });
    h.addEventListener("click", this.onClickCapture, true);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.ro = new ResizeObserver(() => {
      if (!this.destroyed) this.layout(false);
    });
    this.ro.observe(h);
    this.io = new IntersectionObserver(([e]) => {
      this.inView = e.isIntersecting;
      this.dirty = true;
    });
    this.io.observe(h);
  }

  private onScroll = () => {
    this.rect = this.o.host.getBoundingClientRect();
  };

  private local(e: { clientX: number; clientY: number }) {
    const r = this.rect ?? this.o.host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /** Pointer in the sticker's own frame (y up, unscaled px). */
  private toLocal(s: Sticker, x: number, y: number) {
    const k = this.k(s) * s.state.scale;
    const dx = x - s.state.x;
    const dy = y - s.state.y;
    const c = Math.cos(s.state.rot);
    const n = Math.sin(s.state.rot);
    return { x: (dx * c + dy * n) / k, y: -(-dx * n + dy * c) / k };
  }

  private hit(x: number, y: number): Sticker | null {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const s = this.stack[i];
      if (!s.active || s.state.opacity < 0.5) continue;
      const p = this.toLocal(s, x, y);
      const { width, height, mask, maskW, maskH } = s.art;
      const u = (p.x + width / 2) / width;
      const v = (height / 2 - p.y) / height;
      if (u < 0 || v < 0 || u >= 1 || v >= 1) continue;
      if (mask[Math.floor(v * maskH) * maskW + Math.floor(u * maskW)] > 60) return s;
    }
    return null;
  }

  private hoverPeel(s: Sticker) {
    return clamp(Math.min(s.art.width, s.art.height) * 0.2, 22, 40);
  }

  /** Real stickers peel from corners: pull the peel direction onto a corner when near one. */
  private cornerBias(s: Sticker, a: number) {
    const ca = Math.atan2(s.art.height, s.art.width);
    for (const c of [ca, Math.PI - ca, -Math.PI + ca, -ca]) {
      const d = wrap(a - c);
      if (Math.abs(d) < 0.45) return c + d * (Math.abs(d) / 0.45);
    }
    return a;
  }

  /** Is the edge we'd peel tucked under a sticker that sits on top of this one? */
  private edgeCovered(s: Sticker, pa: number) {
    const k = this.k(s) * s.state.scale;
    const r = this.support(s, pa) * 0.9;
    const lx = Math.cos(pa) * r * k;
    const ly = -Math.sin(pa) * r * k;
    const c = Math.cos(s.state.rot);
    const n = Math.sin(s.state.rot);
    const top = this.hit(s.state.x + lx * c - ly * n, s.state.y + lx * n + ly * c);
    return !!top && top !== s;
  }

  private onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t || e.touches.length > 1) return;
    const p = this.local(t);
    if (this.hit(p.x, p.y)) e.preventDefault(); // a sticker was touched: drag it, don't scroll
  };

  private onClickCapture = (e: MouseEvent) => {
    if (performance.now() - this.lastClickBlock < 400) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private onDown = (e: PointerEvent) => {
    if (this.drag || (e.pointerType === "mouse" && e.button !== 0)) return;
    this.rect = this.o.host.getBoundingClientRect();
    const p = this.local(e);
    const s = this.hit(p.x, p.y);
    if (!s) return;
    e.preventDefault();
    this.lastClickBlock = performance.now();
    try {
      this.o.host.setPointerCapture(e.pointerId);
    } catch {}
    this.teaseCall?.kill();

    const lp = this.toLocal(s, p.x, p.y);
    const angle = this.cornerBias(s, Math.atan2(lp.y, lp.x));
    if (this.hover !== s) s.state.pa = angle;
    s.paTarget = angle;
    this.hover = s;

    gsap.killTweensOf(s.state);
    s.landing?.kill();
    s.landing = null;
    this.toTop(s);
    this.drag = { s, id: e.pointerId, offX: p.x - s.state.x, offY: p.y - s.state.y, rot0: s.state.rot, sway: 0, samples: [{ t: performance.now(), x: p.x, y: p.y }] };

    const m = Math.min(s.art.width, s.art.height);
    const st = s.state;
    gsap
      .timeline()
      .to(st, { peel: clamp(m * 0.36, 44, 90), radius: clamp(m * 0.09, 10, 20), curl: Math.PI * 0.86, duration: 0.24, ease: "peel" })
      .to(st, { peel: clamp(m * 0.24, 30, 58), curl: Math.PI * 0.78, radius: clamp(m * 0.1, 10, 22), duration: 0.5, ease: "power2.out" });
    gsap.to(st, { lift: 1, scale: 1.06, opacity: 1, duration: 0.42, ease: "power3.out" });
    this.o.host.dataset.cursor = "grabbing";
    this.dirty = true;
  };

  private onMove = (e: PointerEvent) => {
    const p = this.local(e);
    this.light.set((p.x / this.W) * 2 - 1, (p.y / this.H) * 2 - 1);
    this.dirty = true;

    const d = this.drag;
    if (d && e.pointerId === d.id) {
      d.s.state.x = p.x - d.offX;
      d.s.state.y = p.y - d.offY;
      const now = performance.now();
      d.samples.push({ t: now, x: p.x, y: p.y });
      while (d.samples.length > 2 && now - d.samples[0].t > 140) d.samples.shift();
      if (!d.s.moved) {
        d.s.moved = true;
        this.emitMoved();
      }
      return;
    }
    if (e.pointerType !== "mouse" || d) return;

    const s = this.hit(p.x, p.y);
    if (s !== this.hover) {
      if (this.hover) this.unhover(this.hover);
      this.hover = s;
      if (s) {
        const lp = this.toLocal(s, p.x, p.y);
        s.state.pa = this.cornerBias(s, Math.atan2(lp.y, lp.x));
        s.hoverOn = false;
        this.o.host.dataset.cursor = "grab";
      } else {
        delete this.o.host.dataset.cursor;
      }
    }
    if (s) {
      const lp = this.toLocal(s, p.x, p.y);
      s.paTarget = this.cornerBias(s, Math.atan2(lp.y, lp.x));
      // lift the edge nearest the pointer, unless another sticker lies on top of it
      const on = !this.edgeCovered(s, s.paTarget);
      if (on !== s.hoverOn) {
        s.hoverOn = on;
        gsap.to(s.state, {
          peel: on ? this.hoverPeel(s) : 0,
          radius: 7,
          curl: Math.PI * 0.8,
          duration: on ? 0.45 : 0.3,
          ease: on ? "power3.out" : "power2.out",
          overwrite: "auto",
        });
      }
    }
  };

  private unhover(s: Sticker) {
    s.paTarget = null;
    s.hoverOn = false;
    if (this.drag?.s === s) return;
    gsap.to(s.state, { peel: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
  }

  private onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || this.drag) return;
    if (this.hover) this.unhover(this.hover);
    this.hover = null;
    delete this.o.host.dataset.cursor;
    this.light.set(0, 0);
    this.dirty = true;
  };

  private velocity(d: Drag) {
    const now = performance.now();
    const last = d.samples[d.samples.length - 1];
    if (!last || now - last.t > 90) return { vx: 0, vy: 0 };
    let first = d.samples[0];
    for (const smp of d.samples) {
      if (last.t - smp.t <= 100) {
        first = smp;
        break;
      }
    }
    const dt = Math.max(16, last.t - first.t) / 1000;
    return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt };
  }

  private onUp = (e: PointerEvent) => {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    try {
      this.o.host.releasePointerCapture(e.pointerId);
    } catch {}
    this.drag = null;
    this.lastClickBlock = performance.now();
    const s = d.s;
    const st = s.state;
    const { vx, vy } = this.velocity(d);
    const speed = Math.hypot(vx, vy);
    const thrown = !this.o.reduceMotion && speed > 160;

    if (thrown) {
      const k = Math.min(1, 1800 / speed) * 0.32;
      const spin = clamp(vx * 0.00032, -0.8, 0.8);
      const to = this.settle(s, st.x + vx * k, st.y + vy * k, st.rot + spin);
      const dur = clamp(0.42 + speed / 5200, 0.45, 0.95);
      gsap.to(st, { x: to.x, y: to.y, rot: st.rot + spin, duration: dur, ease: "power3.out" });
      gsap.to(st, { tiltX: 0, tiltY: 0, duration: dur, ease: "power2.out" });
      s.landing = gsap.delayedCall(dur * 0.45, () => this.slap(s));
    } else {
      const to = this.settle(s, st.x, st.y, st.rot);
      if (Math.abs(to.x - st.x) > 0.5 || Math.abs(to.y - st.y) > 0.5) {
        // not on the buttons: carry it to the nearest clear spot, then stick it
        gsap.to(st, { x: to.x, y: to.y, duration: 0.45, ease: "power2.inOut" });
        s.landing = gsap.delayedCall(0.3, () => this.slap(s));
      } else this.slap(s);
    }

    const p = this.local(e);
    const over = e.pointerType === "mouse" && !thrown ? this.hit(p.x, p.y) : null;
    this.hover = null;
    s.hoverOn = false;
    if (over) this.o.host.dataset.cursor = "grab";
    else delete this.o.host.dataset.cursor;
  };

  /** Back onto the table: fast in, firm stop, a little squash. No bounce. */
  private slap(s: Sticker) {
    const st = s.state;
    const rm = this.o.reduceMotion;
    s.landing = null;
    gsap.to(st, { lift: 0, duration: rm ? 0.15 : 0.3, ease: "slap", overwrite: "auto" });
    gsap.to(st, { peel: 0, duration: rm ? 0.15 : 0.32, ease: "power2.out", overwrite: "auto" });
    gsap.to(st, { tiltX: 0, tiltY: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    if (rm) gsap.to(st, { scale: 1, duration: 0.15, overwrite: "auto" });
    else
      gsap
        .timeline()
        .to(st, { scale: 0.972, duration: 0.26, ease: "slap", overwrite: "auto" })
        .to(st, { scale: 1, duration: 0.34, ease: "expo.out" });
    s.paTarget = null;
  }

  /* ------------------------------------------------------------ keyboard */

  private onKey(e: KeyboardEvent, s: Sticker) {
    const step = e.shiftKey ? 72 : 24;
    const st = s.state;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toTop(s);
      gsap.to(st, { rot: st.rot + Math.PI / 12, duration: 0.4, ease: "power3.out" });
      gsap.to(st, { lift: 0.4, duration: 0.15, ease: "power2.out", onComplete: () => this.slap(s) });
      s.moved = true;
      this.emitMoved();
      return;
    } else return;
    e.preventDefault();
    this.toTop(s);
    const to = this.settle(s, st.x + dx, st.y + dy, st.rot);
    gsap.to(st, { x: to.x, y: to.y, duration: this.o.reduceMotion ? 0 : 0.28, ease: "power2.out", onUpdate: () => {
        this.dirty = true;
      },
    });
    if (!this.o.reduceMotion) gsap.to(st, { lift: 0.35, duration: 0.12, ease: "power2.out", onComplete: () => this.slap(s) });
    if (!s.moved) {
      s.moved = true;
      this.emitMoved();
    }
  }

  /* ------------------------------------------------------------ reset */

  reset() {
    this.teaseCall?.kill();
    let i = 0;
    for (const s of this.stickers) {
      if (!s.active || !s.moved) continue;
      const st = s.state;
      s.moved = false;
      gsap.killTweensOf(st);
      s.landing?.kill();
      if (this.o.reduceMotion) {
        Object.assign(st, { x: s.home.x, y: s.home.y, rot: s.home.rot, lift: 0, peel: 0, scale: 1, tiltX: 0, tiltY: 0 });
        continue;
      }
      const at = i++ * 0.05;
      gsap.to(st, { lift: 0.7, scale: 1.04, duration: 0.25, delay: at, ease: "power2.out" });
      gsap.to(st, { x: s.home.x, y: s.home.y, rot: s.home.rot, duration: 0.75, delay: at, ease: "power2.inOut" });
      s.landing = gsap.delayedCall(at + 0.55, () => this.slap(s));
    }
    this.emitMoved();
    this.dirty = true;
  }

  private emitMoved() {
    const moved = this.stickers.some((s) => s.active && s.moved);
    if (moved !== this.movedFlag) {
      this.movedFlag = moved;
      this.o.onMovedChange(moved);
    }
  }

  /* ------------------------------------------------------------ frame */

  private tick = (_t: number, deltaMs: number) => {
    const r = this.renderer;
    if (this.destroyed || !this.inView || !r) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    let busy = this.dirty;

    const d = this.drag;
    if (d) {
      const { vx, vy } = this.velocity(d);
      const target = clamp(vx * 0.00042, -0.3, 0.3);
      d.sway += (target - d.sway) * (1 - Math.exp(-dt * 9));
      const st = d.s.state;
      st.rot = d.rot0 + d.sway;
      st.tiltY += (clamp(vx * 0.00028, -0.28, 0.28) - st.tiltY) * (1 - Math.exp(-dt * 8));
      st.tiltX += (clamp(vy * 0.00028, -0.28, 0.28) - st.tiltX) * (1 - Math.exp(-dt * 8));
      busy = true;
    }

    for (const s of this.stickers) {
      if (!s.active) continue;
      if (s.paTarget !== null) {
        const delta = wrap(s.paTarget - s.state.pa);
        if (Math.abs(delta) > 0.001) {
          s.state.pa += delta * (1 - Math.exp(-dt * 12));
          busy = true;
        }
      }
      if (!busy && gsap.isTweening(s.state)) busy = true;
    }
    if (!busy) return;
    this.time += dt;
    this.sync();
    r.render(this.scene, this.camera);
    this.dirty = false;
  };

  private sync() {
    const W = this.W;
    const H = this.H;
    for (const s of this.stickers) {
      if (!s.active) continue;
      const st = s.state;
      const rest = this.k(s);
      const k = rest * st.scale;
      const z = (s.mesh.userData.z as number) ?? 0;

      s.mesh.position.set(st.x - W / 2, H / 2 - st.y, z + st.lift * LIFT);
      s.mesh.rotation.set(-st.tiltX, st.tiltY, -st.rot);
      s.mesh.scale.setScalar(k);

      const u = s.mesh.material.uniforms;
      const c = Math.cos(st.pa);
      const n = Math.sin(st.pa);
      (u.uDir.value as Vector2).set(-c, -n);
      u.uSupport.value = this.support(s, st.pa);
      u.uPeel.value = st.peel;
      u.uRadius.value = st.radius;
      u.uMaxAngle.value = st.curl;
      u.uOpacity.value = st.opacity;
      u.uTime.value = this.time;

      // shadow: tight contact on the table, wide and soft when held
      const L = st.lift;
      const blur = 6 + L * 22;
      const offX = 2.5 + L * 20;
      const offY = 6 + L * 38;
      s.shadow.position.set(st.x + offX - W / 2, H / 2 - (st.y + offY), z - 0.4);
      s.shadow.rotation.set(0, 0, -st.rot);
      s.shadow.scale.setScalar(rest * (1 + L * 0.03));
      const su = s.shadow.material.uniforms;
      const sw = s.art.width + SHADOW_MARGIN * 2;
      const sh = s.art.height + SHADOW_MARGIN * 2;
      (su.uSpread.value as Vector2).set(blur / sw, blur / sh);
      su.uLod.value = Math.log2(Math.max(1, blur * s.texScale * rest * 0.5));
      su.uOpacity.value = (0.55 + L * 0.12) * st.opacity * (1 - Math.min(1, st.peel / 400));

      // keyboard stand-in follows with a transform only (its size is set in layout)
      const pw = s.art.width * rest;
      const ph = s.art.height * rest;
      s.proxy.style.transform = `translate3d(${st.x - pw / 2}px, ${st.y - ph / 2}px, 0) rotate(${st.rot}rad) scale(${st.scale})`;
    }
  }

  /* ------------------------------------------------------------ teardown */

  destroy() {
    this.destroyed = true;
    gsap.ticker.remove(this.tick);
    this.teaseCall?.kill();
    const h = this.o.host;
    h.removeEventListener("pointerdown", this.onDown);
    h.removeEventListener("pointermove", this.onMove);
    h.removeEventListener("pointerup", this.onUp);
    h.removeEventListener("pointercancel", this.onUp);
    h.removeEventListener("pointerleave", this.onLeave);
    h.removeEventListener("touchstart", this.onTouchStart);
    h.removeEventListener("click", this.onClickCapture, true);
    window.removeEventListener("scroll", this.onScroll);
    delete h.dataset.cursor;
    this.ro?.disconnect();
    this.io?.disconnect();
    for (const s of this.stickers) {
      gsap.killTweensOf(s.state);
      s.landing?.kill();
      s.mesh.geometry.dispose();
      s.shadow.geometry.dispose();
      (s.mesh.material.uniforms.map.value as Texture).dispose();
      s.mesh.material.dispose();
      s.shadow.material.dispose();
      s.proxy.remove();
    }
    this.flat.forEach((c) => c.remove());
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
