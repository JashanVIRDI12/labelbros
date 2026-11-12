/** Structured data for search engines. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const settled = (text: string) => !/\[\[[^\]]+\]\]/.test(text);

/** FAQ structured data, for the questions whose answers are final (no [[placeholders]]). */
export function faqData(items: { q: string; a: string }[]) {
  const done = items.filter((i) => settled(i.a));
  if (!done.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: done.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
