"use client";

import { LinearFilter, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, SRGBColorSpace, Scene, ShaderMaterial, TextureLoader, Vector2, WebGLRenderer, type Texture } from "three";
import { gsap } from "@/lib/gsap";

/*
 * A curved, endless gallery of product photographs (after React Bits' Circular Gallery, built on
 * three). The photos sit on a strip that bends away from you at both ends; drag or fling it and
 * it coasts, then settles with a product in the middle. It also drifts with the page as you scroll
 * past, and splits its colours slightly when it moves fast. Tap the middle photo to open it, a
 * side photo to bring it to the middle. One canvas, drawn only while it's on screen.
 */

export type GalleryItem = { src: string };

const VERT = /* glsl */ `
  uniform float uBend;
  uniform float uVel;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    // the strip curves away from you (a shallow bowl) ...
    w.z -= w.x * w.x * uBend;
    // ... and ripples a touch when it moves fast, the middle of each photo leading
    w.z += sin(uv.x * 3.14159) * uVel * 0.6;
    w.y += sin(uv.x * 3.14159) * uVel * 0.12;
    w.z += uHover * 0.18;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uVel;
  uniform float uRadius;
  uniform vec2 uSize;
  uniform float uHover;
  varying vec2 vUv;
  // rounded corners, in the plane's own units
  float corner(vec2 uv) {
    vec2 p = (uv - 0.5) * uSize;
    vec2 q = abs(p) - (uSize * 0.5 - uRadius);
    return length(max(q, 0.0)) - uRadius;
  }
  void main() {
    float d = corner(vUv);
    if (d > 0.0) discard;
    // a gentle zoom on hover, and colours that part when it moves fast
    vec2 uv = (vUv - 0.5) * (1.0 - uHover * 0.06) + 0.5;
    float s = clamp(uVel, -1.0, 1.0) * 0.012;
    vec4 c = texture2D(uTex, uv);
    c.r = texture2D(uTex, uv + vec2(s, 0.0)).r;
    c.b = texture2D(uTex, uv - vec2(s, 0.0)).b;
    // a soft edge so the rounded corner isn't jagged
    float a = smoothstep(0.0, -0.012, d);
    gl_FragColor = vec4(c.rgb, a);
    #include <colorspace_fragment>
  }
`;

type Card = { mesh: Mesh; mat: ShaderMaterial; index: number; hover: { v: number } };

