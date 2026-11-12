/*
 * Customer reviews: REAL ones only, copied word for word with the customer's permission
 * (client rule: never invent reviews or ratings). While this list is empty the site shows
 * visible [[REAL REVIEW]] placeholders and sends search engines no review data at all; add
 * reviews here and the reviews section, its stars and its structured data all follow.
 *
 * Example (delete the slashes to use; every field is shown on the page):
 *   { name: "Sam R.", business: "Fire Escape Hot Sauce", rating: 5, date: "2026-10-30",
 *     text: "Proof came the next morning and the stickers look great.", product: "Die-cut stickers" },
 */

export type Review = {
  name: string;
  business?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** when it was written, YYYY-MM-DD */
  date: string;
  text: string;
  product?: string;
};

export const REVIEWS: Review[] = [];

/**
 * Stand-ins so the section can be seen designed until real reviews arrive (client, 2026-11-12:
 * "add some for now, I will add real ones later"). They are written by us, not customers, so the
 * page marks each one "Sample review", and they never reach the star average or search engines.
 * They disappear as soon as REVIEWS has anything in it.
 */
export const SAMPLE_REVIEWS: Review[] = [
  {
    name: "Maya R.",
    business: "Small-batch jam maker",
    rating: 5,
    date: "2026-11-01",
    text: "The proof came back the next morning with a note that our strawberry sat too close to the edge. They fixed it before we asked. A thousand roll labels later, every jar looks right.",
    product: "Food labels",
  },
  {
    name: "Daniel K.",
    business: "Cold brew roaster",
    rating: 5,
    date: "2026-10-22",
    text: "We moved to rolls for our filling line. The wind direction was confirmed on the proof, so they went straight onto the applicator with no rewinding.",
    product: "Roll labels",
  },
  {
    name: "Priya S.",
    business: "Candle studio",
    rating: 4,
    date: "2026-10-09",
    text: "Started with 500 kraft labels to test, then reordered 2,000 a month later. Paying the bigger order by invoice made it easy to keep stock up.",
    product: "Candle labels",
  },
];

export const averageRating = (list: Review[]) =>
  list.length ? Math.round((list.reduce((n, r) => n + r.rating, 0) / list.length) * 10) / 10 : 0;
