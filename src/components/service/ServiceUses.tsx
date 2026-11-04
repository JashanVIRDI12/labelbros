import type { CSSProperties } from "react";
import { Art } from "@/components/sheet/Art";
import { resized } from "@/lib/image";
import type { Service } from "./services";

/*
 * "Where it goes": the uses, each one a sticker slapped onto the page as it arrives, which turns
 * right over when you point at it (page-motion.ts).
 */
export function ServiceUses({ service }: { service: Service }) {
  return (
    <section className="uses" aria-labelledby="uses-title">
      <h2 id="uses-title" className="section-title uses-title">
        Where it goes.
      </h2>
      <ul className="uses-list" style={{ "--n": service.uses.length } as CSSProperties}>
        {service.uses.map((u) => (
          <li key={u.title} className="use">
            <span className="use-art" data-slap style={{ "--r": `${u.rot}deg`, "--mask": `url(${resized(u.art.src, 256)})` } as CSSProperties}>
              {/* tilt (CSS) > spin (GSAP, on hover) > the sticker, and its paper back in its own shape */}
              <span className="use-tilt">
                <span className="use-spin" data-spin>
                  <span className="spin-front">
                    <Art art={u.art} sizes="(max-width: 1023px) 40vw, 240px" />
                  </span>
                  <span className="spin-back use-back" aria-hidden="true">
                    <i />
                  </span>
                </span>
              </span>
            </span>
            <h3 className="use-title">{u.title}</h3>
            <p className="use-body">{u.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
