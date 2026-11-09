import { isSignedIn } from "@/server/auth";
import { ready } from "@/server/env";
import { getFile } from "@/server/inbox";

/*
 * GET /admin/files/<id>: a customer's artwork, for the signed-in shop only. Always sent as a
 * download with a neutral type, so a file (an SVG, say) can never run in the admin's browser.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isSignedIn())) return new Response("Not found", { status: 404 });
  const { id } = await ctx.params;
  if (!ready.db() || !/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const file = await getFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
    },
  });
}
