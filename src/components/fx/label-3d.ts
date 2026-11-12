"use client";

import {
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { gsap } from "@/lib/gsap";
import { configureSurface, materialStudio, patchSurface, SURFACE_COLOUR, type EffectSurface } from "./material-surface";
import type { FinishId, ShapeId } from "@/lib/options";
import { cutlinePath, fitCutline, prepareArtwork, type PreparedArtwork } from "@/lib/artwork-outline";

/*
 * The label you are building, in 3D, on its liner: a cream backing sheet with an inch grid, so its
 * size reads at a glance. It has the shape, size, material, finish and artwork you choose, lit by a
 * soft studio so each material reads as it does in the hand (brushed silver and gold, a rainbow on
 * holographic foil, glitter that sparkles, see-through clear film, kraft fibre, gloss or matte
 * laminate). The scene tilts toward the pointer and the light follows it. Hover a label and its
 * corner lifts; drag to peel it off the liner (the fold uses the hero's peel: everything past the
 * fold line wraps round a small cylinder and shows the paper back); let go and it slaps back down.
 * On touch, a tap peels it. Sizes morph; a new shape or material is laid down like a fresh label.
 * It renders only when something changes. Units are inches.
 */

export type Look = "white" | "clear" | "paper" | "kraft" | "silver" | "gold" | "holo" | "glitter";
export type LabelSpec = {
  shape: ShapeId;
  w: number;
  h: number;
  look: Look;
  finish: FinishId;
  /** the artwork: our sample, or the customer's own image (an object URL) */
  art: string;
  /** true for the customer's own artwork, which fills the label; our sample is fitted inside it */
  own: boolean;
};
export type RGB = [number, number, number];

/** The liner's side: a round number of inches comfortably bigger than the label. */
export const spanFor = (w: number, h: number) => {
  const n = Math.max(w, h) * 1.3;
  return n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : n <= 12 ? 12 : n <= 16 ? 16 : 24;
};
/** The size of one grid square on that liner, in inches. */
export const gridFor = (span: number) => (span <= 12 ? 1 : 2);

const FOV = 24;
const TILT = 0.36; // the camera looks down at the liner from a little in front (radians from overhead)
const BACK: RGB = [0.95, 0.94, 0.91];
const TINT: Partial<Record<Look, RGB>> = SURFACE_COLOUR;
const KRAFT: RGB = [190, 146, 98];
const FOIL = new Set<Look>(["silver", "gold", "holo", "glitter"]);
/** On these the material shows wherever the artwork has no ink (its background colour drops out). */
const SHOWS = new Set<Look>(["clear", "kraft", "silver", "gold", "holo", "glitter"]);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
function cnv(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
const ctx = (c: HTMLCanvasElement) => c.getContext("2d", { willReadFrequently: true })!;

/* ---------------------------------------------------------------- shapes */

const cornerR = (shape: ShapeId, w: number, h: number) => Math.min(w, h) * (shape === "rectangle" ? 0.03 : 0.14);
const round = (shape: ShapeId) => shape === "circle" || shape === "oval";

function shapePath(g: CanvasRenderingContext2D, shape: ShapeId, W: number, H: number) {
  g.beginPath();
  if (shape === "circle" || shape === "oval") g.ellipse(W / 2, H / 2, W / 2, H / 2, 0, 0, Math.PI * 2);
  else g.roundRect(0, 0, W, H, cornerR(shape, W, H));
}

/** How far the label reaches from its centre in direction (dx, dy), in inches. */
function reach(shape: ShapeId, w: number, h: number, dx: number, dy: number) {
  const a = w / 2;
  const b = h / 2;
  if (round(shape)) return Math.hypot(a * dx, b * dy);
  const r = cornerR(shape, w, h);
  return (a - r) * Math.abs(dx) + (b - r) * Math.abs(dy) + r;
}

/* ---------------------------------------------------------------- textures */

/** The artwork's background colour: the commonest colour among its solid pixels. */
export function dominant(img: HTMLImageElement): RGB {
  const c = cnv(48, 48);
  const g = ctx(c);
  g.drawImage(img, 0, 0, 48, 48);
  const d = g.getImageData(0, 0, 48, 48).data;
  const bins = new Map<number, number[]>();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 220) continue;
    const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    const b = bins.get(k) ?? [0, 0, 0, 0];
    b[0] += d[i];
    b[1] += d[i + 1];
    b[2] += d[i + 2];
    b[3]++;
    bins.set(k, b);
  }
  let best = [255, 255, 255, 1];
  for (const b of bins.values()) if (b[3] > best[3] || best[3] === 1) best = b;
  return [best[0] / best[3], best[1] / best[3], best[2] / best[3]];
}

