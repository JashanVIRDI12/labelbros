/** Text with [[PLACEHOLDERS]] shown as visible placeholders (facts the client still has to give). */
export function Ph({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") ? (
          <span key={i} className="ph">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}
