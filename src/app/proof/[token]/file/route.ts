import { ready } from "@/server/env";
import { getProofFile } from "@/server/inbox";

/* GET /proof/<token>/file: the proof itself, for the customer holding its private link. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{32}$/.test(token) || !ready.db()) return new Response("Not found", { status: 404 });
  const f = await getProofFile(token);
  if (!f) return new Response("Not found", { status: 404 });
  const safe = f.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(f.bytes), {
    headers: {
      "Content-Type": f.mime,
      "Content-Disposition": `inline; filename="${safe}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