/** Paper fibres, as grey values to modulate paper and kraft by. */
export function fibreField() {
  const c = cnv(256, 256);
  const g = ctx(c);
  g.fillStyle = "rgb(128,128,128)";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const a = Math.random() * Math.PI;
    const l = 3 + Math.random() * 9;
    const v = Math.random() < 0.5 ? 70 : 190;
    g.strokeStyle = `rgba(${v},${v},${v},${0.25 + Math.random() * 0.35})`;
    g.lineWidth = 0.5 + Math.random() * 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return g.getImageData(0, 0, 256, 256).data;
}

/**
 * The printed label: its colour (with the shape as alpha) and, for foils, a second map whose red
 * channel is where the foil shows, green the roughness and blue the metalness.
 */
export function compose(spec: LabelSpec, art: HTMLImageElement | null, dom: RGB, fib: Uint8ClampedArray, prepared?: PreparedArtwork | null) {
  const aspect = spec.w / spec.h;
  const L = 1024;
  const W = aspect >= 1 ? L : Math.max(96, Math.round(L * aspect));
  const H = aspect >= 1 ? Math.max(96, Math.round(L / aspect)) : L;
  const look = spec.look;

  const s = cnv(W, H);
  const sg = ctx(s);
  sg.fillStyle = "#fff";
  const cutline = spec.shape === "die-cut" && prepared?.cutline ? fitCutline(prepared.cutline, spec.w, spec.h) : null;
  if (cutline) sg.fill(new Path2D(cutlinePath(cutline, 0, 0, W, H)));
  else {
    shapePath(sg, spec.shape, W, H);
    sg.fill();
  }
  const sa = sg.getImageData(0, 0, W, H).data;

  const a = cnv(W, H);
  const ag = ctx(a);
  if (art) {
    const iw = art.naturalWidth || 1024;
    const ih = art.naturalHeight || 1024;
    if (cutline && prepared) {
      const { crop, inset } = cutline;
      const source = prepared.print;
      ag.drawImage(source, crop.x * source.width, crop.y * source.height, crop.w * source.width, crop.h * source.height, inset.x * W, inset.y * H, inset.w * W, inset.h * H);
    } else {
      const room = spec.own ? 1 : round(spec.shape) ? 0.72 : 0.88;
      const k = spec.own ? Math.max(W / iw, H / ih) : Math.min((W * room) / iw, (H * room) / ih);
      ag.drawImage(art, (W - iw * k) / 2, (H - ih * k) / 2, iw * k, ih * k);
    }
  }
  const ad = ag.getImageData(0, 0, W, H).data;

  const out = new ImageData(W, H);
  const o = out.data;
  const foil = FOIL.has(look);
  const orm = foil ? new ImageData(W, H) : null;
  const m = orm?.data;
  const shows = SHOWS.has(look);
  const [dr, dg, db] = dom;
  const tint = TINT[look] ?? [255, 255, 255];
  const metalRoughness = spec.finish === "matte" ? 0.44 : 0.26;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const shapeA = sa[i + 3] / 255;
      if (shapeA === 0) continue;
      const aa = ad[i + 3] / 255;
      const r = ad[i];
      const g = ad[i + 1];
      const b = ad[i + 2];
      const fv = fib[(((y & 255) << 8) | (x & 255)) * 4] / 255 - 0.5;
      let R: number;
      let G: number;
      let B: number;
      let A = shapeA;
      if (!shows) {
        // white film, vinyl and paper: the artwork prints whole, its background colour included
        const base = spec.own || cutline ? 255 : dr;
        R = base + (r - base) * aa;
        G = (spec.own || cutline ? 255 : dg) + (g - (spec.own || cutline ? 255 : dg)) * aa;
        B = (spec.own || cutline ? 255 : db) + (b - (spec.own || cutline ? 255 : db)) * aa;
        if (look === "paper") {
          const f = 1 + fv * 0.07;
          R *= f;
          G *= f;
          B *= f;
        }
      } else {
        const dist = Math.sqrt((r - dr) ** 2 + (g - dg) ** 2 + (b - db) ** 2) / 441.7;
        // Preserve every colour in uploaded artwork. Background knockout belongs to our sample.
        const ink = spec.own ? aa : aa * smooth(0.07, 0.18, dist);
        if (look === "kraft") {
          // ink on kraft: the brown shows through, the colours print over it
          const f = 1 + fv * 0.22;
          R = KRAFT[0] * f * (1 - ink + (ink * r) / 255);
          G = KRAFT[1] * f * (1 - ink + (ink * g) / 255);
          B = KRAFT[2] * f * (1 - ink + (ink * b) / 255);
        } else if (look === "clear") {
          R = 250 + (r - 250) * ink;
          G = 252 + (g - 252) * ink;
          B = 255 + (b - 255) * ink;
          A = shapeA * Math.max(0.13, ink);
        } else {
          R = tint[0] + (r - tint[0]) * ink;
          G = tint[1] + (g - tint[1]) * ink;
          B = tint[2] + (b - tint[2]) * ink;
        }
        if (m) {
          const show = 1 - ink;
          const rough = look === "holo" ? 0.23 : look === "glitter" ? 0.3 : metalRoughness;
          m[i] = 255 * show;
          m[i + 1] = 255 * (rough * show + 0.55 * ink);
          m[i + 2] = 255 * show * (look === "glitter" ? 0.8 : 1);
          m[i + 3] = 255;
        }
      }
      o[i] = R;
      o[i + 1] = G;
      o[i + 2] = B;
      o[i + 3] = 255 * A;
    }
  }
  const mapC = cnv(W, H);
  mapC.getContext("2d")!.putImageData(out, 0, 0);
  let ormC: HTMLCanvasElement | null = null;
  if (orm) {
    ormC = cnv(W, H);
    ormC.getContext("2d")!.putImageData(orm, 0, 0);
  }
  return { map: mapC, orm: ormC };
}

