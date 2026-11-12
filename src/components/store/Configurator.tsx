"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Arrow } from "@/components/site/Arrow";
import { UPLOAD_MB } from "@/lib/api";
import { artworkSize, prepareArtwork } from "@/lib/artwork-outline";
import { addLine, openCart } from "@/lib/cart";
import { CONFIGURE, type Configure } from "@/lib/configure";
import { useCurrency } from "@/lib/currency";
import { CALL, FILES, INVOICE_MIN, PROOF, SHIPS, SHIPS_LONG, money } from "@/lib/facts";
import { gsap } from "@/lib/gsap";
import {
  BULK_FROM,
  FINISHES,
  FORMATS,
  MATERIALS,
  MAX_QTY,
  QTY_TIERS,
  SHAPES,
  SIZE_LIMITS,
  inch,
  minQty,
  sizeText,
  type ArtworkId,
  type FinishId,
  type FormatId,
  type MaterialId,
  type ShapeId,
} from "@/lib/options";
import { eachText, nextBreak, priceBreaks, priceIn, quote } from "@/lib/pricing";
import { MAX_PACKS, formatsOf, materialsOf, shapesOf, unitWord, type Product } from "@/lib/products";
import { PdpStage, type StageApi, type StageView } from "./PdpStage";

/*
 * The buy box: shape, size (presets, or any width and height in inches), material, finish, roll
 * or sheets, quantity (with the price each at every break, and bulk quantities from 500 for
 * business), then the artwork: their file, "design it for me", or "send it later". The price
 * follows every choice, worked out by the same formula the server charges (pricing.ts).
 * Deals and the sample pack only take a finish and a number of packs.
 *
 * Sections further down the page (the bulk slider) can set choices here with configure()
 * (lib/configure.ts); the page then scrolls back up.
 */


const ACCEPT = ".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.tif,.tiff,.psd";
const KINDS = ["pdf", "ai", "eps", "svg", "png", "jpg", "jpeg", "tif", "tiff", "psd"];
const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
const isImage = (f: File) => ["png", "jpg", "jpeg", "svg"].includes(extOf(f.name));
const sizeOf = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);
const r2 = (n: number) => Math.round(n * 100) / 100;

function ShapeIcon({ shape }: { shape: ShapeId }) {
  const d: Record<ShapeId, ReactNode> = {
    rectangle: <rect x="3" y="7" width="22" height="14" rx="1" />,
    rounded: <rect x="3" y="7" width="22" height="14" rx="4" />,
    square: <rect x="6" y="6" width="16" height="16" rx="3" />,
    circle: <circle cx="14" cy="14" r="9" />,
    oval: <ellipse cx="14" cy="14" rx="11" ry="7.5" />,
    "die-cut": <path d="M8 5c4-2 7 1 10 0s6 3 5 7-3 4-2 7-4 5-8 4-6 1-8-3 0-5-2-8 1-6 5-7Z" />,
  };
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="cfg-shape-icon">
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        {d[shape]}
      </g>
    </svg>
  );
}

