"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";
import { peelShape } from "@/lib/peel";

/*
 * The peel-off pad. One scrubbed timeline: for each label, the fold travels in from the
 * bottom-right corner, the paper back follows it over, and the label leaves the stack up and to
 * the left. The next label straightens as the one above clears it.
 */

const ANGLE = (62 * Math.PI) / 180; // travel: mostly up, a little left
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);
const SHADE_TURN = ANGLE - Math.PI / 2;
const TEASE = 18; // px of corner lifted on the label on top, so it reads as peelable
const HOVER = 26; // extra lift while the pointer is on it
const OFF = 1.16; // how far past "fully peeled" the fold goes, so the label clears the screen

// Same query as the CSS that turns the list into a pad.
// phones get the still layout (a swipeable row / a grid): pinned scrolling is too long there
const MODE = "(min-width: 768px) and (scripting: enabled) and (prefers-reduced-motion: no-preference)";

type Card = {
  el: HTMLElement;
  face: HTMLElement;
  flap: HTMLElement;
  shade: HTMLElement;
  w: number;
  h: number;
  p: number; // peel progress, 0 flat, 1 fully off
  t: number; // how much of the resting tease shows (only on the label on top)
  hover: number;
};

export function init(root: HTMLElement) {
  if (!window.matchMedia(MODE).matches) return () => {};

  const track = root.querySelector<HTMLElement>(".deck-track")!;
  const cards: Card[] = [...root.querySelectorAll<HTMLElement>("[data-card]")].map((el, i) => ({
    el,
    face: el.querySelector<HTMLElement>("[data-face]")!,
    flap: el.querySelector<HTMLElement>("[data-flap]")!,
    shade: el.querySelector<HTMLElement>("[data-shade]")!,
    w: 0,
    h: 0,
    p: 0,
    t: i === 0 ? 1 : 0,
    hover: 0,
  }));
  const n = cards.length;
  const step = Number(root.dataset.step) || 80;
  const lead = (Number(root.dataset.lead) || 0) / step;
  const tail = (Number(root.dataset.tail) || 0) / step;
  const index = [...root.querySelectorAll<HTMLButtonElement>("[data-goto]")];
  const bars = [...root.querySelectorAll<HTMLElement>(".deck-progress i")];
  const holo = [...root.querySelectorAll<HTMLElement>('[data-sticker="label-bros"]')];
  let active = 0;
  let st: ScrollTrigger | null = null;

  const render = (c: Card) => {
    if (!c.w) return;
    const max = c.w * COS + c.h * SIN;
    const s = Math.max(c.p * max, (TEASE + c.hover) * c.t);
    const g = peelShape(c.w, c.h, s, ANGLE);
    c.face.style.clipPath = g.face;
    c.flap.style.clipPath = g.flap;
    c.flap.style.transform = g.matrix;
    // the shade band lies along the fold, on the lifted side
    const qx = c.w - s * COS;
    const qy = c.h - s * SIN;
    c.shade.style.transform = `translate(${qx.toFixed(1)}px,${qy.toFixed(1)}px) rotate(${SHADE_TURN}rad) translate(-1500px,0)`;
  };

  const measure = () => {
    for (const c of cards) {
      c.w = c.face.offsetWidth;
      c.h = c.face.offsetHeight;
      render(c);
    }
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    index.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  };

  const ctx = gsap.context(() => {
    // GSAP owns the pile transforms from here on
    cards.forEach((c) => {
      const css = c.el.style;
      gsap.set(c.el, {
        x: parseFloat(css.getPropertyValue("--x")) || 0,
        y: parseFloat(css.getPropertyValue("--y")) || 0,
        rotation: parseFloat(css.getPropertyValue("--rot")) || 0,
      });
    });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.addLabel("c0", lead);
    cards.forEach((c, i) => {
      if (i === n - 1) return;
      const at = lead + i;
      const next = cards[i + 1];
      tl.to(c, { p: OFF, duration: 1, onUpdate: () => render(c) }, at);
      // the label underneath squares up as it is uncovered
      tl.to(next.el, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "power2.inOut" }, at + 0.3);
      tl.to(next, { t: 1, duration: 0.25, onUpdate: () => render(next) }, at + 0.75);
      tl.addLabel(`c${i + 1}`, at + 1);
    });
    tl.to({}, { duration: tail }, lead + n - 1);
    if (holo.length) tl.fromTo(holo, { "--holo": "0deg" }, { "--holo": "300deg", duration: tl.duration() }, 0);

    st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      animation: tl,
      onRefresh: measure,
    });
    // follow the (smoothed) animation, not the scroll position: after a jump the scrub
    // catches up over a few frames and the index should follow it
    tl.eventCallback("onUpdate", () => {
      const time = tl.time();
      let i = 0;
      while (i < n - 1 && cards[i].p > 0.55) i++;
      setActive(i);
      bars.forEach((bar, k) => {
        const fill = k === 0 ? 1 : gsap.utils.clamp(0, 1, (time - lead - (k - 1)) / 0.7);
        bar.style.setProperty("--p", fill.toFixed(3));
      });
    });
    measure();
    bars.forEach((bar, k) => bar.style.setProperty("--p", k === 0 ? "1" : "0"));
  }, root);

  const scrollFor = (i: number) => {
    if (!st) return 0;
    const tl = st.animation as gsap.core.Timeline;
    return st.start + (st.end - st.start) * ((tl.labels[`c${i}`] ?? 0) / tl.duration());
  };

  // index buttons jump to their label
  const onIndex = (e: Event) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-goto]");
    if (!b) return;
    window.scrollTo({ top: scrollFor(Number(b.dataset.goto)) + 1, behavior: "smooth" });
  };
  // keyboard: focusing a link on a covered label peels everything above it
  const onFocus = (e: FocusEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!card) return;
    const i = Number(card.dataset.card);
    if (i !== active) window.scrollTo({ top: scrollFor(i) + 1, behavior: "instant" });
  };
  // hovering the top label lifts its corner a little further
  const hover = (on: boolean) => (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const i = Number((e.currentTarget as HTMLElement).closest<HTMLElement>("[data-card]")?.dataset.card);
    const c = cards[i];
    if (!c || i !== active) return;
    // "auto" only replaces an earlier hover tween; "true" would also kill this card's scroll peel
    gsap.to(c, { hover: on ? HOVER : 0, duration: on ? 0.55 : 0.4, ease: on ? "expo.out" : "slap", overwrite: "auto", onUpdate: () => render(c) });
  };
  const enter = hover(true);
  const leave = hover(false);

  root.addEventListener("click", onIndex);
  root.addEventListener("focusin", onFocus);
  cards.forEach((c) => {
    c.face.addEventListener("pointerenter", enter);
    c.face.addEventListener("pointerleave", leave);
  });

  return () => {
    root.removeEventListener("click", onIndex);
    root.removeEventListener("focusin", onFocus);
    cards.forEach((c) => {
      c.face.removeEventListener("pointerenter", enter);
      c.face.removeEventListener("pointerleave", leave);
      c.face.style.clipPath = "";
      c.flap.style.clipPath = "";
      c.flap.style.transform = "";
      gsap.killTweensOf(c);
    });
    ctx.revert();
  };
}
