import type { CSSProperties } from "react";
import { JsonLd } from "@/components/site/JsonLd";
import { Ph } from "@/components/site/Ph";
import { REVIEWS, SAMPLE_REVIEWS, averageRating, type Review } from "@/lib/reviews";
import { BASE_URL, BRAND } from "@/lib/site";

/*
 * "Stuck on us": what customers say, each review a cream label slapped on the table at its own
 * angle. Fed by REVIEWS (lib/reviews.ts). Until it has real ones, the SAMPLE_REVIEWS stand in,
 * each marked "Sample review" on the page, with no average and no structured data; with real
 * reviews it adds the average and Review/AggregateRating data for search engines.
 */

const TILT = [-2.2, 1.6, -1.1, 2, -1.6, 1.2];

function Stars({ n, label }: { n: number; label: string }) {
  return (
    <span className="rv-stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden="true" data-on={i <= Math.round(n) || undefined}>
          <path d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ r, i, sample = false }: { r: Review; i: number; sample?: boolean }) {
  return (
    <li className="rv-card" style={{ "--tilt": `${TILT[i % TILT.length]}deg` } as CSSProperties}>
      {sample && <p className="rv-sample">Sample review</p>}
      <Stars n={r.rating} label={`${r.rating} out of 5 stars`} />
      <blockquote className="rv-text">
        <p>“{r.text}”</p>
      </blockquote>
      <p className="rv-who">
        <b>{r.name}</b>
        {r.business && <span>{r.business}</span>}
      </p>
      {r.product && <p className="rv-product">{r.product}</p>}
    </li>
  );
}

function Placeholder({ i }: { i: number }) {
  return (
    <li className="rv-card rv-empty" style={{ "--tilt": `${TILT[i]}deg` } as CSSProperties}>
      <Stars n={0} label="Rating to come" />
      <p className="rv-text">
        <Ph text="[[REAL REVIEW: a customer's own words, with permission]]" />
      </p>
      <p className="rv-who">
        <b>
          <Ph text="[[NAME]]" />
        </b>
        <span>
          <Ph text="[[BUSINESS]]" />
        </span>
      </p>
    </li>
  );
}

export function Reviews() {
  const avg = averageRating(REVIEWS);
  return (
    <section aria-labelledby="reviews-title" className="rv">
      <div className="rv-head">
        <h2 id="reviews-title" className="section-title">
          Stuck on us.
        </h2>
        {REVIEWS.length > 0 ? (
          <p className="rv-sum">
            <Stars n={avg} label={`Rated ${avg} out of 5`} />
            <span>
              <b>{avg.toFixed(1)}</b> from {REVIEWS.length} {REVIEWS.length === 1 ? "review" : "reviews"}
            </span>
          </p>
        ) : (
          <p className="rv-sum">What customers say about their proofs, their labels and their reorders.</p>
        )}
      </div>
      <ul className="rv-list">
        {REVIEWS.length > 0
          ? REVIEWS.slice(0, 6).map((r, i) => <Card key={`${r.name}-${r.date}`} r={r} i={i} />)
          : SAMPLE_REVIEWS.length > 0
            ? SAMPLE_REVIEWS.map((r, i) => <Card key={`${r.name}-${r.date}`} r={r} i={i} sample />)
            : [0, 1, 2].map((i) => <Placeholder key={i} i={i} />)}
      </ul>
      {REVIEWS.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: BRAND,
            url: BASE_URL,
            aggregateRating: { "@type": "AggregateRating", ratingValue: avg, reviewCount: REVIEWS.length, bestRating: 5, worstRating: 1 },
            review: REVIEWS.map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.name },
              datePublished: r.date,
              reviewBody: r.text,
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            })),
          }}
        />
      )}
    </section>
  );
}
