"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";

/*
 * "Follow one sticker", pinned and scrubbed by the scroll (one timeline unit per step).
 * The table is a cutting mat in perspective (the desk tilts back, the mat is turned a little so
 * the path runs across it). The five things lie on the mat; for each step the camera glides to
 * the next one (power2.inOut), the last one lies back down and fades as the camera leaves it,
 * and this one stands up off the mat on its bottom edge, leaning back a little (power3.out), then
 * shows its moment:
 *   1. the artwork file slides in and lands on the sketch, and the sketch is inked into artwork
 *   2. the cut line is traced round the sticker
 *   3. a cursor clicks Approve and the approval seal slaps on
 *   4. printed copies slap down on the sheet, then one peels up
 *   5. the shipping label and the Label Bros seal slap onto the mailer
 * Only the thing in hand shows: the next fades in as the camera arrives, the last fades as it
 * leaves, so the same sticker is never on screen twice.
 * The job ticket follows: done steps tick, the current one opens. Every tween states where it
 * starts (fromTo), so a refresh can never shift a starting value; only the first tween of each
 * thing renders its start at once (immediateRender), or a later one would overwrite it.
 * Reduced motion or no scripts: none of this; the CSS lays the five things out flat.
 */

const MODE = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
const MAT = "/how/mat.webp"; // the photographed cutting mat (generated)

/**
 * The cutting mat, painted into a canvas: the photo's light and grain in the brand blue
 * (luminosity), dimmed a touch so it sits behind the copy. A canvas, not a CSS background, so it is
 * never counted as the page's largest paint.
 */
