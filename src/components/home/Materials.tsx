import Link from "next/link";
import { FINISHES, MATERIALS, MATERIALS_FOR } from "@/lib/options";
import { productBySlug, productHref } from "@/lib/products";

/*
 * What labels are printed on: a swatch of each material, what it's for, and a link that opens
 * custom labels already set to it.
 */
export function Materials() {
  const custom = productBySlug("custom-labels");
  return (
    <section className="mats" aria-labelledby="mats-title">
      <div className="sec-head">
        <h2 id="mats-title" className="display sec-title" data-reveal>
          Printed on the right stuff.
        </h2>
        <p className="sec-lede">Every label material comes in any shape and size, on rolls or sheets.</p>
      </div>
      <ul className="mats-list">
        {MATERIALS_FOR("labels").map((m) => {
          const mat = MATERIALS[m];
          return (
            <li key={m}>
              <Link href={custom ? productHref(custom, { material: m }) : "/labels"} className="mat">
                <span className="mat-swatch swatch" data-look={mat.look} aria-hidden="true" />
                <span className="mat-name">{mat.label}</span>
                <span className="mat-note">{mat.note}</span>
                <span className="mat-fin">{mat.finishes.map((f) => FINISHES[f].label).join(" · ")}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
