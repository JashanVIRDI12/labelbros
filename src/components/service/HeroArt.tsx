import type { CSSProperties } from "react";
import Image from "next/image";
import type { HeroKind, Placed } from "./services";

/*
 * The hero's artwork, five ways to show a product (page-motion.ts brings each one in and lets it
 * follow the pointer):
 *   collage  stickers slap down one after another
 *   sheet    a kiss-cut sheet; one sticker lifts off it
 *   strip    labels on their liner slide in, then slap down one by one
 *   seal     a seal slaps onto a kraft mailer
 *   ink      a pencil sketch is inked into the finished sticker
 * Each piece: `.ha-pos` places it (CSS), `.ha-move` is what GSAP moves, so the two never fight.
 */

function Piece({ p, i, eager, depth, main }: { p: Placed; i: number; eager: boolean; depth: number; main: boolean }) {
  const style = { "--x": `${p.x}%`, "--y": `${p.y}%`, "--w": `${p.w}%`, "--r": `${p.r}deg` } as CSSProperties;
  return (
    <span className="ha-pos" style={style}>
      <span className="ha-move" data-piece={i} style={{ "--d": depth } as CSSProperties}>
        {/* resized for the screen by Next's image optimiser: a phone never downloads the full file */}
        <Image
          src={p.art.src}
          width={p.art.w}
          height={p.art.h}
          alt={p.alt}
          sizes={`(max-width: 1023px) ${Math.round(p.w * 0.95)}vw, ${Math.round(p.w * 6.4)}px`}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={main ? "high" : "auto"}
          draggable={false}
        />
      </span>
    </span>
  );
}

export function HeroArt({ kind, art }: { kind: HeroKind; art: Placed[] }) {
  // the last piece is the main one (the biggest, and the one other pages show for this service)
  const pieces = (from = 0) =>
    art.map((p, i) => <Piece key={p.art.src + i} p={p} i={i + from} eager main={i === art.length - 1} depth={0.6 + (i % 3) * 0.35} />);
  return (
    <div className="hero-art" data-hero-art data-kind={kind}>
      {kind === "sheet" ? (
        <div className="ha-sheet ha-move" style={{ "--d": 0.3 } as CSSProperties} data-base>
          {pieces()}
        </div>
      ) : kind === "strip" ? (
        <div className="ha-strip ha-move" style={{ "--d": 0.3 } as CSSProperties} data-base>
          {pieces()}
        </div>
      ) : kind === "seal" ? (
        <div className="ha-mailer ha-move" style={{ "--d": 0.25 } as CSSProperties} data-base>
          <Image
            src="/textures/mailer.webp"
            width={900}
            height={567}
            alt=""
            sizes="(max-width: 1023px) 92vw, 620px"
            className="ha-mailer-img"
            draggable={false}
          />
          <span className="ha-mailer-label" aria-hidden="true">
            <b>To</b>
            <span>Your customer</span>
          </span>
          {pieces()}
        </div>
      ) : kind === "ink" ? (
        <div className="ha-ink" data-ink>
          {pieces()}
          <i className="ha-ink-edge" aria-hidden="true" />
        </div>
      ) : (
        pieces()
      )}
    </div>
  );
}
