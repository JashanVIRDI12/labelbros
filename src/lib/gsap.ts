"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase);

  // "slap": a sticker hitting the table. Fast in, firm stop, no bounce.
  CustomEase.create("slap", "M0,0 C0.4,0 0.08,1 1,1");
  // "peel": slow start as the adhesive lets go, then quick release.
  CustomEase.create("peel", "M0,0 C0.55,0 0.25,1 1,1");
}

export { gsap, CustomEase, useGSAP };
