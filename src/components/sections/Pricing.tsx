"use client";

/* eslint-disable @next/next/no-img-element -- the thumbnail is a local object URL of the customer's own file */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DimInput } from "@/components/sheet/DimInput";
import { CURRENCY, FILES, RUSH, SHIPPING, SHIPS, money, quotePrice } from "@/lib/facts";
import { Arrow } from "@/components/site/Arrow";
import { ACCEPT, accepted, extOf, prepare } from "./artwork";
import { carryFile, takeCarriedFile } from "./quote-carry";
import {
  ARTWORKS,
  SAMPLE_ART,
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
  CUSTOM,
  CUSTOM_QTY,
  dimensions,
  linkCustom,
  quantity,
  quoteSearch,
  summary,
  type Art,
  type Artwork,
  type Quote,
  type Qty,
  type Shape,
  type Size,
  type View,
} from "./pricing-model";

/*
 * "Get your price": a quote builder whose preview is to scale. Every square on the mat is an
 * inch; the sticker morphs between shapes, grows with the size, stacks up with the quantity and
 * catches the light for the finish. Upload a design and it takes the sample's place, with a
 * die-cut line traced round it (artwork.ts, all in the browser); or pick "Design it for me".
 * The motion code (GSAP + MorphSVG) loads when the section gets close; until then changes apply
 * instantly.
 */

type Upload = { file: File; name: string; size: number; ext: string; art: Art | null; reading: boolean };

/** What the quote page's form sends: the quote as built, its price, and their file. */
export type QuoteSnapshot = {
  quote: Quote;
  summary: string;
  total: number;
  each: number;
  file: File | null;
};

/** A new design on the mat: a die-cut, circle or square at a custom size takes its proportions. */
const relink = (q: Quote, art: Art): Quote =>
  q.size === "custom" && q.shape !== "rectangle" ? { ...q, custom: linkCustom(q.shape, q.custom, "w", art) } : q;

const sizeOf = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h8l5 5v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M16 6v5h5M14 20v-7M11 16l3-3 3 3" />
    </svg>
  );
}

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
  children,
}: {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  icon?: (id: T) => React.ReactNode;
  children?: React.ReactNode;
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
      {children}
    </fieldset>
  );
}

const INITIAL = view(DEFAULT_QUOTE);
const INITIAL_DIMS = dimsFor(INITIAL);

/**
 * `variant`: "home" sends "Continue with this quote" to the quote page, carrying the choices and
 * the file; "quote" (on that page) leads down to its form, and reports every change in `onQuote`.
 */
