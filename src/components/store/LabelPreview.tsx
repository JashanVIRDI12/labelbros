"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { inch, MATERIALS, type FinishId, type MaterialId, type ShapeId } from "@/lib/options";
import { cutlinePath, fitCutline, prepareArtwork, type PreparedArtwork } from "@/lib/artwork-outline";

/*
 * The label as you build it, drawn to scale on an inch grid: its shape and size (it morphs to
 * every change), the material it's printed on, and the artwork (their own file when it's an
 * image, else our sample, marked as such). Width and height are marked on its edges.
 */

type Props = {
  shape: ShapeId;
  w: number;
  h: number;
  material: MaterialId;
  finish?: FinishId;
  /** an uploaded image, as an object URL */
  art?: string | null;
  /** our sample artwork, when they haven't uploaded an image */
  sample?: string;
  className?: string;
};

const nice = (n: number) => (n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : n <= 12 ? 12 : n <= 16 ? 16 : 24);

/** A rounded rectangle with corner radii rx × ry (an ellipse when they are half the sides). */
function roundRect(x: number, y: number, w: number, h: number, rx: number, ry: number) {
  rx = Math.min(rx, w / 2);
  ry = Math.min(ry, h / 2);
  return `M${x + rx},${y}H${x + w - rx}A${rx},${ry} 0 0 1 ${x + w},${y + ry}V${y + h - ry}A${rx},${ry} 0 0 1 ${x + w - rx},${y + h}H${x + rx}A${rx},${ry} 0 0 1 ${x},${y + h - ry}V${y + ry}A${rx},${ry} 0 0 1 ${x + rx},${y}Z`;
}

/** The corner radii each shape has, in inches. */
const radii = (shape: ShapeId, w: number, h: number) => {
  switch (shape) {
    case "circle":
    case "oval":
      return { rx: w / 2, ry: h / 2 };
    case "rounded":
    case "square":
      return { rx: Math.min(w, h) * 0.14, ry: Math.min(w, h) * 0.14 };
    case "rectangle":
      return { rx: Math.min(w, h) * 0.03, ry: Math.min(w, h) * 0.03 };
    default:
      return { rx: Math.min(w, h) * 0.3, ry: Math.min(w, h) * 0.3 };
  }
};

