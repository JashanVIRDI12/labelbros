"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Label3D, LabelSpec } from "@/components/fx/label-3d";
import { whenReady } from "@/components/fx/when-ready";
import { FINISHES, MATERIALS, sizeText, type FinishId, type MaterialId, type ShapeId } from "@/lib/options";
import type { Product } from "@/lib/products";
import { LabelPreview } from "./LabelPreview";

/*
 * The product page's stage, the whole height of the screen beside the choices. Two views: the
 * photograph, and your label in 3D on an inch-grid liner (label-3d.ts),
 * built from every choice as you make it: shape, size, material, finish, your artwork. You can tilt
 * it, hover a corner to lift it and drag to peel it. Until WebGL is ready, and without it, the same
 * label is drawn flat to scale (LabelPreview).
 */

export type StageView = "photo" | "label";
export type StageSpec = { shape: ShapeId; w: number; h: number; material: MaterialId; finish: FinishId };
export type StageApi = { fly: () => { el: Element; src?: string } | null };

const grid = (w: number, h: number) => (Math.max(w, h) * 1.3 <= 12 ? "1 inch" : "2 inches");

export function PdpStage({
  p,
  media,
  view,
  onView,
  spec,
  art,
  apiRef,
}: {
  p: Product;
  media: ReactNode;
  view: StageView;
  onView: (v: StageView) => void;
  /** the label as chosen; null for deals, which only have their photo */
  spec: StageSpec | null;
  /** their own artwork, when it's an image (an object URL) */
  art: string | null;
  apiRef: RefObject<StageApi | null>;
}) {
  const photo = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<Label3D | null>(null);
  const [want, setWant] = useState(false);
  const [live, setLive] = useState(false);
  const [fine, setFine] = useState(false);
  const label = spec ? labelSpec(spec, art, p) : null;
  const latest = useRef(label);
  useEffect(() => {
    latest.current = label;
  });

  // the 3D view is built the first time it's shown; its code is fetched once the page is idle
  useEffect(() => {
    if (view === "label" && spec && !want) setWant(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, [view, spec, want]);
  useEffect(() => {
    const el = photo.current;
    if (!el || !spec) return;
    return whenReady(el, () => void import("@/components/fx/label-3d"), "0px");
  }, [spec]);
  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!want || !el) return;
    let gone = false;
    (async () => {
      const { Label3D } = await import("@/components/fx/label-3d");
      if (gone || !latest.current) return;
      try {
        const g = new Label3D(el);
        engine.current = g;
        await g.init(latest.current);
        if (gone) g.destroy();
        else setLive(true);
      } catch {
        engine.current = null; /* no WebGL: the flat preview stays */
      }
    })();
    return () => {
      gone = true;
      engine.current?.destroy();
      engine.current = null;
      setLive(false);
    };
  }, [want]);

  // every choice reaches the label
  const key = label ? `${label.shape}|${label.w}|${label.h}|${label.look}|${label.finish}|${label.art}` : "";
  useEffect(() => {
    if (live && latest.current) engine.current?.set(latest.current);
  }, [key, live]);

  // what flies into the cart: the photo, or a snapshot of the 3D label
  useEffect(() => {
    apiRef.current = {
      fly: () => {
        if (view === "photo") {
          const img = photo.current?.querySelector("img");
          return img ? { el: img } : null;
        }
        const canvas = host.current?.querySelector("canvas");
        const src = canvas && engine.current?.snapshot();
        if (canvas && src) return { el: canvas, src };
        const svg = host.current?.parentElement?.querySelector(".lp svg");
        return svg ? { el: svg } : null;
      },
    };
  });

  const mat = spec ? MATERIALS[spec.material] : null;

  return (
    <div className="pdp-media">
      <div className="stage" data-view={view} data-tone={p.tone} data-live={live || undefined} style={{ aspectRatio: `${p.image.w} / ${p.image.h}` }}>
        <div ref={photo} className="stage-photo" hidden={view !== "photo"}>
          {media}
        </div>

        {spec && mat && (
          <div className="stage-label" hidden={view !== "label"}>
            <div ref={host} className="stage-3d" />
            {!live && view === "label" && (
              <div className="stage-flat">
                <LabelPreview shape={spec.shape} w={spec.w} h={spec.h} material={spec.material} finish={spec.finish} art={art} sample={p.image.label.src} />
              </div>
            )}
            <p className="stage-tag">
              <b>{sizeText(spec.shape, spec.w, spec.h)}</b>
              <span>
                {mat.label}
                {mat.finishes.length > 1 ? `, ${FINISHES[spec.finish].label.toLowerCase()}` : ""}
              </span>
            </p>
            {live && (
              <p className="stage-cap">
                <span>
                  Each square is {grid(spec.w, spec.h)}. {art ? "Your artwork" : "Sample artwork"}.
                </span>
                <span className="stage-hint">{fine ? "Hover a corner, drag to peel" : "Tap the label to peel it"}</span>
              </p>
            )}
          </div>
        )}
      </div>
      {spec && (
        <div className="stage-views" role="group" aria-label="Show">
          <button type="button" aria-pressed={view === "photo"} onClick={() => onView("photo")}>
            <span className="stage-thumb" data-tone={p.tone}>
              <Image src={p.image.thumb} alt="" width={256} height={256} sizes="40px" />
            </span>
            <span>Photo</span>
          </button>
          <button type="button" aria-pressed={view === "label"} onClick={() => onView("label")}>
            <span className="stage-thumb stage-thumb-label">
              <Image src={p.image.label.src} alt="" width={p.image.label.w} height={p.image.label.h} sizes="40px" />
            </span>
            <span>Your label</span>
          </button>
        </div>
      )}
      {view === "photo" && !p.noArtwork && (
        <p className="stage-note">
          <span>{p.range === "labels" ? "Sample packaging. Your order is for the labels." : "Sample designs. Printed with your artwork."}</span>
          <a href="#product-details">Product details</a>
        </p>
      )}
    </div>
  );
}

function labelSpec(s: StageSpec, art: string | null, p: Product): LabelSpec {
  return { shape: s.shape, w: s.w, h: s.h, look: MATERIALS[s.material].look, finish: s.finish, art: art ?? p.image.label.src, own: Boolean(art) };
}
