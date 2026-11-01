# Progress

## 2026-11-02 (later): five sections below the hero

**Why.** The client asked for the next sections: card designs with strong GSAP scroll effects, plus the other sections the homepage needs, in the sticker-table language.

**Built.** Products as a peel-off pad of label-cards (`#stickers`, `#labels`); How it works as a proof that builds itself (`#process`); a to-scale pricing builder on a cream band (`#pricing`); the sample kit envelope (`#samples`); the footer with the giant wordmark sticker. Details in `reference/DESIGN-DIRECTION.md`. Fixed on the way: sticker fonts finished "loading" early where Arial is missing, and `Placement` was missing its `s` field (tsc failed).

**Verified.** tsc, lint and build pass. Screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080 at several scroll points per section, plus hover, keyboard focus, index jump, `#labels` anchor and reduced-motion runs; no horizontal overflow, no console errors. An independent design review found 14 issues; the high and medium ones are fixed (price under the fold, phone step sync, focus on cream, art overlapping copy, kit fan cut off, kit CTA order, reduced-motion grid, rhythm). Lighthouse in the cloud container (no GPU, so the hero's WebGL runs in software): hero alone 69 / TBT 8.3 s, full page 68 / TBT 8.8 s, LCP 2.4 s (hero alone 2.0 s), CLS 0, A11y / Best Practices / SEO 100. Re-run Lighthouse on a machine with a GPU for the real numbers.

**Next.** Real prices, kit contents, turnaround times and links (all `[[PLACEHOLDERS]]`). Consider lazy-loading the pricing builder's client code to win back the 0.4 s of LCP.

## 2026-11-02: fresh start, hero only

**Why.** The client asked to delete the previous site and redesign from scratch, section by section, starting with an interactive, GSAP-level sticker hero. Reference studied: stickerbros.com.

**Removed.** All of `src/`, `public/`, `tests/`, the old reference docs, PLAN/QA/README/PROGRESS, the old motion-skill files. Backup: `qa/backups/pre-fresh-start-2026-11-02.tgz`.

**Built.** New tokens and type (press blue, liner cream, label yellow; Archivo), header with mobile menu, and the hero: headline, paragraph, both CTAs, and a WebGL sticker table (11 sample stickers: peel on hover, lift and curl on grab, sway and tilt on drag, throw with spin, slap with squash; holo, glitter, kraft, matte and gloss finishes; info chip; keyboard stand-ins; reset). Direction doc: `reference/DESIGN-DIRECTION.md`.

**Tooling.** Tailwind moved from the Turbopack loader to `@tailwindcss/postcss` (the loader stopped picking up CSS edits). Favicon added.

**Verified.** tsc, lint and build pass. Screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080, plus hover, grab, hold, throw, landed, touch drag, keyboard and reduced-motion runs: no console errors. Lighthouse (prod build): mobile 98 / 100 / 100 / 100 (TBT ~60 ms, CLS 0; LCP observed at first paint, simulated 2.4 s), desktop 100 / 100 / 96→100 / 100.

**Next.** Design the next section with the client.
