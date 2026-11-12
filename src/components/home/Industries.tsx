/*
 * Who we label for, running across the page (CSS; it stops for reduced motion and on hover).
 * Kinds of business, not customers.
 */
const KINDS = [
  "Bakeries",
  "Coffee roasters",
  "Breweries",
  "Candle makers",
  "Skincare brands",
  "Hot sauce",
  "Farmers’ markets",
  "Meal prep",
  "Tea",
  "Soap makers",
  "Jam and preserves",
  "Kombucha",
  "Olive oil",
  "Gift shops",
];

export function Industries() {
  return (
    <section className="ind" aria-label="Made for">
      <p className="ind-lead">Labels for</p>
      <div className="ind-mask">
        <ul className="ind-track">
          {[...KINDS, ...KINDS].map((k, i) => (
            <li key={i} aria-hidden={i >= KINDS.length || undefined}>
              {k}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