export class CurvedGallery {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(40, 1, 0.1, 100);
  private cards: Card[] = [];
  private textures: Texture[] = [];
  private ray = new Raycaster();
  private ptr = new Vector2();
  private W = 1;
  private H = 1;
  /** world units per card step, and the strip's whole length */
  private step = 1;
  private length = 1;
  private cardW = 1;
  private cardH = 1;
  private current = 0;
  private target = 0;
  private vel = 0;
  private drag: { x: number; t: number; start: number; moved: number; id: number } | null = null;
  private lastPageY = 0;
  private visible = false;
  private active = -1;
  private settleTimer = 0;
  private hovered: Card | null = null;
  private cleanup: (() => void)[] = [];
  private reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(
    private host: HTMLElement,
    private items: GalleryItem[],
    private opts: { onActive: (i: number) => void; onTap: (i: number) => void; onReady: () => void },
  ) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = "cg-canvas";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(this.renderer.domElement);
  }

  async init() {
    const loader = new TextureLoader();
    this.textures = await Promise.all(
      this.items.map(
        (it) =>
          new Promise<Texture>((res, rej) =>
            loader.load(
              it.src,
              (t) => {
                t.colorSpace = SRGBColorSpace;
                t.minFilter = LinearFilter;
                t.generateMipmaps = false;
                res(t);
              },
              undefined,
              rej,
            ),
          ),
      ),
    );
    // enough cards to fill the widest screen, the products repeated in order
    const copies = this.items.length < 8 ? 2 : 1;
    const geo = new PlaneGeometry(1, 1, 48, 24);
    for (let c = 0; c < copies; c++)
      this.items.forEach((_, i) => {
        const mat = new ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          uniforms: {
            uTex: { value: this.textures[i] },
            uBend: { value: 0.012 },
            uVel: { value: 0 },
            uHover: { value: 0 },
            uRadius: { value: 0.18 },
            uSize: { value: new Vector2(1, 1) },
          },
        });
        const mesh = new Mesh(geo, mat);
        this.scene.add(mesh);
        this.cards.push({ mesh, mat, index: i, hover: { v: 0 } });
      });
    this.resize();
    this.bind();
    gsap.ticker.add(this.tick);
    this.opts.onReady();
    this.emitActive();
  }

  /** Bring product `i` to the middle (from the chips or the arrows). */
  goTo(i: number) {
    const n = this.items.length;
    const nowIdx = Math.round(this.current / this.step);
    const base = Math.floor(nowIdx / n) * n;
    // the nearest copy of i, either way round
    let best = base + i;
    for (const k of [base + i - n, base + i + n]) if (Math.abs(k - nowIdx) < Math.abs(best - nowIdx)) best = k;
    this.target = best * this.step;
  }

  next(dir: 1 | -1) {
    this.target = (Math.round(this.target / this.step) + dir) * this.step;
  }

  private resize() {
    const r = this.host.getBoundingClientRect();
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.W, this.H, false);
    // 1 world unit = 100 px at z = 0
    this.camera.aspect = this.W / this.H;
    this.camera.position.z = this.H / 100 / 2 / Math.tan((this.camera.fov * Math.PI) / 360);
    this.camera.updateProjectionMatrix();
    const phone = this.W < 640;
    this.cardH = (this.H * (phone ? 0.86 : 0.84)) / 100;
    this.cardW = this.cardH * 0.8; // the photos are 4:5
    this.step = this.cardW + (phone ? 0.32 : 0.5);
    this.length = this.step * this.cards.length;
    const bend = phone ? 0.03 : 0.0065 * (1440 / Math.max(this.W, 900));
    for (const c of this.cards) {
      c.mesh.scale.set(this.cardW, this.cardH, 1);
      c.mat.uniforms.uSize.value.set(this.cardW, this.cardH);
      c.mat.uniforms.uRadius.value = Math.min(this.cardW, this.cardH) * 0.055;
      c.mat.uniforms.uBend.value = bend;
    }
  }

  private bind() {
    const el = this.host;
    const on = <K extends keyof HTMLElementEventMap>(t: K, fn: (e: HTMLElementEventMap[K]) => void, o?: AddEventListenerOptions) => {
      el.addEventListener(t, fn as EventListener, o);
      this.cleanup.push(() => el.removeEventListener(t, fn as EventListener, o));
    };
    on("pointerdown", (e) => {
      if (e.button !== 0) return;
      this.drag = { x: e.clientX, t: performance.now(), start: e.clientX, moved: 0, id: e.pointerId };
      if (e.pointerType === "mouse") el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    });
    on("pointermove", (e) => {
      this.setPointer(e);
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      d.x = e.clientX;
      d.moved += Math.abs(dx);
      this.target -= (dx / 100) * 1.15;
    });
    const up = (e: PointerEvent, cancelled: boolean) => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (!cancelled && d.moved < 6) this.tap();
      else {
        // fling: carry on in the direction of the last movement
        this.target += (this.target - this.current) * 1.4;
        this.settleSoon(260);
      }
    };
    on("pointerup", (e) => up(e, false));
    on("pointercancel", (e) => up(e, true));
    on("pointerleave", () => {
      this.ptr.set(9, 9);
    });
    // a sideways trackpad swipe moves it; up and down scrolls the page as usual
    on(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        this.target += e.deltaX / 100;
        this.settleSoon(180);
      },
      { passive: false },
    );
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(el);
    this.cleanup.push(() => ro.disconnect());
    const io = new IntersectionObserver(([en]) => {
      this.visible = en.isIntersecting;
      this.lastPageY = window.scrollY;
    });
    io.observe(el);
    this.cleanup.push(() => io.disconnect());
  }

  private setPointer(e: PointerEvent) {
    const r = this.host.getBoundingClientRect();
    this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private pick() {
    this.ray.setFromCamera(this.ptr, this.camera);
    // the planes are bent in the shader; picking the flat plane is close enough at the middle
    const hit = this.ray.intersectObjects(this.cards.map((c) => c.mesh))[0];
    return hit ? this.cards.find((c) => c.mesh === hit.object) ?? null : null;
  }

  private tap() {
    const c = this.pick();
    if (!c) return;
    const idx = Math.round((c.mesh.position.x + this.current) / this.step);
    const centre = Math.abs(c.mesh.position.x) < this.step * 0.5;
    if (centre) this.opts.onTap(c.index);
    else this.target = idx * this.step;
  }

  private settleSoon(ms: number) {
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(() => {
      if (!this.drag) this.target = Math.round(this.target / this.step) * this.step;
    }, ms);
  }

  private emitActive() {
    const n = this.items.length;
    const i = (((Math.round(this.current / this.step) % n) + n) % n) as number;
    if (i !== this.active) {
      this.active = i;
      this.opts.onActive(i);
    }
  }

  private tick = () => {
    if (!this.visible) return;
    // the page scrolling past nudges the strip along with it
    const y = window.scrollY;
    const dy = y - this.lastPageY;
    this.lastPageY = y;
    if (!this.drag && !this.reduce && Math.abs(dy) > 0) {
      this.target += dy / 260;
      this.settleSoon(220);
    }
    const prev = this.current;
    this.current += (this.target - this.current) * (this.reduce ? 1 : 0.085);
    const v = this.current - prev;
    this.vel += (v * 2.2 - this.vel) * 0.2;

    const half = this.length / 2;
    const hover = this.drag ? null : this.pick();
    if (hover !== this.hovered) {
      this.hovered = hover;
      if (hover) this.host.dataset.hover = "";
      else delete this.host.dataset.hover;
    }
    for (const [k, c] of this.cards.entries()) {
      // where this card sits on the endless strip
      let x = k * this.step - this.current;
      x = ((((x + half) % this.length) + this.length) % this.length) - half;
      c.mesh.position.x = x;
      c.mat.uniforms.uVel.value = this.vel;
      const h = c === hover ? 1 : 0;
      c.hover.v += (h - c.hover.v) * 0.12;
      c.mat.uniforms.uHover.value = c.hover.v;
    }
    this.emitActive();
    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    for (const off of this.cleanup) off();
    window.clearTimeout(this.settleTimer);
    gsap.ticker.remove(this.tick);
    for (const c of this.cards) c.mat.dispose();
    this.cards[0]?.mesh.geometry.dispose();
    for (const t of this.textures) t.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
