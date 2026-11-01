"use client";

import { gsap } from "@/lib/gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { CX, CY, dimsFor, type View } from "./pricing-model";

gsap.registerPlugin(MorphSVGPlugin);

/*
 * The pricing preview's motion. Shape changes morph (travel: power2.inOut), the sticker lifts
 * and slaps back down on every change, new copies in the stack slap on one after another, and
 * gloss sends a sheen across. Reduced motion: the same states, set instantly.
 */

const TRAVEL = 0.7;

export function create(svg: SVGSVGElement, reduce: boolean) {
  const $ = <T extends Element>(s: string) => svg.querySelector<T>(s)!;
  const outer = $<SVGPathElement>("#q-outer");
  const inner = $<SVGPathElement>("[data-inner]");
  const art = $<SVGGElement>("[data-art]");
  const scaler = $<SVGGElement>("[data-scale]");
  const lift = $<SVGGElement>("[data-lift]");
  const shadow = $<SVGUseElement>("[data-shadow]");
  const copies = [...svg.querySelectorAll<SVGUseElement>("[data-copy]")].sort(
    (a, b) => Number(a.dataset.copy) - Number(b.dataset.copy),
  );
  const foil = $<SVGRectElement>("[data-foil]");
  const matte = $<SVGRectElement>("[data-matte]");
  const sheen = $<SVGRectElement>("[data-sheen]");
  const dimH = $<SVGLineElement>("[data-dim-h]");
  const dimV = $<SVGLineElement>("[data-dim-v]");
  const dimHLabel = $<SVGGElement>("[data-dim-h-label]");
  const dimVLabel = $<SVGGElement>("[data-dim-v-label]");

  const ctx = gsap.context(() => {});
  let prev: View | null = null;
  const d = (t: number) => (reduce ? 0 : t);

  gsap.set(art, { svgOrigin: `${CX} ${CY}` });
  gsap.set(scaler, { svgOrigin: "0 0" });
  gsap.set(sheen, { x: -80 });
  const sheenX = gsap.quickTo(sheen, "x", { duration: 0.6, ease: "power3.out" });

  const sweep = () => {
    if (reduce) return;
    gsap.fromTo(sheen, { x: -120 }, { x: 330, duration: 0.9, ease: "power2.inOut", overwrite: "auto" });
  };

  function update(v: View) {
    ctx.add(() => {
      const first = prev === null;
      const changed = (k: keyof View) => !prev || prev[k] !== v[k];

      if (changed("outer")) {
        gsap.to(outer, { morphSVG: v.outer, duration: d(TRAVEL), ease: "power2.inOut", overwrite: true });
        gsap.to(inner, { morphSVG: v.inner, duration: d(TRAVEL), ease: "power2.inOut", overwrite: "auto" });
      }
      gsap.to(inner, { opacity: v.innerOn ? 1 : 0, duration: d(0.35), ease: "power2.inOut" });
      gsap.to(art, { scale: v.art, duration: d(TRAVEL), ease: "power2.inOut", overwrite: "auto" });
      gsap.to(scaler, { scale: v.k, duration: d(TRAVEL), ease: "power2.inOut", overwrite: "auto" });

      // measuring lines follow the sticker's edges
      const m = dimsFor(v);
      const lines = { duration: d(TRAVEL), ease: "power2.inOut", overwrite: "auto" as const };
      gsap.to(dimH, { attr: { x1: m.h.x1, x2: m.h.x2, y1: m.h.y, y2: m.h.y }, ...lines });
      gsap.to(dimV, { attr: { x1: m.v.x, x2: m.v.x, y1: m.v.y1, y2: m.v.y2 }, ...lines });
      gsap.to(dimHLabel, { x: (m.h.x1 + m.h.x2) / 2, y: m.h.y - 10, ...lines });
      gsap.to(dimVLabel, { x: m.v.x - 10, y: (m.v.y1 + m.v.y2) / 2, ...lines });

      // the stack: more copies for bigger runs, each one slapping down on the pile
      copies.forEach((c, i) => {
        const on = i < v.copies;
        const was = prev ? i < prev.copies : on;
        if (on && !was) {
          gsap.fromTo(
            c,
            { opacity: 0, y: -26 },
            { opacity: 1, y: 0, duration: d(0.42), ease: "slap", delay: reduce ? 0 : (i - (prev?.copies ?? 0)) * 0.08 },
          );
        } else if (!on && was) {
          gsap.to(c, { opacity: 0, duration: d(0.25), ease: "power2.inOut" });
        }
      });

      // finish
      gsap.to(foil, { opacity: v.finish === "holo" ? 0.85 : 0, duration: d(0.4) });
      gsap.to(matte, { opacity: v.finish === "matte" ? 0.12 : 0, duration: d(0.4) });
      gsap.to(sheen, { opacity: v.finish === "matte" ? 0 : v.finish === "holo" ? 0.6 : 0.5, duration: d(0.3) });
      if (!first && v.finish !== "matte" && (changed("finish") || changed("outer"))) sweep();

      // every change: the sticker lifts and slaps back onto the mat
      if (!first && !reduce) {
        gsap.timeline()
          .to(lift, { y: -12, duration: 0.18, ease: "power2.out" })
          .to(lift, { y: 0, duration: 0.34, ease: "slap" });
        gsap.timeline()
          .to(shadow, { opacity: 0.22, attr: { transform: "translate(10 26)" }, duration: 0.18, ease: "power2.out" })
          .to(shadow, { opacity: 0.4, attr: { transform: "translate(6 14)" }, duration: 0.34, ease: "slap" });
      }
      prev = v;
    });
  }

  return {
    update,
    /** pointer across the preview, 0..1: the sheen follows it */
    pointer(x: number) {
      if (!reduce) sheenX(-120 + x * 450);
    },
    destroy() {
      ctx.revert();
      gsap.killTweensOf([outer, inner, art, scaler, lift, shadow, ...copies, foil, matte, sheen, dimH, dimV, dimHLabel, dimVLabel]);
    },
  };
}
