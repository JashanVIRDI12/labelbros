"use client";

import { gsap, ScrollTrigger, reducedMotion } from "@/lib/scroll";

/*
 * The motion of the service, services and business pages: one module, hooked up by attributes,
 * loaded after the first paint. Brand eases only: slap (lands, no overshoot), peel, expo.out
 * reveals, power2.inOut travels, power3.out throws, none on scrubs.
 *
 *   [data-hero-art]  the hero's product comes in its own way (data-kind), then follows the pointer
 *                    and drifts as the page scrolls away (CSS variables; the art never fights GSAP)
 *   [data-slap]      slaps onto the page as it arrives
 *   [data-strips]    the cross-section's layers slide in, top to bottom
 *   [data-rules]     the facts panel's rules are drawn across
 *   [data-tape]      a strip of tape runs along the steps with the scroll
 *   [data-look]      finish samples: gloss and vinyl send a light across, holographic turns with
 *                    the scroll and the pointer, glitter twinkles while in view
 *   [data-print]     a business label prints itself in, line by line
 *   [data-spin]      pointing at a label or sticker turns it right over (360 degrees, power3.out:
 *                    a flick that settles); its paper back shows while it faces away
 *
 * Reduced motion: none of it. Everything is in place and still.
 */

const FINE = "(hover: hover) and (pointer: fine)";

