import type { MaterialId, ShapeId } from "./options";

/*
 * Sections further down a product page (the bulk slider) set choices in its buy box with this
 * event; the configurator applies them and scrolls back up.
 */
export type Configure = { shape?: ShapeId; w?: number; h?: number; material?: MaterialId; qty?: number; bulk?: boolean };
export const CONFIGURE = "lb:configure";
export const configure = (detail: Configure) => window.dispatchEvent(new CustomEvent<Configure>(CONFIGURE, { detail }));