export function Pricing({ variant = "home", onQuote }: { variant?: "home" | "quote"; onQuote?: (s: QuoteSnapshot) => void }) {
  const [q, setQ] = useState<Quote>(DEFAULT_QUOTE);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const motion = useRef<Motion | null>(null);
  const job = useRef(0);

  // the artwork on the mat: their upload (when it can be drawn), else the sample
  const art = q.artwork === "upload" && upload?.art ? upload.art : SAMPLE_ART;
  const artRef = useRef(art);
  const latest = useRef({ q, art });

  const set = <K extends keyof Quote>(key: K, value: Quote[K]) =>
    setQ((prev) => {
      const next = { ...prev, [key]: value };
      // labels are printed on sheets or rolls: a die-cut label becomes a rectangle by default
      if (key === "product" && value === "labels" && prev.shape === "die-cut") next.shape = "rectangle";
      // going custom starts from the size already on the mat
      if (key === "size" && value === "custom" && prev.size !== "custom") {
        const d = dimensions(prev);
        next.custom = { w: Math.round(d.w * 100) / 100, h: Math.round(d.h * 100) / 100 };
      }
      // a die-cut, circle or square keeps its proportions at a custom size
      if (next.size === "custom" && next.shape !== prev.shape)
        next.custom = linkCustom(next.shape, next.custom, "w", artRef.current);
      // a custom quantity starts from the one already picked
      if (key === "qty" && value === "custom" && prev.qty !== "custom") next.customQty = prev.qty;
      // switching between their design and the sample: a custom size takes the new proportions
      if (key === "artwork") return relink(next, next.artwork === "upload" && upload?.art ? upload.art : SAMPLE_ART);
      return next;
    });
  // typing a custom quantity
  const setCustomQty = (n: number) => setQ((prev) => ({ ...prev, qty: "custom", customQty: Math.round(n) }));
  // typing a custom width or height: the other follows unless it is a rectangle
  const setCustom = (changed: "w" | "h", inches: number) =>
    setQ((prev) => ({
      ...prev,
      size: "custom",
      custom: linkCustom(prev.shape, { ...prev.custom, [changed]: inches }, changed, artRef.current),
    }));

  useEffect(() => {
    artRef.current = art;
  }, [art]);

  // their file: read and traced here, in the browser; the newest pick wins
  const take = async (file: File | undefined) => {
    if (!file) return;
    if (!accepted(file)) {
      setError(`We print from ${FILES} files. That one is ${extOf(file.name) ? `a .${extOf(file.name)}` : "not one of them"}.`);
      return;
    }
    setError(null);
    const id = ++job.current;
    const base = { file, name: file.name, size: file.size, ext: extOf(file.name) };
    setUpload({ ...base, art: null, reading: true });
    setQ((prev) => (prev.artwork === "upload" ? prev : { ...prev, artwork: "upload" }));
    const traced = await prepare(file);
    if (id !== job.current) {
      if (traced) URL.revokeObjectURL(traced.href);
      return;
    }
    setUpload({ ...base, art: traced, reading: false });
    setQ((prev) => relink(prev, traced ?? SAMPLE_ART));
  };
  const removeUpload = () => {
    job.current++;
    setUpload(null);
    setError(null);
    setQ((prev) => relink(prev, SAMPLE_ART));
    if (fileInput.current) fileInput.current.value = "";
  };
  // let go of the preview image once it is replaced, removed or the page goes
  const uploadedHref = upload?.art?.href;
  useEffect(() => () => {
    if (uploadedHref) URL.revokeObjectURL(uploadedHref);
  }, [uploadedHref]);

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

  // links from other pages (stickers, labels) carry their choice in the URL:
  // /?product=stickers&shape=die-cut&size=3&finish=holo#pricing, or w=3.5&h=2 for a custom size,
  // and qty=100 (a preset) or qty=320 (any other amount, as a custom quantity).
  // Unknown values are ignored.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pick = <T,>(key: string, ids: readonly T[], parse: (v: string) => T) => {
      const raw = p.get(key);
      const v = raw === null ? undefined : parse(raw);
      return v !== undefined && ids.includes(v) ? v : undefined;
    };
    const asText = <T extends string>(v: string) => v as T;
    const from: Partial<Quote> = {
      product: pick("product", PRODUCTS.map((o) => o.id), asText<Quote["product"]>),
      shape: pick("shape", SHAPES.map((o) => o.id), asText<Shape>),
      size: pick("size", SIZES, Number),
      finish: pick("finish", FINISHES.map((o) => o.id), asText<Quote["finish"]>),
      artwork: pick("artwork", ARTWORKS.map((o) => o.id), asText<Artwork>),
    };
    const picked: Partial<Quote> = Object.fromEntries(Object.entries(from).filter(([, v]) => v !== undefined));
    const inches = (key: string) => {
      const n = parseFloat(p.get(key) ?? "");
      return n >= CUSTOM.min && n <= CUSTOM.max ? n : undefined;
    };
    const w = inches("w");
    const h = inches("h");
    if (w !== undefined && h !== undefined) {
      picked.size = "custom";
      picked.custom = { w, h };
    }
    const n = parseInt(p.get("qty") ?? "", 10);
    if (QUANTITIES.includes(n)) picked.qty = n;
    else if (n >= CUSTOM_QTY.min && n <= CUSTOM_QTY.max) {
      picked.qty = "custom";
      picked.customQty = n;
    }
    if (!Object.keys(picked).length) return;
    // applied on the first frame after hydration (the server renders the defaults)
    const frame = requestAnimationFrame(() =>
      setQ((prev) => {
        const next = { ...prev, ...picked };
        if (next.size === "custom") next.custom = linkCustom(next.shape, next.custom, "w");
        return next;
      }),
    );
    return () => cancelAnimationFrame(frame);
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
          motion.current.update(view(latest.current.q, latest.current.art));
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
    latest.current = { q, art };
    motion.current?.update(view(q, art));
  }, [q, art]);

  const dims = dimensions(q, art);
  const price = quotePrice(quantity(q), Math.max(dims.w, dims.h), q.finish);
  const fmt = (n: number) => `${Math.round(n * 100) / 100} in`;
  const line = `${summary(q, art)}${q.artwork === "design" ? ", designed for you" : upload ? ", your design" : ""}`;

  // the quote page: the file brought from the homepage, and every change reported to its form
  useEffect(() => {
    if (variant !== "quote") return;
    // picked up inside the frame, so a cancelled first run (React's dev double mount) leaves it
    const frame = requestAnimationFrame(() => {
      const file = takeCarriedFile();
      if (file) void take(file);
    });
    return () => cancelAnimationFrame(frame);
  }, [variant]);
  const report = useRef(onQuote);
  useEffect(() => {
    report.current = onQuote;
  }, [onQuote]);
  useEffect(() => {
    report.current?.({ quote: q, summary: line, total: price.total, each: price.each, file: upload?.file ?? null });
  }, [q, line, price.total, price.each, upload?.file]);

  return (
    <section id="pricing" ref={root} aria-labelledby="pricing-title" className="quote">
      <div className="quote-grid">
        <div className="quote-head">
          <h2 id="pricing-title" className="section-title">
            {variant === "quote" ? "Build it." : "Get your price."}
          </h2>
          <p className="mt-5 max-w-[40ch] text-16 leading-[1.45] md:mt-7 md:text-18">
            {variant === "quote"
              ? "Add your artwork, pick a shape, size and quantity, and watch it change. The preview is to scale: every square on the mat is one inch."
              : "Pick a shape, size and quantity and watch your sticker change. The preview is to scale: every square on the mat is one inch."}
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
              aria-label={`Preview: ${summary(q, art)}${art.sample ? " (sample artwork)" : ", your design"}`}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                motion.current?.pointer((e.clientX - r.left) / r.width);
              }}
            >
              <defs>
                <pattern
                  id="q-mat"
                  width={PPI}
                  height={PPI}
                  patternUnits="userSpaceOnUse"
                  x={MAT_X}
                  y={MAT_Y}
                  patternTransform={INITIAL.mat}
                >
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
                  <image
                    href={art.href}
                    x={art.box.x}
                    y={art.box.y}
                    width={art.box.w}
                    height={art.box.h}
                    preserveAspectRatio="none"
                  />
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
                      {/* the art never runs past the sticker's edge, whatever its shape */}
                      <g clipPath="url(#q-clip)">
                        <g data-art transform={`translate(${CX} ${CY}) scale(${INITIAL.art}) translate(${-CX} ${-CY})`}>
                          <use href="#q-art" />
                        </g>
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
              {line}
            </p>
            <p className="quote-price" aria-live="polite">
              {money(price.total)} <span className="quote-cur">CAD</span>
            </p>
            <p className="quote-muted text-14">
              {money(price.each)} each, free proof included. {SHIPS}.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
              {variant === "home" ? (
                // to the quote page: the choices in the URL, the file carried across
                <Link
                  href={`/quote?${quoteSearch(q)}#send`}
                  className="btn btn-primary"
                  onClick={() => carryFile(q.artwork === "upload" ? (upload?.file ?? null) : null)}
                >
                  Continue with this quote
                  <Arrow />
                </Link>
              ) : (
                <a
                  href="#send"
                  className="btn btn-primary"
                  onClick={() => requestAnimationFrame(() => document.getElementById("qf-name")?.focus({ preventScroll: true }))}
                >
                  Send this quote
                  <Arrow />
                </a>
              )}
              <Link href="/#samples" className="text-link">
                Feel the finishes first
              </Link>
            </div>
          </div>
        </div>

        <form className="quote-form" onSubmit={(e) => e.preventDefault()} aria-describedby="quote-note">
          <Options legend="What are you printing?" name="product" options={PRODUCTS} value={q.product} onChange={(v) => set("product", v)} />
          <Options<Artwork> legend="Artwork" name="artwork" options={ARTWORKS} value={q.artwork} onChange={(v) => set("artwork", v)}>
            {q.artwork === "upload" ? (
              <div
                className={`art-drop${over ? " is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(false);
                  take(e.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={fileInput}
                  id="q-file"
                  type="file"
                  accept={ACCEPT}
                  className="art-input"
                  aria-label="Upload your design"
                  aria-describedby="q-file-note"
                  onChange={(e) => {
                    take(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                {upload ? (
                  <div className="art-file">
                    <span className="art-thumb" aria-hidden="true">
                      {upload.art ? <img src={upload.art.href} alt="" /> : <span>{upload.ext.toUpperCase()}</span>}
                    </span>
                    <span className="art-meta">
                      <b className="art-name">{upload.name}</b>
                      <span className="quote-muted text-14" aria-live="polite">
                        {sizeOf(upload.size)} ·{" "}
                        {upload.reading
                          ? "Reading your file…"
                          : upload.art
                            ? "On the mat, to scale, with its cut line."
                            : "We can't show this file type here. We check it and send your free proof."}
                      </span>
                    </span>
                    <span className="art-actions">
                      <button type="button" className="text-link" onClick={() => fileInput.current?.click()}>
                        Replace
                      </button>
                      <button type="button" className="text-link" onClick={removeUpload}>
                        Remove
                      </button>
                    </span>
                  </div>
                ) : (
                  <label htmlFor="q-file" className="art-empty">
                    <UploadIcon />
                    <span>
                      <b>Drop your design here</b> or <span className="art-choose">choose a file</span>
                    </span>
                  </label>
                )}
                <p id="q-file-note" className="quote-muted text-14">
                  {FILES}. Vector files, or images at 300 dpi, print sharpest. Your file stays in your browser until
                  you order.
                </p>
                {error && (
                  <p className="art-error text-14" role="alert">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <p className="art-design quote-muted text-14">
                No file yet? Tell us your idea when you order and a designer draws it for you, with a free proof and
                changes until you are happy. Design is billed separately from printing. The sticker on the mat is a
                sample. <Link href="/services/custom-design">How custom design works</Link>
              </p>
            )}
          </Options>
          <Options legend="Shape" name="shape" options={SHAPES} value={q.shape} onChange={(v) => set("shape", v)} icon={(id) => <ShapeIcon shape={id} />} />
          <Options<Size>
            legend={q.size === "custom" ? "Size" : "Size (longest side)"}
            name="size"
            options={[...SIZES.map((s) => ({ id: s, label: `${s} in` })), { id: "custom" as const, label: "Custom" }]}
            value={q.size}
            onChange={(v) => set("size", v)}
          >
            {q.size === "custom" && (
              <div className="custom-size">
                <div className="custom-size-fields">
                  <DimInput
                    id="q-w"
                    label="Width"
                    value={q.custom.w}
                    {...CUSTOM}
                    onChange={(n) => setCustom("w", n)}
                    describedBy="q-custom-note"
                  />
                  <span className="custom-x" aria-hidden="true">
                    ×
                  </span>
                  <DimInput
                    id="q-h"
                    label="Height"
                    value={q.custom.h}
                    {...CUSTOM}
                    onChange={(n) => setCustom("h", n)}
                    describedBy="q-custom-note"
                  />
                </div>
                <p id="q-custom-note" className="quote-muted text-14">
                  {q.shape === "rectangle"
                    ? "Any width and height."
                    : "The height follows the width, so the shape keeps its proportions."}{" "}
                  From {CUSTOM.min} to {CUSTOM.max} inches.
                </p>
              </div>
            )}
          </Options>
          <Options<Qty>
            legend="Quantity"
            name="qty"
            options={[...QUANTITIES.map((n) => ({ id: n, label: n.toLocaleString("en-US") })), { id: "custom" as const, label: "Custom" }]}
            value={q.qty}
            onChange={(v) => set("qty", v)}
          >
            {q.qty === "custom" && (
              <div className="custom-size">
                <div className="custom-size-fields">
                  <DimInput
                    id="q-qty"
                    label="How many"
                    value={q.customQty}
                    {...CUSTOM_QTY}
                    whole
                    unit={{ text: q.product === "labels" ? "labels" : "stickers" }}
                    className="dim-qty"
                    onChange={setCustomQty}
                    describedBy="q-qty-note"
                  />
                </div>
                <p id="q-qty-note" className="quote-muted text-14">
                  Any amount from {CUSTOM_QTY.min.toLocaleString("en-US")} to {CUSTOM_QTY.max.toLocaleString("en-US")}.
                </p>
              </div>
            )}
          </Options>
          <Options legend="Finish" name="finish" options={FINISHES} value={q.finish} onChange={(v) => set("finish", v)} />
        </form>

        <p id="quote-note" className="quote-note quote-muted text-14">
          {CURRENCY}, free proof included. {SHIPPING}. {RUSH}.
        </p>
      </div>
    </section>
  );
}
