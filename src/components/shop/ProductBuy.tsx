"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { ACCEPT, accepted } from "@/components/sections/artwork";
import { UPLOAD_MB } from "@/lib/api";
import { addLine, openCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { CALL, FILES, money, priceIn, PROOF, type Finish } from "@/lib/facts";
import { FINISH_LABEL, MAX_PACKS, sizeLabel, unitPriceUsd, type Product } from "@/lib/products";

/*
 * The buy panel: the choices the product has (finish; size and quantity on custom products), the
 * artwork (their file, or ours to design), notes and how many packs, then Add to cart (or Buy
 * now, straight to the cart). The price on the button follows every choice.
 */

const sizeOf = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);

function Chips<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="buy-field">
      <legend className="buy-label">{legend}</legend>
      <div className="chips">
        {options.map((o) => (
          <label key={String(o.id)} className="chip">
            <input type="radio" name={name} checked={o.id === value} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProductBuy({ p }: { p: Product }) {
  const router = useRouter();
  const cur = useCurrency();
  const [finish, setFinish] = useState<Finish>(p.finishes[0]);
  const [size, setSize] = useState<number | undefined>(p.kind === "custom" ? (p.sizes?.includes(3) ? 3 : p.sizes?.[0]) : p.size);
  const [qty, setQty] = useState<number | undefined>(p.kind === "custom" ? (p.quantities?.includes(100) ? 100 : p.quantities?.[0]) : p.qty);
  const [packs, setPacks] = useState(1);
  const [artwork, setArtwork] = useState<"upload" | "design">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const choice = { finish, size, qty, packs };
  const unit = priceIn(unitPriceUsd(p, choice), cur);
  const total = unit * (p.kind === "deal" ? packs : 1);

  const take = (f?: File | null) => {
    setError(null);
    if (!f) return;
    if (!accepted(f)) return setError(`We take ${FILES} files. Send others when we reply.`);
    if (f.size > UPLOAD_MB * 1e6) return setError(`That file is over ${UPLOAD_MB} MB. Add a link to it in the notes, or send it when we reply.`);
    setFile(f);
  };

  async function add(go: boolean) {
    if (artwork === "design" && notes.trim().length < 10) {
      setError("Tell us your idea: what it says and shows, colours, style.");
      document.getElementById("buy-notes")?.focus();
      return;
    }
    setBusy(true);
    await addLine(
      { slug: p.slug, finish, size, qty, packs: p.kind === "deal" ? packs : 1, artwork, notes: notes.trim() || undefined },
      artwork === "upload" ? file : null,
    );
    setBusy(false);
    setFile(null);
    setNotes("");
    if (go) router.push("/cart");
    else openCart();
  }

  return (
    <div className="buy">
      <p className="buy-price" aria-live="polite">
        {money(total, cur)} <span>{cur.toUpperCase()}</span>
        {p.kind === "deal" && p.valueUsd ? (
          <s>
            {money(priceIn(p.valueUsd, cur) * packs, cur)}
          </s>
        ) : null}
      </p>
      <p className="buy-each">
        {qty && `${qty.toLocaleString("en-CA")} ${p.product === "labels" ? "labels" : "stickers"}, ${sizeLabel(p, size ?? 3)}`}
        {p.kind === "deal" && packs > 1 ? ` × ${packs} packs` : ""} · free proof included
      </p>

      {p.finishes.length > 1 && (
        <Chips legend="Finish" name="buy-finish" options={p.finishes.map((f) => ({ id: f, label: FINISH_LABEL[f] }))} value={finish} onChange={setFinish} />
      )}
      {p.kind === "custom" && size !== undefined && (
        <Chips legend={p.shape === "rectangle" ? "Size" : "Size (longest side)"} name="buy-size" options={(p.sizes ?? []).map((s) => ({ id: s, label: sizeLabel(p, s) }))} value={size} onChange={setSize} />
      )}
      {p.kind === "custom" && qty !== undefined && (
        <Chips legend="Quantity" name="buy-qty" options={(p.quantities ?? []).map((n) => ({ id: n, label: n.toLocaleString("en-CA") }))} value={qty} onChange={setQty} />
      )}

      <Chips
        legend="Artwork"
        name="buy-art"
        options={[
          { id: "upload", label: "Upload my design" },
          { id: "design", label: "Design it for me" },
        ]}
        value={artwork}
        onChange={(v) => {
          setArtwork(v);
          setError(null);
        }}
      />
      {artwork === "upload" ? (
        <div className="buy-upload">
          <input
            ref={input}
            id="buy-file"
            type="file"
            accept={ACCEPT}
            className="art-input"
            onChange={(e) => {
              take(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {file ? (
            <p className="buy-file">
              <b>{file.name}</b> <span>{sizeOf(file.size)}</span>
              <button type="button" className="text-link" onClick={() => setFile(null)}>
                Remove
              </button>
            </p>
          ) : (
            <label htmlFor="buy-file" className="buy-drop">
              <b>Choose your file</b>
              <span>{FILES}. No file yet? Add it later: we ask when we reply.</span>
            </label>
          )}
        </div>
      ) : (
        <p className="buy-design">A designer draws it from your idea and emails you a proof to approve. {CALL}.</p>
      )}

      <div className="buy-field">
        <label htmlFor="buy-notes" className="buy-label">
          {artwork === "design" ? "Your idea" : "Notes"} {artwork === "upload" && <span className="buy-opt">(optional)</span>}
        </label>
        <textarea
          id="buy-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={artwork === "design" ? "What it says and shows, colours, style. Logos or examples: paste a link." : "Colours, a deadline, a link to your files…"}
        />
      </div>

      {p.kind === "deal" && (
        <div className="buy-field buy-packs">
          <span className="buy-label" id="buy-packs-label">
            Packs
          </span>
          <div className="stepper" role="group" aria-labelledby="buy-packs-label">
            <button type="button" aria-label="One pack fewer" onClick={() => setPacks((n) => Math.max(1, n - 1))} disabled={packs <= 1}>
              −
            </button>
            <output aria-live="polite">{packs}</output>
            <button type="button" aria-label="One pack more" onClick={() => setPacks((n) => Math.min(MAX_PACKS, n + 1))} disabled={packs >= MAX_PACKS}>
              +
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      <div className="buy-actions">
        <button type="button" className="btn btn-primary buy-add" disabled={busy} onClick={() => add(false)}>
          Add to cart · {money(total, cur)}
          <Arrow />
        </button>
        <button type="button" className="btn btn-secondary buy-now" disabled={busy} onClick={() => add(true)}>
          Buy now
        </button>
      </div>
      <ul className="buy-trust">
        <li>{PROOF}: nothing prints until you approve</li>
        <li>{CALL}</li>
        <li>Secure checkout by Stripe</li>
      </ul>
    </div>
  );
}
