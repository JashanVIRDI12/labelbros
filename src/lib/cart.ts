"use client";

import { useSyncExternalStore } from "react";
import type { Finish } from "./facts";

/*
 * The cart, in the visitor's browser: the lines in localStorage (they survive reloads), each
 * line's artwork file in IndexedDB (files are too big for localStorage). Every change tells the
 * page through one event, so the header's count, the drawer and the cart page stay in step.
 * Storage can be unavailable (private windows): then the cart lives for this page only.
 */

export type CartLine = {
  id: string;
  slug: string;
  finish: Finish;
  size?: number;
  qty?: number;
  packs: number;
  artwork: "upload" | "design";
  fileName?: string;
  fileSize?: number;
  notes?: string;
};

const KEY = "lb-cart";
const EVENT = "lb-cart";
let memory: CartLine[] = [];
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: [] };

function readRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** The lines (the same array until something changes, as useSyncExternalStore needs). */
export function getLines(): CartLine[] {
  const raw = readRaw();
  if (raw === null) return memory;
  if (raw !== cache.raw) {
    try {
      cache = { raw, lines: JSON.parse(raw) as CartLine[] };
    } catch {
      cache = { raw, lines: [] };
    }
  }
  return cache.lines;
}

function save(lines: CartLine[]) {
  memory = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage off: memory only */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // another tab
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const EMPTY: CartLine[] = [];

export function useCart() {
  return useSyncExternalStore(subscribe, getLines, () => EMPTY);
}

export const cartCount = (lines: CartLine[]) => lines.length;

/* ---------- artwork files (IndexedDB) ---------- */

const DB = "lb-cart-files";
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("files");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const memFiles = new Map<string, File>();

async function putFile(id: string, file: File) {
  memFiles.set(id, file);
  try {
    const db = await open();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    /* memory only */
  }
}

export async function getFile(id: string): Promise<File | null> {
  if (memFiles.has(id)) return memFiles.get(id)!;
  try {
    const db = await open();
    return await new Promise<File | null>((res) => {
      const r = db.transaction("files").objectStore("files").get(id);
      r.onsuccess = () => res((r.result as File) ?? null);
      r.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

async function dropFile(id: string) {
  memFiles.delete(id);
  try {
    const db = await open();
    db.transaction("files", "readwrite").objectStore("files").delete(id);
  } catch {
    /* nothing to drop */
  }
}

/* ---------- changes ---------- */

export async function addLine(line: Omit<CartLine, "id" | "fileName" | "fileSize">, file?: File | null) {
  const id = crypto.randomUUID();
  if (file) await putFile(id, file);
  save([...getLines(), { ...line, id, fileName: file?.name, fileSize: file?.size }]);
  return id;
}

export function setPacks(id: string, packs: number) {
  save(getLines().map((l) => (l.id === id ? { ...l, packs: Math.max(1, Math.min(20, Math.round(packs))) } : l)));
}

export function removeLine(id: string) {
  void dropFile(id);
  save(getLines().filter((l) => l.id !== id));
}

export function clearCart() {
  for (const l of getLines()) void dropFile(l.id);
  save([]);
}

/* ---------- the drawer ---------- */

const OPEN_EVENT = "lb-cart-open";
export const openCart = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onOpenCart = (cb: () => void) => {
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
};