/** A group of choices, as a fieldset of radio cards or chips. */
function Group({ legend, aside, children, className = "" }: { legend: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <fieldset className={`cfg-group ${className}`}>
      <legend className="cfg-legend">
        <span>{legend}</span>
        {aside && <span className="cfg-aside">{aside}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Radio({ name, checked, onChange, children, className = "" }: { name: string; checked: boolean; onChange: () => void; children: ReactNode; className?: string }) {
  return (
    <label className={`opt ${className}`} data-checked={checked || undefined}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

/** The total, rolling to each new price (the text is written by GSAP, never re-rendered by React). */
function Rolling({ value, cur }: { value: number; cur: "cad" | "usd" }) {
  const el = useRef<HTMLSpanElement>(null);
  const [first] = useState(value);
  const shown = useRef({ v: value });
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const write = () => (node.textContent = money(Math.round(shown.current.v), cur));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || shown.current.v === value) {
      shown.current.v = value;
      write();
      return;
    }
    const t = gsap.to(shown.current, { v: value, duration: 0.6, ease: "expo.out", onUpdate: write, onComplete: write });
    return () => {
      t.kill();
    };
  }, [value, cur]);
  return (
    <span ref={el} aria-hidden="true">
      {money(first, cur)}
    </span>
  );
}

/** Fly a copy of the preview (or `src`, a picture of it) into the cart button, then nudge the button. */
function flyToCart(from: Element | null, src?: string) {
  const to = document.querySelector("[data-cart-button]");
  // bring the header back (it tucks away while scrolling down) so the cart is there to land in
  const header = document.querySelector<HTMLElement>("[data-header]");
  const tucked = header?.hasAttribute("data-hidden") ? header.offsetHeight + 2 : 0;
  header?.removeAttribute("data-hidden");
  if (!from || !to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const r = to.getBoundingClientRect();
  const b = { left: r.left, width: r.width, top: r.top + tucked, height: r.height };
  if (!a.width || !b.width) return;
  let ghost: HTMLElement;
  if (src) {
    ghost = document.createElement("img");
    (ghost as HTMLImageElement).src = src;
    ghost.style.objectFit = "contain";
  } else ghost = from.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, { position: "fixed", left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, zIndex: "90", pointerEvents: "none", margin: "0" });
  ghost.classList.add("fly-ghost");
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { scale: 0.9, rotation: -6, duration: 0.18, ease: "power2.out" })
    .to(ghost, { x: dx, duration: 0.62, ease: "power2.inOut" }, 0.12)
    .to(ghost, { y: dy, duration: 0.62, ease: "power3.in" }, 0.12)
    .to(ghost, { scale: 0.06, rotation: 14, autoAlpha: 0.4, duration: 0.62, ease: "power2.in" }, 0.12)
    .fromTo(to, { scale: 1 }, { scale: 1.18, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, 0.7);
}

/**
 * The product's whole buy area. `head`: the trail, name and line (drawn on the server), shown
 * above the choices; `media`: its photo. The stage beside them shows the photo, or the label as you
 * build it in 3D, and switches to the label the first time a choice changes (until you pick a view).
 */
export function Configurator({ p, head, media }: { p: Product; head: ReactNode; media: ReactNode }) {
  const router = useRouter();
  const cur = useCurrency();
  const uid = useId();
  const d = p.defaults;
  const isDeal = p.kind === "deal";
  const lim = SIZE_LIMITS[p.range];

  const [shape, setShape] = useState<ShapeId>(d.shape);
  const [w, setW] = useState(d.shape === "die-cut" ? Math.max(d.w, d.h) : d.w);
  const [h, setH] = useState(d.h);
  const [wText, setWText] = useState(inch(d.shape === "die-cut" ? Math.max(d.w, d.h) : d.w));
  const [hText, setHText] = useState(inch(d.h));
  const [custom, setCustom] = useState(!p.presets.some(([pw, ph]) => pw === d.w && ph === d.h));
  const [material, setMaterial] = useState<MaterialId>(d.material);
  const [finish, setFinish] = useState<FinishId>(d.finish);
  const [format, setFormat] = useState<FormatId>(d.format);
  const [bulk, setBulk] = useState(false);
  const [qty, setQty] = useState(d.qty);
  const [qtyText, setQtyText] = useState("");
  const [packs, setPacks] = useState(1);
  const [artwork, setArtwork] = useState<ArtworkId>(p.noArtwork ? "none" : "upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [artAspect, setArtAspect] = useState<{ src: string; aspect: number } | null>(null);
  const [idea, setIdea] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const stage = useRef<StageApi | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const [summaryInView, setSummaryInView] = useState(false);
  const [controlsInView, setControlsInView] = useState(true);
  const [introGone, setIntroGone] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<StageView>("photo");
  const touched = useRef(false);
  const showLabel = () => {
    if (touched.current) return;
    touched.current = true;
    setView("label");
  };

  const equal = Boolean(SHAPES[shape].equal);
  const dieCut = shape === "die-cut";
  const oneSize = equal || dieCut;
  const previewArt = artwork === "upload" ? fileUrl : null;
  const artSource = previewArt ?? p.image.label.src;
  const aspect = artAspect?.src === artSource ? artAspect.aspect : p.image.label.w / p.image.label.h;
  const dimensions = dieCut ? artworkSize(w, aspect) : { w, h: equal ? w : h };
  const artworkPending = !isDeal && dieCut && artAspect?.src !== artSource;
  useEffect(() => {
    if (isDeal) return;
    let cancelled = false;
    prepareArtwork(artSource).then(({ cutline, img }) => {
      if (!cancelled) setArtAspect({ src: artSource, aspect: cutline?.aspect ?? img.naturalWidth / img.naturalHeight });
    }).catch(() => {
      if (!cancelled) setArtAspect({ src: artSource, aspect: p.image.label.w / p.image.label.h });
    });
    return () => { cancelled = true; };
  }, [artSource, isDeal, p.image.label.w, p.image.label.h]);
  const mat = MATERIALS[material];
  const tiers = bulk ? QTY_TIERS.bulk : QTY_TIERS[p.range];
  const presets: [number, number][] = [...new Set(p.presets.map(([pw, ph]) => Math.max(pw, ph)))].map((side) => [side, side]);
  const minimum = bulk ? BULK_FROM : minQty(p.range, material);

  // choices carried in from a link (the quick price bar, a bulk link): ?shape=&w=&h=&qty=&material=&bulk=1
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (!q.toString() || isDeal) return;
    const num = (k: string) => {
      const n = Number(q.get(k));
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    const s = q.get("shape") as ShapeId | null;
    const nextShape = s && shapesOf(p).includes(s) ? s : shape;
    const nw = num("w");
    const nh = num("h");
    const m = q.get("material") as MaterialId | null;
    const nq = num("qty");
    /* eslint-disable react-hooks/set-state-in-effect -- applying the link's choices once, on arrival */
    if (nextShape !== shape) setShape(nextShape);
    if (nw && nw >= lim.min && nw <= lim.max) {
      const side = nextShape === "die-cut" ? Math.max(nw, nh ?? nw) : nw;
      const hh = SHAPES[nextShape].equal ? side : nh && nh >= lim.min && nh <= lim.max ? nh : h;
      setW(r2(side));
      setH(r2(hh));
      setWText(inch(side));
      setHText(inch(hh));
      setCustom(!p.presets.some(([pw, ph]) => Math.max(pw, ph) === side));
    }
    if (m && materialsOf(p).includes(m)) {
      setMaterial(m);
      setFinish(MATERIALS[m].finishes.includes(finish) ? finish : MATERIALS[m].finishes[0]);
    }
    if (q.get("bulk") === "1" && p.range === "labels") setBulk(true);
    if (nq && Number.isInteger(nq) && nq <= MAX_QTY) {
      setQty(nq);
      if (!(q.get("bulk") === "1" ? QTY_TIERS.bulk : QTY_TIERS[p.range]).includes(nq)) setQtyText(String(nq));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the uploaded image, shown on the preview (its object URL is freed when replaced or on leaving)
  const urlRef = useRef<string | null>(null);
  const pickFile = (f: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = f && isImage(f) ? URL.createObjectURL(f) : null;
    setFile(f);
    setFileUrl(urlRef.current);
  };
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  // Keep the floating buy bar away from the entire configurator, including the upload controls.
  useEffect(() => {
    const el = summary.current;
    const top = intro.current;
    const form = controls.current;
    if (!el || !top || !form) return;
    const io = new IntersectionObserver(([e]) => setSummaryInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const io2 = new IntersectionObserver(([e]) => setIntroGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    io2.observe(top);
    const io3 = new IntersectionObserver(([e]) => setControlsInView(e.isIntersecting), { rootMargin: "0px 0px 100px 0px" });
    io3.observe(form);
    return () => {
      io.disconnect();
      io2.disconnect();
      io3.disconnect();
    };
  }, []);
  const dock = introGone && !summaryInView && !controlsInView;

  // checks
  const sizeError = (() => {
    const bad = (t: string) => {
      const n = Number(t);
      return !t || !Number.isFinite(n) || n < lim.min || n > lim.max;
    };
    if (bad(wText) || (!oneSize && bad(hText))) return `Sizes go from ${inch(lim.min)} to ${inch(lim.max)} inches.`;
    if (dimensions.w < lim.min || dimensions.h < lim.min) return `Choose a larger size so both sides are at least ${inch(lim.min)} inches.`;
    return null;
  })();
  const qtyError = qty < minimum ? `The fewest is ${minimum.toLocaleString("en-CA")}${bulk ? " for bulk orders" : ""}.` : qty > MAX_QTY ? "Over 100,000? Ask us for a quote." : null;

  const base = { range: p.range, shape, ...dimensions, material };
  const priced = isDeal ? null : quote({ ...base, qty }, cur);
  const total = isDeal ? priceIn(p.priceUsd ?? 0, cur) * packs : (priced?.total ?? 0);
  const each = isDeal ? total / (d.qty * packs) : (priced?.each ?? 0);
  const breaks = useMemo(() => (isDeal ? [] : priceBreaks(base, tiers, cur)), [isDeal, base.range, base.shape, base.w, base.h, base.material, tiers, cur]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = !isDeal && !qtyError ? nextBreak(breaks, qty, each) : null;
  const word = unitWord(p);

  const pickShape = (s: ShapeId) => {
    showLabel();
    setShape(s);
    if (SHAPES[s].equal && h !== w) {
      setH(w);
      setHText(inch(w));
    }
  };
  const pickPreset = (pw: number, ph: number) => {
    showLabel();
    const side = Math.max(pw, ph);
    const hh = equal ? side : ph;
    setCustom(false);
    setW(side);
    setH(hh);
    setWText(inch(side));
    setHText(inch(hh));
  };
  const typeSize = (which: "w" | "h", t: string) => {
    showLabel();
    const n = Number(t);
    const ok = t !== "" && Number.isFinite(n) && n >= lim.min && n <= lim.max;
    if (which === "w") {
      setWText(t);
      if (ok) {
        setW(r2(n));
        if (equal) {
          setH(r2(n));
          setHText(t);
        }
      }
    } else {
      setHText(t);
      if (ok) setH(r2(n));
    }
  };
  const pickMaterial = (m: MaterialId) => {
    if (!isDeal) showLabel();
    setMaterial(m);
    if (!MATERIALS[m].finishes.includes(finish)) setFinish(MATERIALS[m].finishes[0]);
  };
  const pickTier = (n: number) => {
    setQty(n);
    setQtyText("");
  };
  const typeQty = (t: string) => {
    setQtyText(t);
    const n = Math.round(Number(t.replace(/[^\d]/g, "")));
    if (n > 0) setQty(n);
  };
  const setMode = (b: boolean) => {
    setBulk(b);
    const list = b ? QTY_TIERS.bulk : QTY_TIERS[p.range];
    if (b && qty < BULK_FROM) pickTier(1000);
    else if (!b && !list.includes(qty) && !qtyText) pickTier(list[2] ?? list[0]);
  };

  // choices sent from further down the page (the bulk slider): apply them and come back up
  useEffect(() => {
    const on = (e: Event) => {
      const c = (e as CustomEvent<Configure>).detail;
      if (isDeal) return;
      if (c.shape && shapesOf(p).includes(c.shape)) pickShape(c.shape);
      if (c.w && c.h && c.w >= lim.min && c.w <= lim.max && c.h >= lim.min && c.h <= lim.max) {
        const preset = p.presets.some(([pw, ph]) => pw === c.w && ph === c.h);
        if (preset) pickPreset(c.w, c.h);
        else {
          showLabel();
          setCustom(true);
          setW(c.w);
          setH(c.h);
          setWText(inch(c.w));
          setHText(inch(c.h));
        }
      }
      if (c.material && materialsOf(p).includes(c.material)) pickMaterial(c.material);
      if (c.bulk !== undefined && p.range === "labels") setBulk(c.bulk);
      if (c.qty) {
        setQty(c.qty);
        setQtyText((c.bulk ? QTY_TIERS.bulk : tiers).includes(c.qty) ? "" : String(c.qty));
      }
      const el = grid.current;
      if (!el) return;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o: { offset: number }) => void } }).__lenis;
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener(CONFIGURE, on);
    return () => window.removeEventListener(CONFIGURE, on);
  });

  const take = (f?: File | null) => {
    setError(null);
    if (!f) return;
    if (!KINDS.includes(extOf(f.name))) return setError(`We take ${FILES} files.`);
    if (f.size > UPLOAD_MB * 1e6) return setError(`That file is over ${UPLOAD_MB} MB. Choose "Send it later" and email it to us after ordering.`);
    pickFile(f);
    if (!isDeal && isImage(f)) {
      touched.current = true;
      setView("label");
    }
  };

  async function add(go: boolean) {
    if (artworkPending) return;
    setError(null);
    if (!isDeal && (sizeError || qtyError)) {
      setError(sizeError ?? qtyError);
      return;
    }
    if (artwork === "design" && idea.trim().length < 10) {
      setError("Tell us your idea: what it says and shows, your colours and style.");
      document.getElementById(`${uid}-idea`)?.focus();
      return;
    }
    setBusy(true);
    const fly = stage.current?.fly();
    flyToCart(fly?.el ?? null, fly?.src);
    const text = artwork === "design" ? [idea.trim(), notes.trim()].filter(Boolean).join("\n\n") : notes.trim();
    await addLine(
      {
        slug: p.slug,
        shape: isDeal ? d.shape : shape,
        w: isDeal ? d.w : dimensions.w,
        h: isDeal ? d.h : dimensions.h,
        material,
        finish,
        format: isDeal ? d.format : format,
        qty: isDeal ? d.qty : qty,
        packs: isDeal ? packs : 1,
        artwork,
        notes: text || undefined,
      },
      artwork === "upload" ? file : null,
    );
    setBusy(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
    if (go) router.push("/cart");
    else window.setTimeout(openCart, 650);
  }

  const sizeWords = isDeal ? sizeText(d.shape, d.w, d.h) : sizeText(shape, dimensions.w, dimensions.h);

  return (
    <div className="pdp-grid" ref={grid}>
      <div className="pdp-intro" ref={intro}>
        {head}
        <p className="pdp-price">
          <span className="pdp-price-label">Order total</span>
          <b>{money(total, cur)}</b> <small>{cur.toUpperCase()}</small>
          <span>
            {isDeal
              ? p.noArtwork
                ? "Mailed to you"
                : `${(d.qty * packs).toLocaleString("en-CA")} ${p.plural}, ${sizeWords}`
              : `${qty.toLocaleString("en-CA")} ${p.plural}, ${sizeWords} · ${eachText(each, cur)} each`}
          </span>
        </p>
        <ul className="pdp-reassurance" aria-label="Order details">
          <li>
            <b>{p.noArtwork ? `${d.qty} material samples` : PROOF}</b>
            <span>{p.noArtwork ? "Compare finishes before you order" : "Approve your design before we print"}</span>
          </li>
          <li>
            <b>{p.noArtwork ? "Mailed to you" : SHIPS}</b>
            <span>{p.noArtwork ? "Feel the materials for yourself" : "After you approve your proof"}</span>
          </li>
        </ul>
      </div>

      <div className="pdp-left">
        <PdpStage
          p={p}
          media={media}
          view={view}
          onView={(v) => {
            touched.current = true;
            setView(v);
          }}
          spec={isDeal ? null : { shape, ...dimensions, material, finish }}
          art={previewArt}
          apiRef={stage}
        />
      </div>

      <div className="cfg" id="customize-order" ref={controls}>
        <div className="cfg-heading">
          <h2>{p.noArtwork ? "Choose your packs" : isDeal ? "Make this pack yours" : `Customize your ${p.range}`}</h2>
          <Link href="/contact">Need a hand?</Link>
        </div>
      {!isDeal && (
        <>
          {shapesOf(p).length > 1 && (
            <Group legend="Shape" aside={SHAPES[shape].note}>
              <div className="opts opts-shapes">
                {shapesOf(p).map((s) => (
                  <Radio key={s} name={`${uid}-shape`} checked={shape === s} onChange={() => pickShape(s)} className="opt-shape">
                    <ShapeIcon shape={s} />
                    <span>{SHAPES[s].label}</span>
                  </Radio>
                ))}
              </div>
            </Group>
          )}

          <Group legend="Size" aside={`${inch(lim.min)} to ${inch(lim.max)} in`}>
            <div className="opts opts-chips">
              {presets.map(([pw, ph]) => (
                  <Radio key={`${pw}x${ph}`} name={`${uid}-size`} checked={!custom && w === pw} onChange={() => pickPreset(pw, ph)} className="opt-chip">
                    <span>{inch(pw)} in</span>
                  </Radio>
                ))}
              <Radio name={`${uid}-size`} checked={custom} onChange={() => setCustom(true)} className="opt-chip">
                <span>Custom size</span>
              </Radio>
            </div>
            {custom && (
              <div className="cfg-dims">
                <label className="cfg-dim">
                  <span>{dieCut ? "Longest side" : equal ? (shape === "circle" ? "Diameter" : "Side") : "Width"}</span>
                  <span className="cfg-dim-box">
                    <input inputMode="decimal" value={wText} onChange={(e) => typeSize("w", e.target.value)} aria-invalid={Boolean(sizeError) || undefined} aria-describedby={`${uid}-size-note`} />
                    <i>in</i>
                  </span>
                </label>
                {!oneSize && (
                  <>
                    <span className="cfg-times" aria-hidden="true">
                      ×
                    </span>
                    <label className="cfg-dim">
                      <span>Height</span>
                      <span className="cfg-dim-box">
                        <input inputMode="decimal" value={hText} onChange={(e) => typeSize("h", e.target.value)} aria-invalid={Boolean(sizeError) || undefined} aria-describedby={`${uid}-size-note`} />
                        <i>in</i>
                      </span>
                    </label>
                  </>
                )}
              </div>
            )}
            <p id={`${uid}-size-note`} className={sizeError ? "cfg-note cfg-bad" : "cfg-note"}>
              {sizeError ?? (dieCut ? `Size is the longest side. Your artwork keeps its proportions: ${inch(dimensions.w)} × ${inch(dimensions.h)} in.` : "Measure the flat area on your product. We check the fit on your proof.")}
            </p>
          </Group>
        </>
      )}

      {materialsOf(p).length > 1 && (
        <Group legend="Material" aside={mat.label}>
          <div className="opts opts-mats">
            {materialsOf(p).map((m) => (
              <Radio key={m} name={`${uid}-mat`} checked={material === m} onChange={() => pickMaterial(m)} className="opt-mat">
                <span className="swatch" data-look={MATERIALS[m].look} aria-hidden="true" />
                <span className="opt-mat-text">
                  <b>{MATERIALS[m].label}</b>
                  {!isDeal && <small>{money(quote({ ...base, material: m, qty: Math.max(qty, minQty(p.range, m)) }, cur).total, cur)}</small>}
                </span>
              </Radio>
            ))}
          </div>
          <p className="cfg-note">{mat.note}</p>
        </Group>
      )}

      {mat.finishes.length > 1 && (
        <Group legend="Finish" aside={FINISHES[finish].note}>
          <div className="opts opts-chips">
            {mat.finishes.map((f) => (
              <Radio key={f} name={`${uid}-fin`} checked={finish === f} onChange={() => setFinish(f)} className="opt-chip">
                <span>{FINISHES[f].label}</span>
              </Radio>
            ))}
          </div>
        </Group>
      )}

      {!isDeal && formatsOf(p).length > 1 && (
        <Group legend="Comes" aside={FORMATS[format].label}>
          <div className="opts opts-chips">
            {formatsOf(p).map((f) => (
              <Radio key={f} name={`${uid}-fmt`} checked={format === f} onChange={() => setFormat(f)} className="opt-chip">
                <span>{FORMATS[f].label}</span>
              </Radio>
            ))}
          </div>
          <p className="cfg-note">{FORMATS[format].note}</p>
        </Group>
      )}

      {!isDeal && (
        <Group legend="Quantity" aside={`${eachText(each, cur)} each`} className="cfg-qty">
          {p.range === "labels" && (
            <div className="cfg-tabs" role="group" aria-label="Order size">
              <button type="button" aria-pressed={!bulk} onClick={() => setMode(false)}>
                Standard
              </button>
              <button type="button" aria-pressed={bulk} onClick={() => setMode(true)}>
                Bulk {BULK_FROM.toLocaleString("en-CA")}+
              </button>
            </div>
          )}
          <div className="qrows" role="radiogroup" aria-label="Quantity">
            {breaks.map((b) => (
              <label key={b.qty} className="qrow" data-checked={(qty === b.qty && !qtyText) || undefined}>
                <input type="radio" name={`${uid}-qty`} checked={qty === b.qty && !qtyText} onChange={() => pickTier(b.qty)} />
                <span className="qrow-n">{b.qty.toLocaleString("en-CA")}</span>
                <span className="qrow-each">{eachText(b.each, cur)} each</span>
                <span className="qrow-save">{b.save > 0 ? `Save ${b.save}%` : ""}</span>
                <span className="qrow-total">{money(b.total, cur)}</span>
              </label>
            ))}
            <label className="qrow qrow-other" data-checked={Boolean(qtyText) || undefined}>
              <span className="qrow-n">Other</span>
              <span className="cfg-dim-box">
                <input
                  inputMode="numeric"
                  placeholder={`${minimum.toLocaleString("en-CA")} or more`}
                  value={qtyText}
                  onChange={(e) => typeQty(e.target.value)}
                  aria-label="Another quantity"
                  aria-invalid={Boolean(qtyError) || undefined}
                />
              </span>
              <span className="qrow-total">{qtyText && !qtyError ? money(total, cur) : ""}</span>
            </label>
          </div>
          <p className={qtyError ? "cfg-note cfg-bad" : "cfg-note"}>
            {qtyError ??
              (next ? (
                <>
                  Order {next.qty.toLocaleString("en-CA")} and each {word} costs {eachText(next.each, cur)}, {next.save}% less.{" "}
                  <button type="button" className="text-link" onClick={() => pickTier(next.qty)}>
                    Make it {next.qty.toLocaleString("en-CA")}
                  </button>
                </>
              ) : (
                "Need over 100,000? Contact us for a quote."
              ))}
          </p>
        </Group>
      )}

      {isDeal && (
        <Group legend={p.noArtwork ? "How many" : "Packs"}>
          <span className="stepper stepper-lg" role="group" aria-label="Packs">
            <button type="button" aria-label="One pack fewer" onClick={() => setPacks((n) => Math.max(1, n - 1))} disabled={packs <= 1}>
              −
            </button>
            <output aria-live="polite">{packs}</output>
            <button type="button" aria-label="One pack more" onClick={() => setPacks((n) => Math.min(MAX_PACKS, n + 1))} disabled={packs >= MAX_PACKS}>
              +
            </button>
          </span>
        </Group>
      )}

      {!p.noArtwork && (
        <Group legend="Artwork" className="cfg-art">
          <div className="cfg-tabs cfg-tabs-3" role="group" aria-label="Artwork">
            <button type="button" aria-pressed={artwork === "upload"} onClick={() => setArtwork("upload")}>
              Upload artwork
            </button>
            <button type="button" aria-pressed={artwork === "design"} onClick={() => setArtwork("design")}>
              Design it for me
            </button>
            <button type="button" aria-pressed={artwork === "later"} onClick={() => setArtwork("later")}>
              Send it later
            </button>
          </div>

          {artwork === "upload" && (
            <div
              className="drop"
              data-has={file ? "" : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.setAttribute("data-over", "");
              }}
              onDragLeave={(e) => e.currentTarget.removeAttribute("data-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.removeAttribute("data-over");
                take(e.dataTransfer.files?.[0]);
              }}
            >
              <input ref={input} id={`${uid}-file`} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
              {file ? (
                <div className="drop-file">
                  <span className="drop-ext">{extOf(file.name).toUpperCase().slice(0, 4)}</span>
                  <span className="drop-name">
                    <b>{file.name}</b>
                    <small>{sizeOf(file.size)} · we check it before anything prints</small>
                  </span>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => {
                      pickFile(null);
                      if (input.current) input.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label htmlFor={`${uid}-file`} className="drop-pick">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v4h16v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <b>Drop your file here, or choose it</b>
                  <small>
                    {FILES}, up to {UPLOAD_MB} MB
                  </small>
                </label>
              )}
              {file && !isImage(file) && <p className="cfg-note">Your file is attached. We’ll confirm its die-cut outline in your free proof. PNG, JPG and SVG files show a live preview.</p>}
            </div>
          )}

          {artwork === "design" && (
            <div className="cfg-design">
              <ul className="cfg-steps">
                <li>Tell us your idea below: words, colours, style, and attach a logo later if you have one.</li>
                <li>A designer draws it and sends you a free proof within a day.</li>
                <li>{CALL}. Nothing prints until you approve.</li>
              </ul>
              <label htmlFor={`${uid}-idea`} className="cfg-label">
                Your idea
              </label>
              <textarea id={`${uid}-idea`} rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={1500} placeholder="e.g. Sunday Jam Co., strawberry jam, red and cream, hand-drawn, scalloped edge" />
            </div>
          )}

          {artwork === "later" && <p className="cfg-note">Order now and we email you to collect your files. We check them and send a free proof before anything prints.</p>}

          {artwork !== "design" && (
            <details className="cfg-notes">
              <summary>Add a note (optional)</summary>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1500} placeholder="Colours to match, a deadline, several designs in one order, a link to your files…" aria-label="Note" />
            </details>
          )}
        </Group>
      )}

      {/* the summary and the buttons */}
      <div className="cfg-sum" ref={summary}>
        <div className="cfg-sum-price">
          <p className="cfg-total">
            <Rolling value={total} cur={cur} />
            <small> {cur.toUpperCase()}</small>
          </p>
          <p className="sr-only" aria-live="polite">
            Total {money(total, cur)} {cur.toUpperCase()}
          </p>
          <p className="cfg-each">
            {isDeal ? (
              <>
                {p.noArtwork ? p.name : `${(d.qty * packs).toLocaleString("en-CA")} ${p.plural}, ${sizeWords}`}
                {p.valueUsd ? <s> {money(priceIn(p.valueUsd, cur) * packs, cur)}</s> : null}
              </>
            ) : (
              <>
                {qty.toLocaleString("en-CA")} × {sizeWords} · {eachText(each, cur)} each
              </>
            )}
          </p>
        </div>
        {error && (
          <p className="cfg-error" role="alert">
            {error}
          </p>
        )}
        <div className="cfg-btns">
          <button type="button" className="btn btn-primary cfg-add" onClick={() => add(false)} disabled={busy || artworkPending}>
            {artworkPending ? "Preparing preview…" : added ? "Added to cart" : "Add to cart"}
            <Arrow />
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => add(true)} disabled={busy || artworkPending}>
            Buy now
          </button>
        </div>
        <ul className="cfg-promises">
          <li>{p.noArtwork ? "Mailed to you" : `${PROOF}: nothing prints until you approve`}</li>
          {!p.noArtwork && <li>{SHIPS_LONG}</li>}
          {total >= INVOICE_MIN && p.range === "labels" && <li>Business? Pay by invoice at checkout</li>}
        </ul>
      </div>

      </div>

      {/* the price and the button, always in reach once the top has scrolled away */}
      <div className="dock" data-show={dock || undefined} aria-hidden={!dock || undefined} inert={!dock}>
        <span className="dock-thumb" data-tone={p.tone}>
          <Image src={p.image.thumb} alt="" width={256} height={256} sizes="56px" />
        </span>
        <span className="dock-text">
          <b>{p.name}</b>
          <small>{isDeal ? `${packs} × ${p.name}` : `${qty.toLocaleString("en-CA")} · ${sizeWords} · ${mat.label}`}</small>
        </span>
        <span className="dock-price">
          <b>{money(total, cur)}</b>
          <small>{isDeal ? cur.toUpperCase() : `${eachText(each, cur)} each`}</small>
        </span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => add(false)} disabled={busy || artworkPending} tabIndex={dock ? undefined : -1}>
          {artworkPending ? "Preparing preview…" : added ? "Added" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