function paintMat(host: HTMLElement) {
  const img = new Image();
  img.decoding = "async";
  img.src = MAT;
  const canvas = document.createElement("canvas");
  let cancelled = false;
  img
    .decode()
    .then(() => {
      if (cancelled) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const c = canvas.getContext("2d")!;
      c.fillStyle = "#132a9e";
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.globalCompositeOperation = "luminosity";
      c.drawImage(img, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.fillStyle = "rgba(19, 42, 158, 0.38)";
      c.fillRect(0, 0, canvas.width, canvas.height);
      // no hard slab: the far edge and the sides fade into the page. Baked into the pixels (a CSS
      // mask on a layer that moves in 3D costs frames on every scroll)
      const W = canvas.width;
      const H = canvas.height;
      c.globalCompositeOperation = "destination-in";
      const far = c.createLinearGradient(0, 0, 0, H * 0.26);
      far.addColorStop(0, "rgba(0,0,0,0)");
      far.addColorStop(1, "rgba(0,0,0,1)");
      c.fillStyle = far;
      c.fillRect(0, 0, W, H);
      const sides = c.createLinearGradient(0, 0, W, 0);
      sides.addColorStop(0, "rgba(0,0,0,0)");
      sides.addColorStop(0.09, "rgba(0,0,0,1)");
      sides.addColorStop(0.91, "rgba(0,0,0,1)");
      sides.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sides;
      c.fillRect(0, 0, W, H);
      host.appendChild(canvas);
      requestAnimationFrame(() => (canvas.dataset.ready = ""));
    })
    .catch(() => {});
  return () => {
    cancelled = true;
    canvas.remove();
  };
}
const TILT = 56; // how far the desk leans back
const TURN = -12; // the mat, turned on the desk
const STAND = TILT - 14; // standing, a thing leans back a little, so it stays on the table
const LIFT = 20; // and comes up off the mat only a touch
const LEAD = 0.3; // scroll before the first step

export function init(root: HTMLElement) {
  if (!window.matchMedia(MODE).matches) return () => {};
  const q = gsap.utils.selector(root);
  const track = q<HTMLElement>(".how-track")[0];
  const desk = q<HTMLElement>("[data-desk]")[0];
  const plane = q<HTMLElement>("[data-plane]")[0];
  const cam = q<HTMLElement>("[data-cam]")[0];
  const stations = q<HTMLElement>("[data-station]");
  // each thing: the outer layer turns on the mat (about its centre) and lifts; its face stands
  // up on its bottom edge. One layer cannot do both: two pivots for two turns drift sideways.
  const faces = stations.map((s) => s.querySelector<HTMLElement>("[data-face]")!);
  const shadows = q<HTMLElement>("[data-shadow]");
  const pencil = q<HTMLElement>("[data-pencil]")[0];
  const mat = q<HTMLElement>(".desk-mat")[0];
  const steps = q<HTMLElement>("[data-step]");
  const dots = q<HTMLElement>("[data-dot]");
  if (!track || !desk || !plane || !cam || !stations.length) return () => {};

  const dropped = stations.map((s) => parseFloat(getComputedStyle(s).getPropertyValue("--r")) || 0);
  const centre = (i: number) => {
    const s = stations[i];
    return { x: s.offsetLeft + s.offsetWidth / 2, y: s.offsetTop + s.offsetHeight / 2 };
  };

  let state = "";
  const setActive = (i: number, done: number) => {
    if (state === `${i}/${done}`) return;
    state = `${i}/${done}`;
    const mark = (el: HTMLElement, k: number) => {
      if (k === i) el.dataset.active = "true";
      else delete el.dataset.active;
      if (k < done) el.dataset.done = "";
      else delete el.dataset.done;
    };
    steps.forEach((li, k) => {
      mark(li, k);
      if (k === i) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    dots.forEach(mark);
  };

  const ctx = gsap.context(() => {
    gsap.set(desk, { rotationX: TILT });
    gsap.set(plane, { rotation: TURN });
    stations.forEach((s, i) => gsap.set(s, { rotation: dropped[i], z: 2, transformOrigin: "50% 50%" }));
    faces.forEach((f) => gsap.set(f, { rotationX: 0, transformOrigin: "50% 100%" }));
    shadows.forEach((s, i) => gsap.set(s, { rotation: dropped[i], z: 1, transformOrigin: "50% 50%" }));
    if (pencil) gsap.set(pencil, { z: 1 });
    // only the thing in hand is on the table in view: the others arrive with the camera
    gsap.set(faces.slice(1), { opacity: 0 });
    gsap.set(shadows.slice(1), { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    // the camera starts over the first thing
    tl.fromTo(cam, { x: () => -centre(0).x, y: () => -centre(0).y }, { x: () => -centre(0).x, y: () => -centre(0).y, duration: 0.01 }, 0);

    // standing, the shadow is a thin strip where it stands: near its bottom edge
    const foot = (i: number) => shadows[i].offsetHeight * 0.4;
    const stand = (i: number, at: number) => {
      const up = { duration: 0.4, ease: "power3.out" };
      // it comes into view as the camera arrives (the first one is there from the start)
      if (i > 0) {
        const show = { duration: 0.24, ease: "power1.out", immediateRender: false };
        tl.fromTo(faces[i], { opacity: 0 }, { opacity: 1, ...show }, at - 0.24);
        tl.fromTo(shadows[i], { autoAlpha: 0 }, { autoAlpha: 1, ...show }, at - 0.24);
      }
      tl.fromTo(stations[i], { rotation: dropped[i], z: 2 }, { rotation: -TURN, z: LIFT, ...up }, at);
      tl.fromTo(faces[i], { rotationX: 0 }, { rotationX: -STAND, ...up }, at);
      // a tight contact shadow where it stands
      tl.fromTo(shadows[i], { scaleY: 1, y: 0 }, { scaleY: 0.16, y: () => foot(i), ...up }, at);
    };
    // it lies back down, then fades as the camera moves on (only what is coming stays in view)
    const lie = (i: number, at: number) => {
      const down = { duration: 0.32, ease: "power2.inOut", immediateRender: false };
      tl.fromTo(stations[i], { rotation: -TURN, z: LIFT }, { rotation: dropped[i], z: 2, ...down }, at);
      tl.fromTo(faces[i], { rotationX: -STAND }, { rotationX: 0, ...down }, at);
      tl.fromTo(shadows[i], { scaleY: 0.16, y: () => foot(i) }, { scaleY: 1, y: 0, ...down }, at);
      const fade = { duration: 0.22, ease: "power1.in", immediateRender: false };
      tl.fromTo(i === 0 && pencil ? [faces[i], pencil] : faces[i], { opacity: 1 }, { opacity: 0, ...fade }, at + 0.2);
      tl.fromTo(shadows[i], { autoAlpha: 1 }, { autoAlpha: 0, ...fade }, at + 0.2);
    };
    const travel = (from: number, to: number, at: number) =>
      tl.fromTo(
        cam,
        { x: () => -centre(from).x, y: () => -centre(from).y },
        { x: () => -centre(to).x, y: () => -centre(to).y, duration: 0.5, ease: "power2.inOut", immediateRender: false },
        at,
      );

    /* 1. the file lands on the sketch; the sketch is inked into artwork (the "just an idea" route) */
    stand(0, 0);
    tl.fromTo("[data-file]", { xPercent: 70, yPercent: 40, rotation: 22, opacity: 0 }, { xPercent: 0, yPercent: 0, rotation: -6, opacity: 1, duration: 0.24, ease: "slap" }, LEAD + 0.2);
    tl.fromTo("[data-ink]", { "--ink": "0%" }, { "--ink": "100%", duration: 0.32, ease: "power2.inOut" }, LEAD + 0.44);
    tl.addLabel("s0", LEAD + 0.78);

    /* 2. the cut line */
    travel(0, 1, LEAD + 0.8);
    lie(0, LEAD + 0.78);
    stand(1, LEAD + 1.05);
    tl.fromTo("[data-cut]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.45, ease: "power1.inOut" }, LEAD + 1.4);
    tl.fromTo("[data-cut-tag]", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.15, ease: "slap" }, LEAD + 1.75);
    tl.addLabel("s1", LEAD + 1.9);

    /* 3. approved */
    travel(1, 2, LEAD + 1.95);
    lie(1, LEAD + 1.93);
    stand(2, LEAD + 2.2);
    tl.fromTo("[data-cursor]", { xPercent: 260, yPercent: 220, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.28, ease: "power2.inOut" }, LEAD + 2.5);
    tl.fromTo("[data-approve]", { scale: 1 }, { scale: 0.92, duration: 0.04, yoyo: true, repeat: 1 }, LEAD + 2.78);
    tl.fromTo("[data-seal]", { "--slap": 1 }, { "--slap": 0, duration: 0.18, ease: "slap" }, LEAD + 2.84);
    tl.addLabel("s2", LEAD + 3.02);

    /* 4. printed and cut */
    travel(2, 3, LEAD + 3.05);
    lie(2, LEAD + 3.03);
    stand(3, LEAD + 3.3);
    tl.fromTo("[data-copy]", { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: "slap", stagger: 0.05 }, LEAD + 3.55);
    // and one peels up off the sheet, ready to use
    tl.fromTo(
      '[data-copy="0"]',
      { yPercent: 0, xPercent: 0, rotation: 0, filter: "drop-shadow(0px 0px 0px rgba(30,24,10,0))" },
      { yPercent: -24, xPercent: -10, rotation: -16, filter: "drop-shadow(6px 16px 10px rgba(30,24,10,0.35))", duration: 0.2, ease: "peel" },
      LEAD + 3.95,
    );
    tl.addLabel("s3", LEAD + 4.15);

    /* 5. on its way */
    travel(3, 4, LEAD + 4.15);
    lie(3, LEAD + 4.13);
    stand(4, LEAD + 4.4);
    tl.fromTo("[data-ship]", { scale: 1.6, rotation: -24, opacity: 0 }, { scale: 1, rotation: -4, opacity: 1, duration: 0.18, ease: "slap" }, LEAD + 4.65);
    tl.fromTo("[data-mseal]", { scale: 1.8, rotation: 20, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.16, ease: "slap" }, LEAD + 4.85);
    tl.addLabel("s4", LEAD + 5.05);
    tl.to({}, { duration: 0.35 }, LEAD + 5.0);
    tl.addLabel("end", tl.duration());

    // the ticket follows the scene: done steps tick, the current one opens
    const marks = [0, LEAD + 1.05, LEAD + 2.2, LEAD + 3.3, LEAD + 4.4];
    tl.eventCallback("onUpdate", () => {
      const t = tl.time();
      let i = 0;
      while (i < marks.length - 1 && t >= marks[i + 1]) i++;
      // once the last moment has played, every step is done and none is current
      if (t >= LEAD + 5) setActive(-1, steps.length);
      else setActive(i, i);
    });
    setActive(0, 0);

    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      // no snap: the page only ever moves when you scroll it
      scrub: 0.8,
      animation: tl,
      invalidateOnRefresh: true,
    });
  }, root);

  const unpaint = mat ? paintMat(mat) : () => {};

  return () => {
    unpaint();
    ctx.revert();
    for (const list of [steps, dots])
      list.forEach((el, k) => {
        if (k === 0) el.dataset.active = "true";
        else delete el.dataset.active;
        delete el.dataset.done;
      });
    steps.forEach((li) => li.removeAttribute("aria-current"));
  };
}
