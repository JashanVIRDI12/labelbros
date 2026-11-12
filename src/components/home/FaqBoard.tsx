"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { gsap } from "@/lib/gsap";

/*
 * The questions, as an answer board. Wide screens: the questions down the left, a yellow tab
 * marking the one that's open, and its answer on a large cream label beside them that stays in
 * view. Choosing another question slides the tab to it; the label's corner peels, the old answer
 * lifts out, the new one is laid down and the label settles (slap). Phones and tablets: each
 * answer opens under its question, the height easing open as the other one closes. Buttons with
 * aria-expanded; arrow keys move between questions. Reduced motion: it switches without moving.
 */

export type FaqItem = { q: string; a: string; href?: string; link?: string };

const DESKTOP = "(min-width: 1024px)";
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function FaqBoard({ items }: { items: FaqItem[] }) {
  const uid = useId().replace(/:/g, "");
  const [open, setOpen] = useState(0);
  const [shown, setShown] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const prev = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const f = items[shown];

  // the tab slides to the open question
  useLayoutEffect(() => {
    const ul = list.current;
    const m = mark.current;
    const btn = ul?.querySelectorAll<HTMLElement>(".fq-q")[open];
    if (!ul || !m || !btn) return;
    const to = { y: btn.offsetTop + btn.offsetHeight / 2 - 13 };
    if (first.current || still()) gsap.set(m, to);
    else gsap.to(m, { ...to, duration: 0.55, ease: "power3.out", overwrite: true });
  }, [open]);

  // the label shows the chosen answer: laid down, settling
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const c = card.current;
    const el = inner.current;
    if (!c || !el || still() || !window.matchMedia(DESKTOP).matches) return;
    const title = el.querySelector(".fq-card-q");
    const rest = el.querySelectorAll(".fq-card-a, .fq-card-link");
    const tl = gsap.timeline();
    tl.set(el, { clearProps: "transform,clipPath" })
      .fromTo(title, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out" }, 0)
      .fromTo(rest, { y: 18, clipPath: "inset(0 0 100% 0)" }, { y: 0, clipPath: "inset(0 0 -20% 0)", duration: 0.65, ease: "expo.out", stagger: 0.06, clearProps: "clipPath" }, 0.08)
      .fromTo(c, { scale: 0.985, rotation: -0.6 }, { scale: 1, rotation: 0, duration: 0.5, ease: "slap" }, 0)
      .to(c, { "--fq-peel": "0px", duration: 0.45, ease: "slap" }, 0.05);
    return () => {
      tl.kill();
    };
  }, [shown]);

  // phones: the newly opened answer eases open, the last one closed
  useEffect(() => {
    const ul = list.current;
    const was = prev.current;
    prev.current = open;
    if (!ul || window.matchMedia(DESKTOP).matches || still() || was === open) return;
    const panels = ul.querySelectorAll<HTMLElement>(".fq-panel");
    const a = panels[open];
    const b = panels[was];
    if (b && was !== -1) gsap.fromTo(b, { height: b.scrollHeight }, { height: 0, duration: 0.4, ease: "power3.inOut", clearProps: "height" });
    if (a && open !== -1) gsap.fromTo(a, { height: 0 }, { height: "auto", duration: 0.5, ease: "power3.out", clearProps: "height" });
  }, [open]);

  // the questions come up one after another as the board scrolls in
  useEffect(() => {
    const el = root.current;
    if (!el || still()) return;
    let off = () => {};
    let gone = false;
    import("@/lib/scroll").then(({ gsap: g }) => {
      if (gone) return;
      const ctx = g.context(() => {
        const qs = el.querySelectorAll(".fq-item");
        g.from(qs, { y: 22, clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.out", stagger: 0.05, clearProps: "clipPath,transform", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
        if (card.current) g.from(card.current, { y: 40, duration: 0.9, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      }, el);
      off = () => ctx.revert();
    });
    return () => {
      gone = true;
      off();
    };
  }, []);

  const choose = (i: number) => {
    const desktop = window.matchMedia(DESKTOP).matches;
    if (!desktop) {
      // phones: a second tap closes it
      const next = i === open ? -1 : i;
      setOpen(next);
      if (next !== -1) setShown(next);
      return;
    }
    if (i === open) return;
    setOpen(i);
    const c = card.current;
    const el = inner.current;
    if (!c || !el || still()) {
      setShown(i);
      return;
    }
    // the old answer lifts out as the corner peels, then the new one goes down
    gsap.killTweensOf([el, c]);
    gsap
      .timeline({ onComplete: () => setShown(i) })
      .to(c, { "--fq-peel": "46px", duration: 0.26, ease: "power2.out" }, 0)
      .to(el, { y: -16, clipPath: "inset(0 0 100% 0)", duration: 0.24, ease: "power2.in" }, 0);
  };

  const keys = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + items.length) % items.length;
    list.current?.querySelectorAll<HTMLButtonElement>(".fq-q")[n]?.focus();
  };

  return (
    <div className="fq" ref={root}>
      <ul className="fq-list" ref={list}>
        <span className="fq-mark" ref={mark} aria-hidden="true" />
        {items.map((it, i) => (
          <li key={it.q} className="fq-item" data-open={i === open || undefined}>
            <h3 className="fq-h">
              <button
                type="button"
                id={`${uid}-q${i}`}
                className="fq-q"
                aria-expanded={i === open}
                aria-controls={`${uid}-a${i} ${uid}-card`}
                onClick={() => choose(i)}
                onKeyDown={(e) => keys(e, i)}
              >
                <span>{it.q}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 12h12M12 6v12" />
                </svg>
              </button>
            </h3>
            {/* phones: the answer under its question */}
            <div className="fq-panel" id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} inert={i !== open || undefined}>
              <div className="fq-panel-in">
                <p>{it.a}</p>
                {it.href && it.link && (
                  <Link href={it.href} className="text-link">
                    {it.link}
                    <Arrow />
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* wide screens: the answer on a label beside the questions */}
      <div className="fq-card" ref={card} id={`${uid}-card`} role="region" aria-live="polite" aria-labelledby={`${uid}-q${shown}`}>
        <span className="fq-fold" aria-hidden="true" />
        <div className="fq-card-in" ref={inner}>
          <p className="fq-card-q">
            <span>{f.q}</span>
          </p>
          <p className="fq-card-a">{f.a}</p>
          {f.href && f.link && (
            <Link href={f.href} className="text-link fq-card-link">
              {f.link}
              <Arrow />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
