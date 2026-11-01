"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { PeachArt } from "./peach";
import {
  CENTER,
  CX,
  CY,
  DEFAULT_QUOTE,
  MAT_X,
  MAT_Y,
  PPI,
  STACK,
  VIEW_H,
  VIEW_W,
  dimsFor,
  view,
  FINISHES,
  PRODUCTS,
  QUANTITIES,
  SHAPES,
  SIZES,
  dimensions,
  summary,
  type Quote,
  type Shape,
  type View,
} from "./pricing-model";

/*
 * "Get your price": a quote builder whose preview is to scale. Every square on the mat is an
 * inch; the sticker morphs between shapes, grows with the size, stacks up with the quantity and
 * catches the light for the finish. The motion code (GSAP + MorphSVG) loads when the section
 * gets close; until then changes apply instantly.
 */

type Motion = { update: (v: View) => void; pointer: (x: number) => void; destroy: () => void };

function ShapeIcon({ shape }: { shape: Shape }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {shape === "die-cut" && <path {...common} d="M6 3.5c3-2 8.5-1.5 9 1.5.4 2.2-1.6 2.6-1 5 .6 2.8-2 5.5-5.5 5.5S2.2 13 2.6 9.6C2.9 7 4.2 4.7 6 3.5Z" />}
      {shape === "circle" && <circle {...common} cx="9" cy="9" r="6.6" />}
      {shape === "square" && <rect {...common} x="2.6" y="2.6" width="12.8" height="12.8" rx="2.4" />}
      {shape === "rectangle" && <rect {...common} x="1.8" y="4.6" width="14.4" height="8.8" rx="2" />}
    </svg>
  );
}

