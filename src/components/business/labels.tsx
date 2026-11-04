import type { CSSProperties, ReactNode } from "react";

/*
 * Business label artwork, drawn in the page (crisp type at any size). Sample designs for a
 * made-up company; every number on them is sample data. Each is a label on the press strip: the
 * paper is there from the start, the print (`.pl-ink`) appears as the press prints it (--p).
 */

/** A repeatable sequence of pseudo-random numbers (the same artwork on server and client). */
function sequence(seed: number, count: number) {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807) % 2147483647;
    out.push(s / 2147483647);
  }
  return out;
}

function barsFor(seed: number) {
  const r = sequence(seed, 200);
  let k = 0;
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  while (x < 96) {
    const w = 0.6 + Math.floor(r[k++] * 3) * 0.7;
    bars.push({ x, w });
    x += w + 0.6 + Math.floor(r[k++] * 2) * 0.7;
  }
  return bars;
}

function qrFor(seed: number, N: number) {
  const r = sequence(seed, N * N);
  const finder = (x: number, y: number) => x < 8 && y < 8;
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (finder(x, y) || finder(N - 1 - x, y) || finder(x, N - 1 - y)) continue;
      if (r[y * N + x] > 0.52) cells.push([x, y]);
    }
  return cells;
}

function Bars({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  const bars = barsFor(seed);
  return (
    <svg className={`pl-bars ${className}`} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b) => (
        <rect key={b.x} x={b.x + 2} y="0" width={b.w} height="24" />
      ))}
    </svg>
  );
}

function Qr({ seed = 3 }: { seed?: number }) {
  const N = 21;
  const cells = qrFor(seed, N);
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" className="pl-qr-hole" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg className="pl-qr" viewBox={`0 0 ${N} ${N}`} aria-hidden="true">
      {cells.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />
      ))}
      {eye(0, 0)}
      {eye(N - 7, 0)}
      {eye(0, N - 7)}
    </svg>
  );
}

export type Kind = "shipping" | "asset" | "warning" | "inspection" | "bin" | "badge";

export function PressLabel({ kind, children, style }: { kind: Kind; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`pl pl-${kind}`} data-label={kind} style={style}>
      {/* the face is inside the container, so its corners, stripes and borders are sized by the
          label itself (a container's own properties would be sized by the page instead) */}
      <div className="pl-face">
        <div className="pl-ink" data-ink>
          {children}
        </div>
        <i className="pl-head" aria-hidden="true" />
      </div>
    </div>
  );
}

export const Shipping = () => (
  <PressLabel kind="shipping">
    <div className="pl-ship-top">
      <span className="pl-small">From</span>
      <b>Your company</b>
      <span>Your street, your town</span>
    </div>
    <div className="pl-ship-to">
      <span className="pl-small">To</span>
      <b>Your customer</b>
      <span>Their street, their town</span>
    </div>
    <div className="pl-ship-foot">
      <Bars seed={11} />
      <span className="pl-ship-tag">Priority</span>
    </div>
  </PressLabel>
);

export const Asset = ({ n }: { n: number }) => (
  <PressLabel kind="asset">
    <div className="pl-asset-text">
      <span className="pl-small">Property of</span>
      <b className="pl-asset-co">Your company</b>
      <span className="pl-asset-no">
        Asset <strong data-number={n}>{String(n).padStart(6, "0")}</strong>
      </span>
      <Bars seed={n} />
    </div>
    <Qr seed={n} />
  </PressLabel>
);

export const Warning = () => (
  <PressLabel kind="warning">
    <div className="pl-warn-in">
      <svg className="pl-warn-sign" viewBox="0 0 64 56" aria-hidden="true">
        <path d="M32 3 61 53H3Z" fill="#0d0d0c" />
        <path d="M32 13 52 47H12Z" fill="#ffd21f" />
        <rect x="29.5" y="23" width="5" height="14" rx="2" fill="#0d0d0c" />
        <circle cx="32" cy="42" r="2.8" fill="#0d0d0c" />
      </svg>
      <div>
        <b>Caution</b>
        <strong>Hot surface</strong>
        <span>Do not touch while in use.</span>
      </div>
    </div>
  </PressLabel>
);

export const Inspection = () => (
  <PressLabel kind="inspection">
    <div className="pl-insp-in">
      <span className="pl-insp-stamp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <b>Inspected</b>
        <strong>QC passed</strong>
        <span className="pl-insp-field">By ____________</span>
        <span className="pl-insp-field">Date ____________</span>
      </div>
    </div>
  </PressLabel>
);

export const Bin = () => (
  <PressLabel kind="bin">
    <div className="pl-bin-code">A-03-12</div>
    <div className="pl-bin-foot">
      <span>Aisle A · Shelf 03 · Bin 12</span>
      <Bars seed={31} />
    </div>
  </PressLabel>
);

export const Badge = () => (
  <PressLabel kind="badge">
    <div className="pl-badge-top">
      <b>Hello</b>
      <span>my name is</span>
    </div>
    <div className="pl-badge-name">Sam</div>
  </PressLabel>
);
