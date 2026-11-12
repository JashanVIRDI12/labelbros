import assert from "node:assert/strict";
import test from "node:test";
import { artworkSize, cutlinePath, fitCutline, traceArtwork } from "../src/lib/artwork-outline.ts";

function image(width, height, pixel) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set(pixel(x, y), (y * width + x) * 4);
  return { width, height, data };
}
const blue = [20, 80, 200, 255];
const white = [255, 255, 255, 255];
const clear = [0, 0, 0, 0];
function contains(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

test("transparent artwork produces its own contour and trims empty margins", () => {
  const { cutline, alpha } = traceArtwork(image(100, 100, (x, y) => Math.hypot(x - 50, y - 50) < 30 ? blue : clear));
  assert.ok(cutline);
  assert.equal(alpha[0], 0);
  assert.ok(cutline.crop.w < 0.65);
  assert.ok(cutline.points.length > 12);
  assert.equal(contains(cutline.points, 0.05, 0.05), false);
  assert.equal(contains(cutline.points, 0.5, 0.5), true);
  assert.ok(Math.abs(cutline.aspect - 1) < 0.02);
});

test("different silhouettes produce different cut lines, including concave recesses", () => {
  const circle = traceArtwork(image(100, 100, (x, y) => Math.hypot(x - 50, y - 50) < 35 ? blue : clear)).cutline;
  const cross = traceArtwork(image(100, 100, (x, y) => ((x > 38 && x < 62 && y > 15 && y < 85) || (y > 38 && y < 62 && x > 15 && x < 85)) ? blue : clear)).cutline;
  assert.notDeepEqual(circle.points, cross.points);
  assert.equal(contains(circle.points, 0.2, 0.2), true);
  assert.equal(contains(cross.points, 0.2, 0.2), false);
  assert.equal(contains(cross.points, 0.5, 0.1), true);
});

test("an opaque flat background is removed only where connected to the perimeter", () => {
  const { cutline, alpha } = traceArtwork(image(100, 100, (x, y) => {
    const r = Math.hypot(x - 50, y - 50);
    return r < 30 && r > 12 ? blue : white;
  }));
  assert.ok(cutline.crop.w < 0.65);
  assert.equal(alpha[0], 0);
  assert.equal(alpha[50 * 100 + 50], 1, "enclosed white ink must survive background removal");
});

test("photographs with varied edges keep their full bounds", () => {
  const { cutline, alpha } = traceArtwork(image(100, 80, (x, y) => [x * 2.5, y * 3, (x + y) % 255, 255]));
  assert.deepEqual(cutline.crop, { x: 0, y: 0, w: 1, h: 1 });
  assert.ok(alpha.every((v) => v === 1));
});

test("an interior transparent hole stays inside the outer cut line", () => {
  const { cutline, alpha } = traceArtwork(image(100, 100, (x, y) => {
    const r = Math.hypot(x - 50, y - 50);
    return r < 35 && r > 15 ? blue : clear;
  }));
  assert.equal(alpha[50 * 100 + 50], 0);
  assert.equal(contains(cutline.points, 0.5, 0.5), true);
});

test("separate artwork elements form one outer sticker without losing either element", () => {
  const { cutline } = traceArtwork(image(150, 80, (x, y) => (Math.hypot(x - 30, y - 40) < 20 || Math.hypot(x - 120, y - 40) < 20) ? blue : clear));
  assert.equal(contains(cutline.points, 0.15, 0.5), true);
  assert.equal(contains(cutline.points, 0.85, 0.5), true);
  assert.ok(Array.from({ length: 99 }, (_, i) => (i + 1) / 100).some((y) => contains(cutline.points, 0.5, y)), "the islands need a connecting bridge");
  assert.equal(contains(cutline.points, 0.5, 0.1), false, "retain the contour rather than its bounding box");
});

test("empty or blank files have a safe fallback", () => {
  assert.equal(traceArtwork(image(100, 100, () => clear)).cutline, null);
  assert.deepEqual(traceArtwork(image(100, 100, () => white)).cutline.crop, { x: 0, y: 0, w: 1, h: 1 });
});

test("longest-side sizing preserves wide and tall artwork proportions", () => {
  assert.deepEqual(artworkSize(3, 2), { w: 3, h: 1.5 });
  assert.deepEqual(artworkSize(3, 0.5), { w: 1.5, h: 3 });
  assert.deepEqual(artworkSize(4, 1), { w: 4, h: 4 });
});

test("a square preview box fits wide artwork without squeezing its width", () => {
  const { cutline } = traceArtwork(image(160, 80, (x, y) => x > 10 && x < 150 && y > 15 && y < 65 ? blue : clear));
  const fitted = fitCutline(cutline, 3, 3);
  const xs = fitted.points.map((p) => p[0]), ys = fitted.points.map((p) => p[1]);
  assert.equal(Math.min(...xs), 0);
  assert.equal(Math.max(...xs), 1);
  assert.ok(Math.abs(1 / (Math.max(...ys) - Math.min(...ys)) - cutline.aspect) < 0.001);
  assert.ok(fitted.inset.y > cutline.inset.y);
  assert.match(cutlinePath(fitted, 0, 0, 3, 3), /^M.+Q.+Z$/);
});