function Options<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  icon,
}: {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  icon?: (id: T) => React.ReactNode;
}) {
  return (
    <fieldset className="quote-field">
      <legend>{legend}</legend>
      <div className="chips">
        {options.map((o) => (
          <label key={String(o.id)} className="chip">
            <input type="radio" name={name} value={String(o.id)} checked={o.id === value} onChange={() => onChange(o.id)} />
            <span>
              {icon?.(o.id)}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const INITIAL = view(DEFAULT_QUOTE);
const INITIAL_DIMS = dimsFor(INITIAL);

export function Pricing() {
  const [q, setQ] = useState<Quote>(DEFAULT_QUOTE);
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const motion = useRef<Motion | null>(null);
  const latest = useRef(q);

  const set = <K extends keyof Quote>(key: K, value: Quote[K]) =>
    setQ((prev) => {
      const next = { ...prev, [key]: value };
      // labels are printed on sheets or rolls: a die-cut label becomes a rectangle by default
      if (key === "product" && value === "labels" && prev.shape === "die-cut") next.shape = "rectangle";
      return next;
    });

  // "Price these" on a product card preselects that product and shape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-quote-product]");
      if (!a) return;
      setQ((prev) => ({
        ...prev,
        product: a.dataset.quoteProduct as Quote["product"],
        shape: (a.dataset.quoteShape as Shape) ?? prev.shape,
      }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // load the preview's motion when the section gets close
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./pricing-motion").then((m) => {
          if (cancelled || !svg.current) return;
          motion.current = m.create(svg.current, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
          motion.current.update(view(latest.current));
        });
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      motion.current?.destroy();
      motion.current = null;
    };
  }, []);

  useEffect(() => {
    latest.current = q;
    motion.current?.update(view(q));
  }, [q]);

  const dims = dimensions(q);
  const fmt = (n: number) => `${Math.round(n * 10) / 10} in`;

  return (
    <section id="pricing" ref={root} aria-labelledby="pricing-title" className="quote">
      <div className="quote-grid">
        <div className="quote-head">
          <h2 id="pricing-title" className="section-title">
            Get your price.
          </h2>
          <p className="mt-5 max-w-[40ch] text-16 leading-[1.45] md:mt-7 md:text-18">
            Pick a shape, size and quantity and watch your sticker change. The preview is to scale: every square
            on the mat is one inch.
          </p>
        </div>

        {/* the mat and the price stay in view together while the options scroll (desktop) */}
        <div className="quote-stage">
          <div className="quote-preview">
            <svg
              ref={svg}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="quote-svg"
              role="img"
              aria-label={`Preview: ${summary(q)}`}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                motion.current?.pointer((e.clientX - r.left) / r.width);
              }}
            >
              <defs>
                <pattern id="q-mat" width={PPI} height={PPI} patternUnits="userSpaceOnUse" x={MAT_X} y={MAT_Y}>
                  <path d={`M${PPI} 0H0V${PPI}`} fill="none" stroke="rgba(201,209,255,0.22)" strokeWidth="1" />
                  <path d={`M${PPI / 2} 0V6M0 ${PPI / 2}H6`} fill="none" stroke="rgba(201,209,255,0.22)" strokeWidth="1" />
                </pattern>
                <path id="q-outer" d={INITIAL.outer} />
                <clipPath id="q-clip">
                  <use href="#q-outer" />
                </clipPath>
                <filter id="q-blur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
                <linearGradient id="q-foil" x1="0" y1="0" x2="1" y2="0.7">
                  <stop offset="0" stopColor="#ffb3d9" />
                  <stop offset="0.2" stopColor="#fff2a8" />
                  <stop offset="0.4" stopColor="#b5ffd9" />
                  <stop offset="0.6" stopColor="#a8e1ff" />
                  <stop offset="0.8" stopColor="#d6b8ff" />
                  <stop offset="1" stopColor="#ffb3d9" />
                </linearGradient>
                <g id="q-art">
                  <PeachArt />
                </g>
              </defs>

              <rect width={VIEW_W} height={VIEW_H} fill="url(#q-mat)" />

              <g transform={`translate(${CENTER.x} ${CENTER.y})`}>
                <g data-scale transform={`scale(${INITIAL.k})`}>
                  <g data-lift>
                    <g transform={`translate(${-CX} ${-CY})`}>
                      <g data-stack>
                        {Array.from({ length: STACK }, (_, i) => (
                          <use
                            key={i}
                            data-copy={i}
                            href="#q-outer"
                            fill="#fff"
                            stroke="#d8d2c4"
                            strokeWidth="1.5"
                            opacity={i < INITIAL.copies ? 1 : 0}
                            transform={`translate(${(i + 1) * 7} ${(i + 1) * 6}) rotate(${(i % 2 ? 1 : -1) * (i + 1) * 1.2} ${CX} ${CY})`}
                          />
                        )).reverse()}
                      </g>
                      <use data-shadow href="#q-outer" fill="#050a3a" opacity="0.4" filter="url(#q-blur)" transform="translate(6 14)" />
                      <use href="#q-outer" fill="#fff" />
                      <path data-inner d={INITIAL.inner} fill="#2f9e62" opacity={INITIAL.innerOn ? 1 : 0} />
                      <g data-art transform={`translate(${CX} ${CY}) scale(${INITIAL.art}) translate(${-CX} ${-CY})`}>
                        <use href="#q-art" />
                      </g>
                      {/* finishes: each layer clipped to the sticker; the foil multiplies onto it */}
                      <g clipPath="url(#q-clip)" style={{ mixBlendMode: "multiply" }}>
                        <rect data-foil x="-40" y="-40" width="340" height="330" fill="url(#q-foil)" opacity="0" />
                      </g>
                      <g clipPath="url(#q-clip)">
                        <rect data-matte x="-40" y="-40" width="340" height="330" fill="#fff" opacity="0" />
                        <g transform={`rotate(24 ${CX} ${CY})`}>
                          <rect data-sheen x="-60" y="-120" width="34" height="500" fill="#fff" opacity="0.5" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              <g data-dims fill="none" stroke="var(--color-liner)" strokeWidth="1.5">
                <line data-dim-h x1={INITIAL_DIMS.h.x1} x2={INITIAL_DIMS.h.x2} y1={INITIAL_DIMS.h.y} y2={INITIAL_DIMS.h.y} />
                <line data-dim-v x1={INITIAL_DIMS.v.x} x2={INITIAL_DIMS.v.x} y1={INITIAL_DIMS.v.y1} y2={INITIAL_DIMS.v.y2} />
                <g data-dim-h-label transform={`translate(${(INITIAL_DIMS.h.x1 + INITIAL_DIMS.h.x2) / 2} ${INITIAL_DIMS.h.y - 10})`}>
                  <text textAnchor="middle" stroke="none" fill="var(--color-liner)" fontSize="15" fontWeight="650">
                    {fmt(dims.w)}
                  </text>
                </g>
                <g data-dim-v-label transform={`translate(${INITIAL_DIMS.v.x - 10} ${(INITIAL_DIMS.v.y1 + INITIAL_DIMS.v.y2) / 2}) rotate(-90)`}>
                  <text textAnchor="middle" stroke="none" fill="var(--color-liner)" fontSize="15" fontWeight="650">
                    {fmt(dims.h)}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <div className="quote-total">
            <p className="quote-summary" aria-live="polite">
              {summary(q)}
            </p>
            <p className="quote-price">
              <span className="ph">[[PRICE]]</span>
            </p>
            <p className="quote-muted text-14">
              <span className="ph">[[PRICE EACH]]</span> each, free proof included
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
              {/* [[ORDER_FLOW_URL]]: where a quote continues to checkout */}
              <a href="#[[ORDER_FLOW_URL]]" className="btn btn-primary">
                Continue with this quote
                <Arrow />
              </a>
              <a href="#samples" className="text-link">
                Feel the finishes first
              </a>
            </div>
          </div>
        </div>

        <form className="quote-form" onSubmit={(e) => e.preventDefault()} aria-describedby="quote-note">
          <Options legend="What are you printing?" name="product" options={PRODUCTS} value={q.product} onChange={(v) => set("product", v)} />
          <Options legend="Shape" name="shape" options={SHAPES} value={q.shape} onChange={(v) => set("shape", v)} icon={(id) => <ShapeIcon shape={id} />} />
          <Options
            legend="Size (longest side)"
            name="size"
            options={SIZES.map((s) => ({ id: s, label: `${s} in` }))}
            value={q.size}
            onChange={(v) => set("size", v)}
          />
          <Options
            legend="Quantity"
            name="qty"
            options={QUANTITIES.map((n) => ({ id: n, label: n.toLocaleString("en-US") }))}
            value={q.qty}
            onChange={(v) => set("qty", v)}
          />
          <Options legend="Finish" name="finish" options={FINISHES} value={q.finish} onChange={(v) => set("finish", v)} />
        </form>

        <p id="quote-note" className="quote-note quote-muted text-14">
          Sizes, quantities and prices are placeholders until the price list is final.{" "}
          <span className="ph">[[PRICE_LIST]]</span>
        </p>
      </div>
    </section>
  );
}
