import Link from "next/link";
import { orderLabel } from "@/components/sheet/quote";
import { Ph } from "@/components/service/Ph";
import { Arrow } from "@/components/site/Arrow";
import { SecondAsk } from "@/components/site/SecondAsk";

type Props = {
  id: string;
  title?: string;
  lede?: string;
  items: { q: string; a: string }[];
  priceHref: string;
};

/* Questions as cream labels you open (native <details>, the `.faq` styles). */
export function Questions({ id, title = "Questions, answered.", lede, items, priceHref }: Props) {
  return (
    <section id="faq" aria-labelledby={id} className="faq">
      <div className="faq-intro">
        <h2 id={id} className="section-title">
          {title}
        </h2>
        <p className="faq-lede">{lede ?? "Still not sure? Upload your design and see your price in a minute, or let us design it for you."}</p>
        <div className="faq-ctas">
          <Link href={priceHref} className="btn btn-primary">
            {orderLabel(priceHref)}
            <Arrow />
          </Link>
          <SecondAsk />
        </div>
      </div>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>
              <span>{item.q}</span>
              <i className="faq-mark" aria-hidden="true" />
            </summary>
            <div className="faq-answer">
              <p>
                <Ph text={item.a} />
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
