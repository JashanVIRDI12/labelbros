import Link from "next/link";

const TOKEN = /(\[\[[^\]]+\]\]|\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/**
 * A line of policy text with three small marks: [[PLACEHOLDER]] (shown as a visible placeholder),
 * [words](/path) (a link) and **words** (bold). Keeps the policy pages readable as plain data.
 */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .split(TOKEN)
        .filter(Boolean)
        .map((t, i) => {
          if (t.startsWith("[[")) {
            return (
              <span key={i} className="ph">
                {t}
              </span>
            );
          }
          const link = t.match(LINK);
          if (link) {
            return link[2].startsWith("/") ? (
              <Link key={i} href={link[2]}>
                {link[1]}
              </Link>
            ) : (
              <a key={i} href={link[2]} rel="noopener noreferrer" target="_blank">
                {link[1]}
              </a>
            );
          }
          if (t.startsWith("**")) return <b key={i}>{t.slice(2, -2)}</b>;
          return t;
        })}
    </>
  );
}
