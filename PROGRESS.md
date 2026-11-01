# Progress

## 2026-11-02: fresh start, hero only

**Why.** The client asked to delete the previous site and redesign from scratch, section by section, starting with an interactive, GSAP-level sticker hero. Reference studied: stickerbros.com.

**Removed.** All of `src/`, `public/`, `tests/`, the old reference docs, PLAN/QA/README/PROGRESS, the old motion-skill files. Backup: `qa/backups/pre-fresh-start-2026-11-02.tgz`.

**Built.** New tokens and type (press blue, liner cream, label yellow; Archivo), header with mobile menu, and the hero: headline, paragraph, both CTAs, and a WebGL sticker table (11 sample stickers: peel on hover, lift and curl on grab, sway and tilt on drag, throw with spin, slap with squash; holo, glitter, kraft, matte and gloss finishes; info chip; keyboard stand-ins; reset). Direction doc: `reference/DESIGN-DIRECTION.md`.

**Tooling.** Tailwind moved from the Turbopack loader to `@tailwindcss/postcss` (the loader stopped picking up CSS edits). Favicon added.

**Verified.** tsc, lint and build pass. Screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080, plus hover, grab, hold, throw, landed, touch drag, keyboard and reduced-motion runs: no console errors. Lighthouse (prod build): mobile 98 / 100 / 100 / 100 (TBT ~60 ms, CLS 0; LCP observed at first paint, simulated 2.4 s), desktop 100 / 100 / 96→100 / 100.

**Next.** Design the next section with the client.
