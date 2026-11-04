import type { CSSProperties } from "react";
import { resized } from "@/lib/image";
import { Ph } from "./Ph";
import type { Service } from "./services";

/** What each layer of the cross-section is drawn as (`.xs-bar[data-m]` in service.css). */
function material(name: string) {
  const n = name.toLowerCase();
  if (/laminate|varnish/.test(n)) return "film";
  if (/sketch|idea/.test(n)) return "sketch";
  if (/linework/.test(n)) return "line";
  if (/artwork|colour/.test(n)) return "ink";
  if (/holographic|glitter/.test(n)) return "holo";
  if (/kraft/.test(n)) return "kraft";
  if (/adhesive/.test(n)) return "glue";
  if (/border/.test(n)) return "white";
  if (/cut line/.test(n)) return "cut";
  if (/backing|liner|artboard/.test(n)) return "liner";
  return "face";
}

/*
 * What it is, what it is good for, and what it is made of: the page's main reading, in full, in
 * the page. The layers are drawn as a cross-section, top to bottom; each bar slides in as it
 * arrives (page-motion.ts).
 */
export function ServiceOverview({ service }: { service: Service }) {
  const art = service.hero.art[service.hero.art.length - 1].art;
  return (
    <section className="ov" aria-labelledby="ov-title">
      <div className="ov-text">
        <h2 id="ov-title" className="section-title ov-title">
          {service.overview.title}
        </h2>
        {service.overview.paras.map((p) => (
          <p key={p.slice(0, 24)} className="ov-p">
            <Ph text={p} />
          </p>
        ))}
        <h3 className="ov-sub">Good for</h3>
        <ul className="ov-good">
          {service.overview.good.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>
      <div className="xs" style={{ "--art": `url(${resized(art.src, 256)})` } as CSSProperties}>
        <h3 className="ov-sub">What it is made of</h3>
        <ol className="xs-list" data-strips>
          {service.layers.map((l) => (
            <li key={l.name} className="xs-row">
              <span className="xs-bar" data-m={material(l.name)} aria-hidden="true" />
              <span className="xs-text">
                <b>{l.name}</b>
                <span>
                  <Ph text={l.body} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