export function LabelPreview({ shape, w, h, material, finish = "gloss", art, sample, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const span = nice(Math.max(w, h) * 1.3);
  const step = span > 12 ? 2 : span > 6 ? 1 : 0.5;
  const path = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const cut = useRef<SVGPathElement>(null);
  const state = useRef({ w, h, rx: radii(shape, w, h).rx, ry: radii(shape, w, h).ry });
  const look = MATERIALS[material].look;
  const src = art || sample;
  const [asset, setAsset] = useState<{ src: string; prepared: PreparedArtwork; url: string } | null>(null);
  const prepared = asset && asset.src === src ? asset.prepared : null;
  const outline = useMemo(() => shape === "die-cut" && prepared?.cutline ? fitCutline(prepared.cutline, w, h) : null, [shape, prepared, w, h]);

  useEffect(() => {
    if (shape !== "die-cut" || !src) return;
    let cancelled = false;
    prepareArtwork(src).then((prepared) => {
      if (!cancelled) setAsset({ src, prepared, url: prepared.print.toDataURL("image/png") });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [shape, src]);

  const draw = (s: { w: number; h: number; rx: number; ry: number }) => {
    const x = (span - s.w) / 2;
    const y = (span - s.h) / 2;
    const d = outline ? cutlinePath(outline, x, y, s.w, s.h) : roundRect(x, y, s.w, s.h, s.rx, s.ry);
    path.current?.setAttribute("d", d);
    clip.current?.setAttribute("d", d);
    cut.current?.setAttribute("d", d);
  };

  // the first frame is drawn at once; every change after that morphs
  useLayoutEffect(() => {
    draw(state.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const to = { w, h, ...radii(shape, w, h) };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      Object.assign(state.current, to);
      draw(state.current);
      return;
    }
    const tween = gsap.to(state.current, { ...to, duration: 0.55, ease: "expo.out", onUpdate: () => draw(state.current) });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, shape, span, outline]);

  const x = (span - w) / 2;
  const y = (span - h) / 2;
  const lines = [];
  for (let v = step; v < span; v += step) lines.push(v);
  const pad = Math.min(w, h) * 0.08;
  const imageW = outline ? outline.inset.w * w / outline.crop.w : Math.max(0.1, w - pad * 2);
  const imageH = outline ? outline.inset.h * h / outline.crop.h : Math.max(0.1, h - pad * 2);
  const imageX = outline ? x + outline.inset.x * w - outline.crop.x * imageW : x + pad;
  const imageY = outline ? y + outline.inset.y * h - outline.crop.y * imageH : y + pad;

  return (
    <figure className={`lp ${className}`} data-look={look}>
      <svg viewBox={`${-span * 0.08} ${-span * 0.08} ${span * 1.16} ${span * 1.16}`} role="img" aria-label={`Preview: ${inch(w)} by ${inch(h)} inch ${shape} label`}>
        <defs>
          <clipPath id={`c${uid}`}>
            <path ref={clip} />
          </clipPath>
          <pattern id={`k${uid}`} width={span / 24} height={span / 24} patternUnits="userSpaceOnUse">
            <rect width={span / 24} height={span / 24} fill="#f4f1ea" />
            <rect width={span / 48} height={span / 48} fill="#e3ddd0" />
            <rect x={span / 48} y={span / 48} width={span / 48} height={span / 48} fill="#e3ddd0" />
          </pattern>
          <linearGradient id={`s${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#737b86" />
            <stop offset="0.24" stopColor="#c5cbd2" />
            <stop offset="0.42" stopColor={finish === "matte" ? "#dde0e4" : "#fafcff"} />
            <stop offset="0.57" stopColor="#9da5af" />
            <stop offset="0.77" stopColor="#e6eaee" />
            <stop offset="1" stopColor="#87909b" />
          </linearGradient>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#89601e" />
            <stop offset="0.24" stopColor="#cfa342" />
            <stop offset="0.42" stopColor={finish === "matte" ? "#e8cb83" : "#fff0bc"} />
            <stop offset="0.57" stopColor="#ac7c26" />
            <stop offset="0.77" stopColor="#efd28b" />
            <stop offset="1" stopColor="#a47322" />
          </linearGradient>
          <linearGradient id={`h${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd6f5" />
            <stop offset="0.3" stopColor="#c9f1ff" />
            <stop offset="0.6" stopColor="#fff6b8" />
            <stop offset="1" stopColor="#d8c9ff" />
          </linearGradient>
          <pattern id={`f${uid}`} width={span / 4} height={span / 4} patternUnits="userSpaceOnUse">
            <rect width={span / 4} height={span / 4} fill="#c8bfd7" />
            <image href="/textures/glitter-grain.svg" width={span / 4} height={span / 4} opacity="0.65" />
          </pattern>
        </defs>

        {/* the mat: an inch grid */}
        <rect x={0} y={0} width={span} height={span} className="lp-mat" rx={span * 0.02} />
        {lines.map((v) => (
          <g key={v} className={Number.isInteger(v) ? "lp-grid lp-grid-in" : "lp-grid"}>
            <line x1={v} y1={0} x2={v} y2={span} />
            <line x1={0} y1={v} x2={span} y2={v} />
          </g>
        ))}

        {/* the label */}
        <path
          ref={path}
          className="lp-label"
          style={{ fill: look === "clear" ? `url(#k${uid})` : look === "silver" ? `url(#s${uid})` : look === "gold" ? `url(#g${uid})` : look === "holo" ? `url(#h${uid})` : look === "glitter" ? `url(#f${uid})` : undefined }}
        />
        {src && (
          <g clipPath={`url(#c${uid})`}>
            <image href={outline && asset ? asset.url : src} x={imageX} y={imageY} width={imageW} height={imageH} preserveAspectRatio={outline ? "none" : art ? "xMidYMid slice" : "xMidYMid meet"} className="lp-art" style={art ? { mixBlendMode: "normal", opacity: 1 } : undefined} opacity={art ? 1 : 0.92} />
          </g>
        )}
        <path ref={cut} className="lp-cut" />

        {/* its size, marked on the edges */}
        <g className="lp-dim">
          <line x1={x} y1={-span * 0.035} x2={x + w} y2={-span * 0.035} />
          <line x1={x} y1={-span * 0.05} x2={x} y2={-span * 0.02} />
          <line x1={x + w} y1={-span * 0.05} x2={x + w} y2={-span * 0.02} />
          <text x={span / 2} y={-span * 0.05} textAnchor="middle" style={{ fontSize: span * 0.038 }}>
            {inch(w)} in
          </text>
          <line x1={span * 1.035} y1={y} x2={span * 1.035} y2={y + h} />
          <line x1={span * 1.02} y1={y} x2={span * 1.05} y2={y} />
          <line x1={span * 1.02} y1={y + h} x2={span * 1.05} y2={y + h} />
          <text x={span * 1.06} y={span / 2} textAnchor="middle" dominantBaseline="hanging" transform={`rotate(90 ${span * 1.06} ${span / 2})`} style={{ fontSize: span * 0.038 }}>
            {inch(h)} in
          </text>
        </g>
      </svg>
      <figcaption className="lp-cap">
        Grid squares are {step === 0.5 ? "½ inch" : step === 1 ? "1 inch" : "2 inches"}. {art ? "Your artwork" : "Sample artwork"}, shown to scale.
      </figcaption>
    </figure>
  );
}