export function init(root: HTMLElement) {
  const art = root.querySelector<HTMLElement>("[data-hero-art]");
  if (reducedMotion()) {
    if (art) art.dataset.in = "";
    return () => {};
  }
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: Element, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(type, fn as EventListener);
    offs.push(() => el.removeEventListener(type, fn as EventListener));
  };
  // only what is still below the fold waits to come in; what is on screen is simply there
  const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

  const ctx = gsap.context((self) => {
    /* -------------------------------------------------------------- the hero */
    if (art) {
      const kind = art.dataset.kind;
      const pieces = [...art.querySelectorAll<HTMLElement>("[data-piece]")];
      const base = art.querySelector<HTMLElement>("[data-base]");
      // never fully invisible, so each piece is painted once, at rest
      const SEEN = 0.01;
      const intro = () => {
        const tl = gsap.timeline({ delay: 0.15 });
        const slapIn = (els: HTMLElement[], at: number, stagger = 0.14) =>
          tl.fromTo(
            els,
            { opacity: SEEN, scale: 1.45, y: -24, rotation: (i: number) => (i % 2 ? 14 : -14) },
            { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.6, ease: "slap", stagger },
            at,
          );

        if (kind === "collage") slapIn(pieces, 0);
        if (kind === "sheet" && base) {
          tl.fromTo(
            base,
            { opacity: SEEN, y: 70, rotation: 5 },
            { opacity: 1, y: 0, rotation: 0, duration: 0.75, ease: "power3.out" },
            0,
          );
          slapIn(pieces, 0.35, 0.07);
          // and one sticker comes off the sheet, as kiss-cut stickers do
          tl.to(pieces[0], { y: "-9%", x: "-4%", rotation: -12, scale: 1.1, duration: 0.6, ease: "peel" }, 1.35);
          tl.set(pieces[0], { zIndex: 2, filter: "drop-shadow(10px 22px 18px rgba(3, 8, 48, 0.38))" }, 1.35);
        }
        if (kind === "strip" && base) {
          tl.fromTo(
            base,
            { opacity: SEEN, xPercent: 34 },
            { opacity: 1, xPercent: 0, duration: 0.85, ease: "power3.out" },
            0,
          );
          slapIn(pieces, 0.4, 0.12);
          tl.to(pieces[1], { y: "-14%", rotation: -6, scale: 1.08, duration: 0.6, ease: "peel" }, 1.45);
        }
        if (kind === "seal" && base) {
          tl.fromTo(
            base,
            { opacity: SEEN, y: 50, rotation: -3 },
            { opacity: 1, y: 0, rotation: 0, duration: 0.7, ease: "power3.out" },
            0,
          );
          tl.fromTo(
            pieces,
            { opacity: SEEN, scale: 1.8, rotation: -40, y: -80 },
            { opacity: 1, scale: 1, rotation: 0, y: 0, duration: 0.55, ease: "slap" },
            0.45,
          );
        }
        if (kind === "ink") {
          const ink = art.querySelector<HTMLElement>("[data-ink]")!;
          tl.fromTo(
            pieces,
            { opacity: SEEN, scale: 1.12 },
            { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" },
            0,
          );
          tl.fromTo(ink, { "--ink": "0%" }, { "--ink": "100%", duration: 1.3, ease: "power2.inOut" }, 0.45);
          tl.fromTo(
            ink.querySelector(".ha-ink-edge"),
            { opacity: 0 },
            { opacity: 1, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.9 },
            0.45,
          );
        }
        if (kind === "fan") {
          slapIn(pieces, 0, 0.16);
          const labels = pieces
            .map((p) => p.querySelector<HTMLElement>("[data-label]"))
            .filter((x): x is HTMLElement => !!x);
          tl.fromTo(labels, { "--p": 0 }, { "--p": 1, duration: 0.9, ease: "power1.inOut", stagger: 0.22 }, 0.35);
        }
        // states are set: show it
        art.dataset.in = "";
      };
      // The intro waits for the art to load and paint at rest (at most 1.5 s): a phone records
      // its largest paint at that size, not mid-slap at 1.45× and turned, which would beat the
      // heading and the lede and make the page wait on an image.
      const imgs = [...art.querySelectorAll<HTMLImageElement>("img")];
      const loaded = Promise.all(
        imgs.map((img) =>
          img.complete
            ? null
            : new Promise<void>((done) => {
                img.addEventListener("load", () => done(), { once: true });
                img.addEventListener("error", () => done(), { once: true });
              }),
        ),
      );
      let gone = false;
      offs.push(() => {
        gone = true;
      });
      Promise.race([loaded, new Promise((done) => setTimeout(done, 1500))]).then(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!gone) self.add(intro);
          }),
        ),
      );

      // it follows the pointer: the art turns towards it, each piece floats at its own depth
      if (window.matchMedia(FINE).matches) {
        const px = gsap.quickTo(art, "--px", { duration: 0.8, ease: "power3.out" });
        const py = gsap.quickTo(art, "--py", { duration: 0.8, ease: "power3.out" });
        const hero = art.closest("section") ?? art;
        on(hero, "pointermove", (e) => {
          const r = art.getBoundingClientRect();
          px(gsap.utils.clamp(-1.4, 1.4, ((e.clientX - r.left) / r.width) * 2 - 1));
          py(gsap.utils.clamp(-1.4, 1.4, ((e.clientY - r.top) / r.height) * 2 - 1));
        });
        on(hero, "pointerleave", () => {
          px(0);
          py(0);
        });
      }
      // and drifts apart as the page scrolls on
      gsap.fromTo(
        art,
        { "--sy": 0 },
        { "--sy": 1, ease: "none", scrollTrigger: { trigger: art, start: "top top", end: "bottom top", scrub: 0.5 } },
      );
    }

    /* -------------------------------------------------------------- arrivals */
    const slaps = gsap.utils.toArray<HTMLElement>("[data-slap]", root).filter(below);
    gsap.set(slaps, { "--s": 1 });
    ScrollTrigger.batch(slaps, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { "--s": 0, duration: 0.55, ease: "slap", stagger: 0.09, overwrite: true }),
    });

    gsap.utils.toArray<HTMLElement>("[data-strips]", root).forEach((list) => {
      if (!below(list)) return;
      const bars = list.querySelectorAll<HTMLElement>(".xs-bar");
      gsap.set(bars, { scaleX: 0, transformOrigin: "0% 50%" });
      ScrollTrigger.create({
        trigger: list,
        start: "top 85%",
        once: true,
        onEnter: () => gsap.to(bars, { scaleX: 1, duration: 0.6, ease: "slap", stagger: 0.1 }),
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-rules]", root).forEach((dl) => {
      if (!below(dl)) return;
      const rows = dl.querySelectorAll<HTMLElement>(".facts-row");
      gsap.set(rows, { "--rule": 0 });
      ScrollTrigger.create({
        trigger: dl,
        start: "top 85%",
        once: true,
        onEnter: () => gsap.to(rows, { "--rule": 1, duration: 0.5, ease: "expo.out", stagger: 0.07, delay: 0.25 }),
      });
    });

    // across under the steps; on phones, where the steps stack, down behind their icons
    const down = window.matchMedia("(max-width: 767px)").matches;
    gsap.utils.toArray<HTMLElement>("[data-tape]", root).forEach((tape) => {
      gsap.fromTo(tape, down ? { scaleY: 0 } : { scaleX: 0 }, {
        ...(down ? { scaleY: 1, transformOrigin: "50% 0%" } : { scaleX: 1, transformOrigin: "0% 50%" }),
        ease: "none",
        scrollTrigger: { trigger: tape.parentElement, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-print]", root).forEach((box) => {
      if (!below(box)) return;
      const label = box.querySelector<HTMLElement>("[data-label]");
      if (!label) return;
      gsap.set(label, { "--p": 0 });
      ScrollTrigger.create({
        trigger: box,
        start: "top 82%",
        once: true,
        onEnter: () => gsap.to(label, { "--p": 1, duration: 1, ease: "power1.inOut" }),
      });
    });

    /* -------------------------------------------------------------- a full turn on hover */
    gsap.utils.toArray<HTMLElement>("[data-spin]", root).forEach((spin) => {
      const front = spin.querySelector<HTMLElement>(".spin-front");
      const back = spin.querySelector<HTMLElement>(".spin-back");
      const card = spin.closest<HTMLElement>("li") ?? spin;
      if (!front || !back) return;
      gsap.set(spin, { transformPerspective: 900 });
      gsap.set(back, { autoAlpha: 0 });
      let facing = true;
      const face = () => {
        // facing you while the turn is in its first or last quarter; the back shows in between
        const a = (((gsap.getProperty(spin, "rotationY") as number) % 360) + 360) % 360;
        const now = a < 90 || a > 270;
        if (now === facing) return;
        facing = now;
        gsap.set(front, { autoAlpha: now ? 1 : 0 });
        gsap.set(back, { autoAlpha: now ? 0 : 1 });
      };
      let turning: gsap.core.Timeline | null = null;
      on(card, "pointerenter", () => {
        if (turning?.isActive()) return;
        turning = gsap
          .timeline({ onComplete: () => void gsap.set(spin, { rotationY: 0 }) })
          .fromTo(spin, { rotationY: 0 }, { rotationY: 360, duration: 1.1, ease: "power3.out", onUpdate: face }, 0)
          .fromTo(spin, { scale: 1 }, { scale: 1.07, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }, 0);
      });
    });

    /* -------------------------------------------------------------- finish samples */
    gsap.utils.toArray<HTMLElement>("[data-look]", root).forEach((card) => {
      const look = card.dataset.look;
      const fx = card.querySelector<HTMLElement>(".fin-art");
      if (!fx) return;
      if (look === "gloss" || look === "vinyl") {
        const sweep = () =>
          gsap.fromTo(fx, { "--gx": "130%" }, { "--gx": "-30%", duration: 1.2, ease: "power2.inOut", overwrite: true });
        ScrollTrigger.create({ trigger: card, start: "top 75%", once: true, onEnter: () => void sweep() });
        on(card, "pointerenter", () => void sweep());
      }
      if (look === "holo") {
        gsap.fromTo(
          fx,
          { "--holo": "0deg" },
          {
            "--holo": "300deg",
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
        const gx = gsap.quickTo(fx, "--gx", { duration: 0.6, ease: "power3.out" });
        on(card, "pointermove", (e) => {
          const r = card.getBoundingClientRect();
          gx(130 - ((e.clientX - r.left) / r.width) * 160);
        });
      }
      if (look === "glitter") {
        const tw = gsap.to(fx, { "--tw": 1, duration: 0.45, ease: "steps(3)", repeat: -1, yoyo: true, paused: true });
        ScrollTrigger.create({
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tw.play() : tw.pause()),
        });
      }
    });
  }, root);

  return () => {
    offs.forEach((off) => off());
    ctx.revert();
    if (art) delete art.dataset.in;
  };
}
