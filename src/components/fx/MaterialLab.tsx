"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { FINISHES, MATERIALS, type MaterialId } from "@/lib/options";
import type { MaterialSticker, Substrate } from "./material-sticker";
import { whenReady } from "./when-ready";

/*
 * "Printed on the right stuff": pick a material and a sticker on its backing paper shows it in 3D,
 * close up (material-sticker.ts): the foil, film or fibre, lit by a studio that turns with the
 * pointer, its corner peeled up. Drag the corner to peel it. The list is the way in for keyboards
 * and screen readers, and without WebGL a flat swatch stands in.
 */

const LAB: { id: MaterialId; substrate: Substrate; line: string; href: string }[] = [
  { id: "white-bopp", substrate: "white", line: "White gloss film", href: "/shop/custom-labels?material=white-bopp" },
  { id: "clear-bopp", substrate: "clear", line: "Clear film", href: "/shop/custom-labels?material=clear-bopp" },
  { id: "paper", substrate: "paper", line: "White paper", href: "/shop/custom-labels?material=paper" },
  { id: "kraft", substrate: "kraft", line: "Kraft paper", href: "/shop/custom-labels?material=kraft" },
  { id: "silver", substrate: "silver", line: "Brushed silver", href: "/shop/custom-labels?material=silver" },
  { id: "gold", substrate: "gold", line: "Brushed gold", href: "/shop/custom-labels?material=gold" },
  { id: "holographic", substrate: "holo", line: "Holographic foil", href: "/shop/holographic-stickers" },
  { id: "glitter", substrate: "glitter", line: "Glitter film", href: "/shop/glitter-stickers" },
];

export function MaterialLab({ title = "Printed on the right stuff.", headingId = "lab-title" }: { title?: string; headingId?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<MaterialSticker | null>(null);
  const [pick, setPick] = useState(0);
  const pickRef = useRef(0);
  const [live, setLive] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(!window.matchMedia("(pointer: fine)").matches); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  const m = LAB[pick];
  const mat = MATERIALS[m.id];

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let gone = false;
    const cancel = whenReady(el, async () => {
      const { MaterialSticker } = await import("./material-sticker");
      if (gone) return;
      try {
        const c = new MaterialSticker(el);
        card.current = c;
        await c.init(LAB[pickRef.current].substrate, LAB[pickRef.current].line);
        if (gone) c.destroy();
        else {
          setLive(true);
          // the other materials are made and compiled while the page is idle
          void c.warm(LAB.map((x) => ({ k: x.substrate, line: x.line })));
        }
      } catch {
        /* no WebGL: the flat swatch stays */
      }
    });
    return () => {
      gone = true;
      cancel();
      card.current?.destroy();
      card.current = null;
    };
  }, []);

  const choose = (i: number) => {
    setPick(i);
    pickRef.current = i;
    card.current?.show(LAB[i].substrate, LAB[i].line);
  };

  return (
    <section className="lab" aria-labelledby={headingId}>
      <div className="lab-copy">
        <h2 id={headingId} className="display sec-title" data-reveal>
          {title}
        </h2>
        <p className="sec-lede">Every label in any shape and size, on the material that suits it. Pick one and turn it in the light.</p>
        <div className="lab-list" role="radiogroup" aria-label="Materials">
          {LAB.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={i === pick}
              className="lab-item"
              onClick={() => choose(i)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const n = (i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + LAB.length) % LAB.length;
                choose(n);
                (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
              }}
              tabIndex={i === pick ? 0 : -1}
            >
              <span className="swatch" data-look={MATERIALS[x.id].look} aria-hidden="true" />
              <span className="lab-name">{MATERIALS[x.id].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lab-stage-wrap">
        <div ref={stage} className="lab-stage" data-live={live || undefined}>
          <span className="lab-still swatch" data-look={mat.look} aria-hidden="true">
            <b>YOUR BRAND</b>
          </span>
        </div>
        <div className="lab-detail" aria-live="polite">
          <p className="lab-detail-name">{mat.label}</p>
          <p className="lab-detail-note">{mat.note}</p>
          <p className="lab-detail-fin">{mat.finishes.map((f) => FINISHES[f].label).join(" · ")}</p>
          <Link href={m.href} className="text-link">
            {mat.ranges.includes("labels") ? `Shop labels on ${mat.label.toLowerCase()}` : `Shop ${mat.label.toLowerCase()} stickers`}
            <Arrow />
          </Link>
        </div>
        {live && <p className="lab-hint">{touch ? "Tap the sticker to peel it" : "Drag the corner to peel it"}</p>}
      </div>
    </section>
  );
}