/** The liner: cream backing paper with an inch grid and inch numbers along two edges. */
function linerCanvas(span: number) {
  const P = 1024;
  const c = cnv(P, P);
  const g = c.getContext("2d")!;
  g.fillStyle = "#fbf8f1";
  g.fillRect(0, 0, P, P);
  const px = P / span;
  const major = gridFor(span);
  const minor = span <= 8 ? major / 2 : 0;
  const line = (v: number, alpha: number, width: number) => {
    g.strokeStyle = `rgba(13,13,12,${alpha})`;
    g.lineWidth = width;
    g.beginPath();
    g.moveTo(v * px, 0);
    g.lineTo(v * px, P);
    g.moveTo(0, v * px);
    g.lineTo(P, v * px);
    g.stroke();
  };
  if (minor) for (let v = minor; v < span; v += major) line(v, 0.06, 1.5);
  for (let v = major; v < span; v += major) line(v, 0.15, 2.5);
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim() || "Arial";
  const size = Math.round(Math.min(26, px * major * 0.2));
  g.fillStyle = "rgba(13,13,12,0.5)";
  g.font = `700 ${size}px ${sans}, Arial, sans-serif`;
  g.textBaseline = "top";
  for (let v = major; v < span; v += major) {
    g.fillText(String(v), v * px + 6, 8);
    g.fillText(String(v), 8, v * px + 6);
  }
  g.strokeStyle = "rgba(13,13,12,0.18)";
  g.lineWidth = 4;
  g.strokeRect(2, 2, P - 4, P - 4);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A soft shadow for the liner to lie on. */
function shadowTexture() {
  const c = cnv(256, 256);
  const g = c.getContext("2d")!;
  g.shadowColor = "#fff";
  g.shadowBlur = 28;
  g.shadowOffsetX = 1000;
  g.fillRect(34 - 1000, 34, 188, 188);
  return new CanvasTexture(c);
}

/* ---------------------------------------------------------------- the shader patch */

const PEEL_VERTEX_HEAD = /* glsl */ `
uniform vec2 uSize;
uniform vec2 uDir;
uniform float uSupport;
uniform float uPeel;
uniform float uRadius;
uniform float uMaxAngle;
varying float vPeelT;
`;
// replaces <beginnormal_vertex>: the peeled position and its normal, used again in <begin_vertex>
const PEEL_VERTEX = /* glsl */ `
vec3 lbPos = vec3(position.xy * uSize, position.z);
vec3 objectNormal = vec3(0.0, 0.0, 1.0);
#ifdef USE_TANGENT
  vec3 objectTangent = vec3(1.0, 0.0, 0.0);
#endif
{
  float t = dot(lbPos.xy, uDir) + uSupport;
  vPeelT = t;
  float u = uPeel - t;
  if (u > 0.0) {
    vec2 e = -uDir;
    vec2 fold = lbPos.xy + uDir * u;
    float arcMax = uRadius * uMaxAngle;
    float th = min(u / uRadius, uMaxAngle);
    vec3 p = vec3(fold + e * (uRadius * sin(th)), uRadius * (1.0 - cos(th)));
    if (u > arcMax) p += vec3(cos(th) * e, sin(th)) * (u - arcMax);
    lbPos = p;
    objectNormal = vec3(-sin(th) * e, cos(th));
    #ifdef USE_TANGENT
      objectTangent = vec3(vec2(1.0, 0.0) + e * (cos(th) - 1.0) * e.x, sin(th) * e.x);
    #endif
  }
}
`;
const PEEL_FRAGMENT_HEAD = /* glsl */ `
uniform vec3 uBack;
uniform float uPeel;
uniform float uRadius;
varying float vPeelT;
`;
const PEEL_FRAGMENT = /* glsl */ `
#ifndef LB_CLEAR
if (!gl_FrontFacing) diffuseColor.rgb = uBack;
#endif
{
  // the lifted flap shades the label just beyond the fold
  float d = vPeelT - uPeel;
  if (uPeel > 0.001 && d > 0.0) diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(uRadius * 2.6, 0.0, d);
}
`;

/* ---------------------------------------------------------------- the scene */

type Art = { img: HTMLImageElement | null; dom: RGB; prepared: PreparedArtwork | null };
const specKey = (s: LabelSpec) => `${s.shape}|${s.look}|${s.finish}|${s.art}|${s.own}|${(s.w / s.h).toFixed(3)}`;

export class Label3D {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.5, 600);
  private key = new DirectionalLight(0xfff6ea, 1.1);
  private environmentTarget: ReturnType<typeof materialStudio>;
  private label: Mesh<PlaneGeometry, MeshPhysicalMaterial>;
  private liner: Mesh<PlaneGeometry, MeshStandardMaterial>;
  private shade: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private textures: Texture[] = [];
  private outline: PreparedArtwork["cutline"] = null;
  private fib = fibreField();
  private arts = new Map<string, Promise<Art>>();
  private u = {
    uSize: { value: new Vector2(3, 2) },
    uDir: { value: new Vector2(-Math.SQRT1_2, Math.SQRT1_2) },
    uSupport: { value: 1 },
    uPeel: { value: 0 },
    uRadius: { value: 0.12 },
    uMaxAngle: { value: 2.7 },
    uBack: { value: new Color(...BACK) },
  };
  private s = { w: 3, h: 2, span: 4, yaw: 0, pitch: 0, lx: -0.4, ly: 0.5 };
  private spec: LabelSpec | null = null;
  private drawn = "";
  private linerSpan = 0;
  private corner = new Vector2(1, -1);
  private wanted: Vector2 | null = null;
  private drag: { id: number; start: Vector3; peel: number; moved: boolean; touch: boolean; x: number; y: number } | null = null;
  private hovering = false;
  private visible = true;
  private dirty = true;
  private composeTimer = 0;
  private cleanup: (() => void)[] = [];
  private ray = new Raycaster();
  private plane = new Plane(new Vector3(0, 0, 1), 0);
  private reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private destroyed = false;

  constructor(private host: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.domElement.className = "l3d-canvas";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(this.renderer.domElement);

    this.environmentTarget = materialStudio(this.renderer);
    this.scene.environment = this.environmentTarget.texture;
    this.scene.environmentIntensity = 0.8;
    this.key.position.set(-3, 4, 8);
    this.scene.add(this.key);

    this.shade = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowTexture(), color: "#050c3a", transparent: true, opacity: 0.55, depthWrite: false }));
    this.shade.position.z = -0.05;
    this.liner = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial({ roughness: 0.92, metalness: 0, envMapIntensity: 0.45 }));
    this.label = new Mesh(new PlaneGeometry(1, 1, 96, 96), new MeshPhysicalMaterial());
    // Explicit tangents keep the foil reflections consistent on wide and tall labels.
    this.label.geometry.computeTangents();
    this.label.position.z = 0.004;
    this.label.renderOrder = 2;
    this.scene.add(this.shade, this.liner, this.label);
  }

  async init(spec: LabelSpec) {
    this.spec = { ...spec };
    this.s.w = spec.w;
    this.s.h = spec.h;
    this.s.span = spanFor(spec.w, spec.h);
    this.applySize();
    this.resize();
    this.bind();
    await this.compose(spec);
    if (this.destroyed) return;
    await this.renderer.compileAsync(this.scene, this.camera).catch(() => undefined);
    gsap.ticker.add(this.tick);
    // laid down like a fresh label: it arrives peeled half up and slaps onto the liner
    if (!this.reduce) {
      this.u.uPeel.value = this.maxPeel() * 0.55;
      gsap.to(this.u.uPeel, { value: 0, duration: 0.9, delay: 0.1, ease: "slap", onUpdate: this.bump });
    }
    this.bump();
  }

  /** Show a new spec: sizes morph, a new shape, material or artwork is laid down fresh. */
  set(spec: LabelSpec) {
    const prev = this.spec;
    if (!prev) return;
    this.spec = { ...spec };
    if (spec.w !== prev.w || spec.h !== prev.h) {
      const span = spanFor(spec.w, spec.h);
      gsap.to(this.s, { w: spec.w, h: spec.h, span, duration: this.reduce ? 0 : 0.7, ease: "expo.out", overwrite: "auto", onUpdate: () => this.applySize() });
    }
    const relay = spec.shape !== prev.shape || spec.look !== prev.look || spec.art !== prev.art || spec.own !== prev.own;
    const restyle = relay || spec.finish !== prev.finish || Math.abs(spec.w / spec.h - prev.w / prev.h) > 0.01;
    if (!restyle) return;
    window.clearTimeout(this.composeTimer);
    this.composeTimer = window.setTimeout(() => {
      if (relay && !this.reduce && !this.drag) {
        // lift the label, swap it at the top, slap the new one down
        gsap.killTweensOf(this.u.uPeel);
        gsap
          .timeline({ onUpdate: this.bump })
          .to(this.u.uPeel, { value: this.maxPeel() * 0.42, duration: 0.28, ease: "power2.out" })
          .add(() => void this.compose(spec))
          .to(this.u.uPeel, { value: 0, duration: 0.7, ease: "slap" }, "+=0.05");
      } else {
        void this.compose(spec);
        if (spec.finish !== prev.finish) this.sweep();
      }
    }, 140);
  }

  /** A light passing over the label, so a new finish shows itself. */
  private sweep() {
    if (this.reduce) return;
    gsap.fromTo(this.s, { lx: -1.2, ly: 0.9 }, { lx: 0.9, ly: -0.2, duration: 1.1, ease: "power2.inOut", onUpdate: this.bump });
  }

  private load(src: string): Promise<Art> {
    let p = this.arts.get(src);
    if (!p) {
      // The latest artwork is all the scene needs; do not retain replaced upload bitmaps.
      this.arts.clear();
      p = prepareArtwork(src).then((prepared): Art => ({ img: prepared.img, dom: dominant(prepared.img), prepared }), (): Art => ({ img: null, dom: [255, 255, 255], prepared: null }));
      this.arts.set(src, p);
    }
    return p;
  }

  private async compose(spec: LabelSpec) {
    const key = specKey(spec);
    if (!this.spec || specKey(this.spec) !== key) return;
    if (key === this.drawn) return;
    const art = await this.load(spec.art);
    if (this.destroyed || !this.spec || specKey(this.spec) !== key) return;
    this.drawn = key;
    this.outline = spec.shape === "die-cut" && art.prepared?.cutline ? fitCutline(art.prepared.cutline, spec.w, spec.h) : null;
    this.setDir(this.corner);
    const { map, orm } = compose(spec, art.img, art.dom, this.fib, art.prepared);
    const old = this.label.material;
    for (const t of this.textures) t.dispose();
    this.textures = [];

    const mapT = new CanvasTexture(map);
    mapT.colorSpace = SRGBColorSpace;
    mapT.anisotropy = 8;
    this.textures.push(mapT);
    let ormT: CanvasTexture | null = null;
    if (orm) {
      ormT = new CanvasTexture(orm);
      ormT.anisotropy = 8;
      this.textures.push(ormT);
    }

    const look = spec.look;
    const clear = look === "clear";
    const gloss = spec.finish === "gloss";
    const matte = spec.finish === "matte";
    const m = new MeshPhysicalMaterial({
      map: mapT,
      side: DoubleSide,
      // blended edges (smooth on every GPU); it only ever lies over the opaque liner
      transparent: true,
      alphaTest: 0.02,
      // gloss and matte as the surface's own sheen: a clearcoat layer reflected the studio as a
      // white veil over the print, so the shine comes from the light that follows the pointer
      roughness: look === "paper" || look === "kraft" ? 0.95 : gloss ? 0.44 : matte ? 0.72 : 0.6,
      metalness: 0,
      specularIntensity: gloss ? 0.35 : 0.22,
      envMapIntensity: 0.5,
    });
    if (clear) {
      m.defines = { LB_CLEAR: "" };
      m.roughness = 0.42;
    }
    if (ormT) {
      m.roughnessMap = ormT;
      m.metalnessMap = ormT;
      m.roughness = 1;
      m.metalness = 1;
      m.envMapIntensity = 1;
      m.specularIntensity = 1;
      configureSurface(m, look as EffectSurface, matte);
      if (look === "holo") {
        m.iridescence = 0.9;
        m.iridescenceMap = ormT;
        m.iridescenceIOR = 1.8;
        m.iridescenceThicknessRange = [160, 820];
      }
    }
    m.onBeforeCompile = (sh) => {
      this.patch(sh);
      if (ormT) {
        patchSurface(sh, look as EffectSurface, ormT, spec.w, spec.h);
        sh.uniforms.uSubstrateSize = this.u.uSize;
      }
    };
    m.customProgramCacheKey = () => `lb-label-${look}`;
    this.label.material = m;
    old.dispose();
    this.bump();
  }

  private patch = (sh: WebGLProgramParametersWithUniforms) => {
    Object.assign(sh.uniforms, this.u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${PEEL_VERTEX_HEAD}`)
      .replace("#include <beginnormal_vertex>", PEEL_VERTEX)
      .replace("#include <begin_vertex>", "vec3 transformed = lbPos;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${PEEL_FRAGMENT_HEAD}`)
      .replace("#include <map_fragment>", `#include <map_fragment>\n${PEEL_FRAGMENT}`)
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nif (!gl_FrontFacing) metalnessFactor = 0.0;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nif (!gl_FrontFacing) roughnessFactor = 0.85;");
  };

  /* -------------------------------------------------------------- size and camera */

  private applySize() {
    const { w, h, span } = this.s;
    this.u.uSize.value.set(w, h);
    this.u.uRadius.value = clamp(Math.min(w, h) * 0.07, 0.06, 0.45);
    this.setDir(this.corner);
    this.liner.scale.set(span, span, 1);
    this.shade.scale.set(span * 1.22, span * 1.22, 1);
    this.shade.position.set(span * 0.025, -span * 0.05, -0.05);
    const target = spanFor(this.spec?.w ?? w, this.spec?.h ?? h);
    if (target !== this.linerSpan) {
      this.linerSpan = target;
      const prev = this.liner.material.map;
      this.liner.material.map = linerCanvas(target);
      this.liner.material.needsUpdate = true;
      prev?.dispose();
    }
    this.place();
  }

  /** Peel from corner (sx, sy): the fold travels from that corner towards the centre. */
  private setDir(c: Vector2) {
    const { w, h } = this.s;
    const d = new Vector2(-c.x * w, -c.y * h).normalize();
    this.u.uDir.value.copy(d);
    this.u.uSupport.value = this.spec?.shape === "die-cut" && this.outline
      ? Math.max(...this.outline.points.map(([x, y]) => -((x - 0.5) * w * d.x + (0.5 - y) * h * d.y)))
      : reach(this.spec?.shape ?? "rectangle", w, h, -d.x, -d.y);
  }

  private maxPeel() {
    return this.u.uSupport.value * 2 * 0.82;
  }

  private place() {
    const r = this.host.getBoundingClientRect();
    const aspect = Math.max(0.2, r.width / Math.max(1, r.height));
    const t = Math.tan((FOV * Math.PI) / 360);
    const half = this.s.span * 0.8;
    const d = Math.max(half / t, half / (t * aspect));
    const pitch = TILT + this.s.pitch;
    const yaw = this.s.yaw;
    this.camera.position.set(d * Math.sin(pitch) * Math.sin(yaw), -d * Math.sin(pitch) * Math.cos(yaw), d * Math.cos(pitch));
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(0, -this.s.span * 0.02, 0);
    this.scene.environmentRotation.set(this.s.pitch * 0.35, this.s.yaw * 0.5, this.s.yaw * 0.7);
    this.key.position.set(this.s.lx * 8, this.s.ly * 8, 8);
    this.bump();
  }

  private resize() {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.place();
  }

  /* -------------------------------------------------------------- pointer */

  /** Where the pointer meets the liner, in inches from the centre. */
  private at(e: { clientX: number; clientY: number }) {
    const r = this.host.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    return this.ray.ray.intersectPlane(this.plane, new Vector3());
  }

  private inside(p: Vector3) {
    const a = this.s.w / 2;
    const b = this.s.h / 2;
    const shape = this.spec?.shape ?? "rectangle";
    if (shape === "die-cut" && this.outline) {
      const x = p.x / this.s.w + 0.5;
      const y = 0.5 - p.y / this.s.h;
      const points = this.outline.points;
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }
    return round(shape) ? (p.x / a) ** 2 + (p.y / b) ** 2 <= 1.02 : Math.abs(p.x) <= a * 1.02 && Math.abs(p.y) <= b * 1.02;
  }

  /** Lift the corner nearest the pointer a little (dropping the old one first if it changes). */
  private tease(p: Vector3 | null) {
    const target = p ? new Vector2(p.x >= 0 ? 1 : -1, p.y >= 0 ? 1 : -1) : null;
    this.wanted = target;
    const lift = Math.min(this.s.w, this.s.h) * 0.12 + 0.05;
    gsap.killTweensOf(this.u.uPeel);
    if (!target) {
      gsap.to(this.u.uPeel, { value: 0, duration: 0.45, ease: "slap", onUpdate: this.bump });
      return;
    }
    if (target.equals(this.corner) || this.u.uPeel.value < 0.01) {
      this.corner.copy(target);
      this.setDir(this.corner);
      gsap.to(this.u.uPeel, { value: lift, duration: 0.45, ease: "peel", onUpdate: this.bump });
      return;
    }
    gsap
      .timeline({ onUpdate: this.bump })
      .to(this.u.uPeel, { value: 0, duration: 0.16, ease: "power2.in" })
      .add(() => {
        this.corner.copy(target);
        this.setDir(this.corner);
      })
      .to(this.u.uPeel, { value: lift, duration: 0.4, ease: "peel" });
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
        const dv = new Vector2(p.x - d.start.x, p.y - d.start.y);
        const along = dv.dot(this.u.uDir.value);
        // the fold travels half as far as the corner you're pulling
        this.u.uPeel.value = clamp(d.peel + Math.max(along, dv.length() * 0.6) * 0.5, 0, this.maxPeel());
        d.moved = true;
        this.bump();
        return;
      }
      if (e.pointerType !== "mouse") return;
      // the scene leans toward the pointer and the light follows it
      gsap.to(this.s, { yaw: nx * 0.16, pitch: -ny * 0.08, lx: nx * 0.9, ly: -ny * 0.7 + 0.2, duration: this.reduce ? 0 : 0.9, ease: "power3.out", overwrite: "auto", onUpdate: () => this.place() });
      const p = this.at(e);
      const over = Boolean(p && this.inside(p));
      if (over) {
        const c = new Vector2(p!.x >= 0 ? 1 : -1, p!.y >= 0 ? 1 : -1);
        if (!this.hovering || !this.wanted?.equals(c)) this.tease(p);
        el.dataset.over = "";
      } else {
        if (this.hovering) this.tease(null);
        delete el.dataset.over;
      }
      this.hovering = over;
    });
    on("pointerleave", () => {
      if (this.drag) return;
      if (this.hovering) this.tease(null);
      this.hovering = false;
      this.wanted = null;
      delete el.dataset.over;
      gsap.to(this.s, { yaw: 0, pitch: 0, lx: -0.4, ly: 0.5, duration: 1.2, ease: "power3.out", overwrite: "auto", onUpdate: () => this.place() });
    });
    on("pointerdown", (e) => {
      if (e.button !== 0) return;
      const p = this.at(e);
      if (!p || !this.inside(p)) return;
      const touch = e.pointerType !== "mouse";
      gsap.killTweensOf(this.u.uPeel);
      if (!touch) {
        if (this.u.uPeel.value < 0.01) {
          this.corner.set(p.x >= 0 ? 1 : -1, p.y >= 0 ? 1 : -1);
          this.setDir(this.corner);
        }
        el.setPointerCapture(e.pointerId);
        el.dataset.peeling = "";
      }
      this.drag = { id: e.pointerId, start: p, peel: this.u.uPeel.value, moved: false, touch, x: e.clientX, y: e.clientY };
    });
    const up = (e: PointerEvent) => {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      delete el.dataset.peeling;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (d.touch) {
        if (d.moved || e.type === "pointercancel") return;
        // a tap: peel it halfway up from the nearest corner, then let it slap back
        const p = this.at(e);
        if (p) {
          this.corner.set(p.x >= 0 ? 1 : -1, p.y >= 0 ? 1 : -1);
          this.setDir(this.corner);
        }
        gsap
          .timeline({ onUpdate: this.bump })
          .to(this.u.uPeel, { value: this.maxPeel() * 0.5, duration: this.reduce ? 0 : 0.5, ease: "peel" })
          .to(this.u.uPeel, { value: 0, duration: this.reduce ? 0 : 0.6, ease: "slap" }, "+=0.35");
        return;
      }
      // let go: it slaps back onto the liner, or settles at the little lift if you only clicked
      gsap.to(this.u.uPeel, { value: this.hovering && !d.moved ? Math.min(this.s.w, this.s.h) * 0.12 + 0.05 : 0, duration: this.reduce ? 0 : 0.6, ease: "slap", onUpdate: this.bump });
      if (d.moved) this.hovering = false;
    };
    on("pointerup", up);
    on("pointercancel", up);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(el);
    this.cleanup.push(() => ro.disconnect());
    const io = new IntersectionObserver(([en]) => {
      this.visible = en.isIntersecting;
      if (this.visible) this.bump();
    });
    io.observe(el);
    this.cleanup.push(() => io.disconnect());
  }

  /** The label as it looks now, as an image (for the picture that flies into the cart). */
  snapshot() {
    try {
      this.renderer.render(this.scene, this.camera);
      return this.renderer.domElement.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  private bump = () => {
    this.dirty = true;
  };

  private tick = () => {
    if (!this.visible || !this.dirty) return;
    this.dirty = false;
    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    this.destroyed = true;
    window.clearTimeout(this.composeTimer);
    for (const off of this.cleanup) off();
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf(this.u.uPeel);
    gsap.killTweensOf(this.s);
    for (const t of this.textures) t.dispose();
    this.arts.clear();
    this.label.geometry.dispose();
    this.label.material.dispose();
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
