import type { CSSProperties } from "react";
import Image from "next/image";
import { resized } from "@/lib/image";
import type { Service } from "./services";

/*
 * The finishes side by side, each on the same kind of sticker so the difference is the finish
 * itself. Gloss sends a light across, holographic turns its colour with the scroll and the
 * pointer, glitter twinkles (page-motion.ts); matte and paper stay still on purpose.
 */
export function ServiceFinishes({ service }: { service: Service }) {
  return (
    <section className="fin" aria-labelledby="fin-title">
      <h2 id="fin-title" className="section-title fin-title">
        {service.finishes.length === 2 && service.slug === "custom-design" ? "Before and after." : "Pick the finish."}
      </h2>
      <ul className="fin-list">
        {service.finishes.map((f) => (
          <li key={f.name} className="fin-card" data-look={f.look} data-slap>
            <span className="fin-art" style={{ "--mask": `url(${resized(f.art.src)})` } as CSSProperties}>
              <Image src={f.art.src} width={f.art.w} height={f.art.h} alt="" sizes="(max-width: 767px) 70vw, 380px" loading="lazy" />
              <i className="fin-fx" aria-hidden="true" />
            </span>
            <h3 className="fin-name">{f.name}</h3>
            <p className="fin-body">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
