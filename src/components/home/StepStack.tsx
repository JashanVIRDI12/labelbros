"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Arrow } from "@/components/site/Arrow";
import { gsap } from "@/lib/gsap";
import { CHANGES, FILES, PROOF, RUSH, SHIPPING } from "@/lib/facts";
import { MATERIALS_FOR, SIZE_LIMITS, type Range } from "@/lib/options";
import { CONTACT } from "@/lib/site";
import { ICONS, STEPS } from "./Steps";

/*
 * The ordering guide: one sample label through a print job, in four stages (tabs). While it is on
 * screen it plays through the stages on its own, a line filling along the open tab; it pauses
 * while the pointer or focus is on it, stops for good once a stage is picked, and has a Pause /
 * Play button. Each stage's words rise in as it opens; the drawing moves the label between
 * scenes (CSS transitions). The panels share one grid cell, so the sheet never changes height.
 * Reduced motion: no playing, no movement.
 */
const STAGE_SECONDS = 5.5;

const STAGES = [
  { name: "Choose", key: "choose", icon: "size", caption: "A size that fits what you make.", next: "Artwork" },
  { name: "Artwork", key: "artwork", icon: "upload", caption: "Your file, or an idea we can bring to life.", next: "Your proof" },
  { name: "Proof", key: "proof", icon: "proof", caption: "Nothing prints until you say it’s right.", next: "Print & ship" },
  { name: "Delivery", key: "delivery", icon: "ship", caption: "Printed here. Packed for your shelf.", next: "See it again" },
] as const;

function RegistrationMark({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="op-registration">
      <circle r="7" />
      <path d="M-13 0h26M0-13v26" />
    </g>
  );
}

/** One sample label, moving through a real print job. All ordering information is HTML. */
function PrintDesk({ uid }: { uid: string }) {
  return (
    <svg className="op-drawing" viewBox="0 0 800 620" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${uid}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0v40" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </pattern>
        <filter id={`${uid}-paper`} x="-30%" y="-35%" width="160%" height="180%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#071451" floodOpacity=".24" />
        </filter>
      </defs>
      <rect x="30" y="30" width="740" height="560" fill={`url(#${uid}-grid)`} className="op-grid" />
      <RegistrationMark x={52} y={52} />
      <RegistrationMark x={748} y={52} />
      <RegistrationMark x={52} y={568} />
      <RegistrationMark x={748} y={568} />

      <g className="op-file op-scene-part" filter={`url(#${uid}-paper)`}>
        <path d="M124 100h228l66 66v328H124Z" fill="#fffdf8" />
        <path d="M352 100v66h66" fill="#dcd4c3" />
        <rect x="150" y="128" width="70" height="31" rx="3" fill="#ffd21f" />
        <text x="185" y="150" textAnchor="middle" className="op-file-type">
          PDF
        </text>
        <path d="M154 390h126m-126 20h176m-176 20h150" className="op-file-lines" />
        <text x="154" y="470" className="op-file-name">
          YOUR ARTWORK
        </text>
      </g>

      <g className="op-proof-sheet op-scene-part" filter={`url(#${uid}-paper)`}>
        <rect x="145" y="100" width="510" height="430" rx="4" fill="#fffdf8" />
        <text x="177" y="143" className="op-proof-heading">
          YOUR FREE PROOF
        </text>
        <path d="M177 161h446" className="op-file-lines" />
        <path d="M205 210v-35h35m320 0h35v35m0 200v35h-35m-320 0h-35v-35" className="op-crop" />
        <rect x="205" y="175" width="390" height="270" rx="12" className="op-proof-cut" />
        <g className="op-proof-stamp" transform="rotate(-7 526 481)">
          <rect x="407" y="459" width="227" height="45" rx="3" fill="#ffd21f" />
          <path d="m425 480 8 8 15-17" className="op-proof-check" />
          <text x="461" y="487" className="op-stamp-type">
            YOURS TO APPROVE
          </text>
        </g>
      </g>

      {/* delivery, behind the label: the open mailer's back flap and inside */}
      <g className="op-mailer op-scene-part" filter={`url(#${uid}-paper)`}>
        <path d="M188 318 230 214h340l42 104Z" fill="#e2c69c" />
        <path d="M230 214h340" stroke="#c9a676" strokeWidth="2" />
        <rect x="188" y="318" width="424" height="40" fill="#a98454" />
      </g>

      <g className="op-label-object" filter={`url(#${uid}-paper)`}>
        <rect x="206" y="176" width="388" height="268" rx="15" fill="#fffdf8" />
        <rect x="220" y="190" width="360" height="240" rx="10" fill="#f5f1e8" />
        <image
          href="/products/labels/jam.webp"
          x="236"
          y="218"
          width="328"
          height="184"
          preserveAspectRatio="xMidYMid meet"
        />
        <rect x="220" y="190" width="360" height="240" rx="10" className="op-cut-line" />
        <path d="m550 430 30-30v20q0 10-10 10Z" fill="#dcd4c3" className="op-label-corner" />
      </g>

      {/* delivery, in front of the label: the mailer's front, taped, with its shipping label */}
      <g className="op-mailer-front op-scene-part" filter={`url(#${uid}-paper)`}>
        <rect x="188" y="352" width="424" height="190" rx="4" fill="#d4b083" />
        <path d="M188 352h424" stroke="#b8925f" strokeWidth="3" />
        <rect x="380" y="352" width="40" height="190" fill="#ffd21f" opacity="0.92" />
        <rect x="440" y="404" width="148" height="104" rx="6" fill="#fffdf8" />
        <text x="456" y="434" className="op-ship-type">
          PRINTED IN
        </text>
        <text x="456" y="458" className="op-ship-type">
          CANADA
        </text>
        <path d="M456 478h112M456 492h80" className="op-file-lines" />
        <path d="M212 384h120M212 400h84" stroke="#b8925f" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g className="op-measurements op-scene-part">
        <path d="M220 470h360m-360-12v24m360-24v24M170 190v240m-12-240h24m-24 240h24" />
        <path d="m227 465-7 5 7 5m346-10 7 5-7 5M165 197l5-7 5 7m-10 226 5 7 5-7" />
        <text x="400" y="505" textAnchor="middle">
          3 in
        </text>
        <text x="140" y="318" textAnchor="middle" transform="rotate(-90 140 310)">
          2 in
        </text>
      </g>
    </svg>
  );
}

/** A print-desk walkthrough, retaining the existing component API for product pages. */
export function StepStack({
  title = "From your idea to your shelf.",
  more = true,
  range = "labels",
  orderHref = "/shop/custom-labels",
  orderLabel = "Start your label",
}: {
  title?: string;
  more?: boolean;
  range?: Range;
  orderHref?: string;
  orderLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sheet = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const first = useRef(true);
  const held = useRef({ view: false, hover: false, focus: false });
  const timer = useRef<gsap.core.Tween | null>(null);
  const clock = useRef({ p: 0 });

  /** The visitor took over: go to that stage and stop playing. */
  const pick = (i: number) => {
    setPlaying(false);
    setActive(i);
  };

  // playing: the open tab's line fills over STAGE_SECONDS, then the next stage opens. It runs only
  // while the guide is on screen and nobody is pointing at it or typing in it.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const sync = () => {
      const t = timer.current;
      if (!t) return;
      const h = held.current;
      if (h.view && !h.hover && !h.focus) t.play();
      else t.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      held.current.view = e.isIntersecting;
      sync();
    }, { threshold: 0.35 });
    io.observe(el);
    const on = (k: "hover" | "focus", v: boolean) => () => {
      held.current[k] = v;
      sync();
    };
    const enter = on("hover", true);
    const leave = on("hover", false);
    const fin = on("focus", true);
    const fout = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) on("focus", false)();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", fin);
    el.addEventListener("focusout", fout);
    (el as HTMLElement & { __sync?: () => void }).__sync = sync;
    return () => {
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", fin);
      el.removeEventListener("focusout", fout);
    };
  }, []);

  useEffect(() => {
    const el = sheet.current;
    const bar = tabs.current[active];
    timer.current?.kill();
    timer.current = null;
    for (const t of tabs.current) t?.style.setProperty("--p", "0");
    if (!playing || !el || !bar) return;
    clock.current.p = 0;
    timer.current = gsap.to(clock.current, {
      p: 1,
      duration: STAGE_SECONDS,
      ease: "none",
      paused: true,
      onUpdate: () => bar.style.setProperty("--p", clock.current.p.toFixed(4)),
      onComplete: () => setActive((a) => (a + 1) % STAGES.length),
    });
    (el as HTMLElement & { __sync?: () => void }).__sync?.();
    return () => {
      timer.current?.kill();
      timer.current = null;
    };
  }, [active, playing]);

  // the stage's words rise in as it opens
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const p = panels.current[active];
    if (!p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline();
    tl.fromTo(p.querySelector(".op-title span"), { yPercent: 108 }, { yPercent: 0, duration: 0.75, ease: "expo.out" })
      .fromTo(p.querySelectorAll(".op-body, .op-facts li"), { y: 16, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 -25% 0)", duration: 0.65, ease: "expo.out", stagger: 0.06, clearProps: "clipPath" }, 0.1);
    return () => {
      tl.kill();
    };
  }, [active]);
  const limits = SIZE_LIMITS[range];
  const facts = [
    [
      `Any size from ${limits.min} to ${limits.max} in`,
      `${MATERIALS_FOR(range).length} ${range === "labels" ? "label" : "sticker"} materials`,
      "Price shown as you type",
    ],
    [FILES, "Choose “Design it for me”", "Or send your file after ordering"],
    [PROOF, CHANGES, "Nothing prints until you approve"],
    [CONTACT.city ? `Printed in ${CONTACT.city}, Canada` : "Printed in Canada", SHIPPING, RUSH],
  ];
  const steps = STEPS.map((step, i) => ({
    ...step,
    title: i === 0 && range === "stickers" ? "Pick your sticker and size" : step.title,
  }));

  const onKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (active + 1) % steps.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (active - 1 + steps.length) % steps.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = steps.length - 1;
    else return;
    event.preventDefault();
    pick(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="op" aria-labelledby={`${uid}-title`}>
      <div className="op-head">
        <h2 id={`${uid}-title`} className="display sec-title" data-reveal>
          {title}
        </h2>
        {more && (
          <Link href="/how-it-works" className="text-link">
            How it works
            <Arrow />
          </Link>
        )}
      </div>
      <div className="op-sheet" ref={sheet} data-playing={playing || undefined}>
        <div className="op-tabs" role="tablist" aria-label="Explore the ordering process" onKeyDown={onKeys}>
          {STAGES.map((stage, i) => (
            <button
              key={stage.key}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-controls={`${uid}-panel-${i}`}
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              onClick={() => pick(i)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="op-tab-icon">
                <path d={ICONS[stage.icon]} />
              </svg>
              <span>{stage.name}</span>
              <span className="op-tab-line" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="op-workspace">
          <div className="op-story">
            <div className="op-panels">
            {steps.map((step, i) => (
              <div
                key={step.icon}
                ref={(node) => {
                  panels.current[i] = node;
                }}
                id={`${uid}-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${i}`}
                data-closed={active !== i || undefined}
                tabIndex={0}
              >
                <h3 className="op-title">
                  <span>{step.title}</span>
                </h3>
                <p className="op-body">{step.body}</p>
                <ul className="op-facts">
                  {facts[i].map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
            <div className="op-actions">
              <Link href={orderHref} className="btn btn-primary">
                {orderLabel}
                <Arrow />
              </Link>
              <button type="button" className="op-next" onClick={() => pick((active + 1) % steps.length)}>
                {active === steps.length - 1 ? "See it again" : `Next: ${STAGES[active].next}`}
                <Arrow />
              </button>
            </div>
          </div>
          <figure className="op-visual" data-stage={STAGES[active].key}>
            <div className="op-desk">
              <PrintDesk uid={uid} />
            </div>
            <figcaption>
              <span>{STAGES[active].caption}</span>
              <button type="button" className="op-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause the walkthrough" : "Play the walkthrough"}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 5v14M16 5v14" /> : <path d="M7 4.5v15l13-7.5Z" />}</svg>
                {playing ? "Pause" : "Play"}
              </button>
            </figcaption>
          </figure>
        </div>
      </div>
      <noscript>
        <ol className="op-no-script">
          {steps.slice(1).map((step, i) => (
            <li key={step.icon}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <ul>
                {facts[i + 1].map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </noscript>
    </section>
  );
}
