(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/hero/engine/art.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Sticker artwork, drawn with Canvas 2D. Each design is sample customer art: the kind of
 * labels and stickers Label Bros prints (food, drink, candles, packaging, warning labels).
 * Brand colours here belong to the artwork, never to the site UI.
 */ __turbopack_context__.s([
    "DESIGNS",
    ()=>DESIGNS,
    "renderSticker",
    ()=>renderSticker,
    "stickerSize",
    ()=>stickerSize,
    "yieldToMain",
    ()=>yieldToMain
]);
/* ---------------------------------------------------------------- helpers */ const TAU = Math.PI * 2;
function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
}
function setFont(ctx, weight, size, family, stretch) {
    ctx.font = `${weight} ${size}px ${family}`;
    if ("fontStretch" in ctx) ctx.fontStretch = stretch ?? "normal";
}
/** Size a font so its cap height is `cap` px, then shrink it if `fit.text` would run wider than
 * `fit.max` (tracking included). Returns the font size used. */ function capFont(ctx, weight, cap, family, stretch, fit) {
    setFont(ctx, weight, 100, family, stretch);
    const m = ctx.measureText("H");
    const ratio = m.actualBoundingBoxAscent / 100 || 0.72;
    let size = cap / ratio;
    setFont(ctx, weight, size, family, stretch);
    if (fit) {
        const n = [
            ...fit.text
        ].length;
        const width = ctx.measureText(fit.text).width + (fit.tracking ?? 0) * (n - 1);
        if (width > fit.max) {
            size *= fit.max / width;
            setFont(ctx, weight, size, family, stretch);
        }
    }
    return size;
}
/** Letter-spaced text without relying on ctx.letterSpacing (not everywhere yet). */ function tracked(ctx, text, x, y, tracking, align = "center") {
    const chars = [
        ...text
    ];
    const widths = chars.map((c)=>ctx.measureText(c).width);
    const total = widths.reduce((a, b)=>a + b, 0) + tracking * (chars.length - 1);
    let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    const prev = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((c, i)=>{
        ctx.fillText(c, cx, y);
        cx += widths[i] + tracking;
    });
    ctx.textAlign = prev;
    return total;
}
/** Text on a circle. `top`: reads clockwise over the top, glyphs point out. Otherwise reads
 * left-to-right along the bottom, glyphs point in, and `r` is the outer (baseline) radius. */ function arcText(ctx, text, cx, cy, r, center, tracking, top = true) {
    const chars = [
        ...text
    ];
    const widths = chars.map((c)=>ctx.measureText(c).width);
    const total = widths.reduce((a, b)=>a + b, 0) + tracking * (chars.length - 1);
    const span = total / r;
    let a = top ? center - span / 2 : center + span / 2;
    ctx.save();
    ctx.textAlign = "center";
    chars.forEach((c, i)=>{
        const half = widths[i] / 2 / r;
        a += top ? half : -half;
        ctx.save();
        ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
        ctx.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
        ctx.fillText(c, 0, 0);
        ctx.restore();
        a += top ? half + tracking / r : -(half + tracking / r);
    });
    ctx.restore();
}
function sparkle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
}
function starPath(ctx, cx, cy, points, outer, inner, rot = -Math.PI / 2) {
    ctx.beginPath();
    for(let i = 0; i < points * 2; i++){
        const r = i % 2 === 0 ? outer : inner;
        const a = rot + i * Math.PI / points;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
function hexPath(ctx, cx, cy, r, rot = -Math.PI / 2) {
    ctx.beginPath();
    for(let i = 0; i < 6; i++){
        const a = rot + i * TAU / 6;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
/** Deterministic PRNG so textures look the same on every visit. */ function rng(seed) {
    let s = seed >>> 0;
    return ()=>{
        s = s + 0x6d2b79f5 >>> 0;
        let t = s;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
/** Kraft paper: base tone plus short fibres. Call inside a clip. */ function kraft(ctx, w, h, seed = 7) {
    ctx.fillStyle = "#c6a073";
    ctx.fillRect(0, 0, w, h);
    const r = rng(seed);
    ctx.lineCap = "round";
    for(let i = 0; i < 900; i++){
        const x = r() * w;
        const y = r() * h;
        const len = 2 + r() * 7;
        const a = r() * TAU;
        const dark = r() > 0.45;
        ctx.strokeStyle = dark ? `rgba(92,60,28,${0.08 + r() * 0.14})` : `rgba(255,236,205,${0.08 + r() * 0.16})`;
        ctx.lineWidth = 0.5 + r() * 0.9;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
    }
}
/* ---------------------------------------------------------------- designs */ const labelBros = {
    id: "label-bros",
    name: "Label Bros",
    spec: "Holographic vinyl, die-cut",
    finish: "holo",
    w: 300,
    h: 172,
    border: 12,
    draw (ctx, f) {
        const { w, h } = this;
        // silver base: the shader turns light, unsaturated areas into rainbow foil
        rr(ctx, 0, 0, w, h, 34);
        ctx.fillStyle = "#dcdce0";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#111";
        rr(ctx, 13, 13, w - 26, h - 26, 22);
        ctx.stroke();
        ctx.fillStyle = "#111";
        capFont(ctx, 900, 48, f.sans, "expanded", {
            text: "LABEL",
            max: w - 74,
            tracking: -1
        });
        ctx.textAlign = "center";
        tracked(ctx, "LABEL", w / 2, 80, -1);
        tracked(ctx, "BROS", w / 2, 140, -1);
        sparkle(ctx, w - 40, 40, 11);
        sparkle(ctx, w - 58, 58, 5);
        sparkle(ctx, 38, h - 38, 8);
    }
};
const fireEscape = {
    id: "fire-escape",
    name: "Fire Escape Hot Sauce",
    spec: "Gloss vinyl, scalloped die-cut",
    finish: "gloss",
    w: 224,
    h: 224,
    border: 11,
    draw (ctx, f) {
        const c = 112;
        // bottle-cap edge
        ctx.beginPath();
        for(let i = 0; i <= 720; i++){
            const a = i / 720 * TAU;
            const r = 106 + 5 * Math.cos(a * 28);
            const x = c + r * Math.cos(a);
            const y = c + r * Math.sin(a);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = "#e8432b";
        ctx.fill();
        ctx.strokeStyle = "#ffe8c4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c, c, 76, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#ffe8c4";
        capFont(ctx, 400, 19, f.anton);
        arcText(ctx, "FIRE ESCAPE", c, c, 81, -Math.PI / 2, 2.4, true);
        capFont(ctx, 400, 15, f.anton);
        arcText(ctx, "HOT SAUCE CO.", c, c, 100, Math.PI / 2, 2.6, false);
        sparkle(ctx, c - 90, c, 6);
        sparkle(ctx, c + 90, c, 6);
        // flame
        const fx = c;
        const fy = c + 6;
        ctx.fillStyle = "#ffc93a";
        ctx.beginPath();
        ctx.moveTo(fx + 2, fy - 54);
        ctx.bezierCurveTo(fx + 12, fy - 26, fx + 42, fy - 16, fx + 38, fy + 14);
        ctx.bezierCurveTo(fx + 35, fy + 40, fx + 14, fy + 50, fx, fy + 50);
        ctx.bezierCurveTo(fx - 22, fy + 50, fx - 40, fy + 34, fx - 38, fy + 10);
        ctx.bezierCurveTo(fx - 36, fy - 8, fx - 24, fy - 18, fx - 20, fy - 34);
        ctx.bezierCurveTo(fx - 10, fy - 22, fx - 8, fy - 12, fx - 4, fy - 8);
        ctx.bezierCurveTo(fx - 6, fy - 28, fx - 4, fy - 42, fx + 2, fy - 54);
        ctx.fill();
        ctx.fillStyle = "#e8432b";
        ctx.beginPath();
        ctx.moveTo(fx + 2, fy - 8);
        ctx.bezierCurveTo(fx + 8, fy + 6, fx + 22, fy + 12, fx + 20, fy + 28);
        ctx.bezierCurveTo(fx + 18, fy + 40, fx + 8, fy + 44, fx, fy + 44);
        ctx.bezierCurveTo(fx - 12, fy + 44, fx - 22, fy + 36, fx - 20, fy + 24);
        ctx.bezierCurveTo(fx - 18, fy + 12, fx - 6, fy + 8, fx + 2, fy - 8);
        ctx.fill();
    }
};
const nightShift = {
    id: "night-shift",
    name: "Night Shift Coffee",
    spec: "Matte paper, arch die-cut",
    finish: "matte",
    w: 184,
    h: 240,
    border: 11,
    draw (ctx, f) {
        const { w, h } = this;
        const r = w / 2;
        const arch = (inset)=>{
            ctx.beginPath();
            ctx.moveTo(inset, r);
            ctx.arc(r, r, r - inset, Math.PI, 0);
            ctx.lineTo(w - inset, h - inset - 14);
            ctx.quadraticCurveTo(w - inset, h - inset, w - inset - 14, h - inset);
            ctx.lineTo(inset + 14, h - inset);
            ctx.quadraticCurveTo(inset, h - inset, inset, h - inset - 14);
            ctx.closePath();
        };
        arch(0);
        ctx.fillStyle = "#16234a";
        ctx.fill();
        arch(9);
        ctx.strokeStyle = "#e9b44c";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // crescent moon
        ctx.fillStyle = "#f4e7cc";
        ctx.beginPath();
        ctx.arc(r, 76, 31, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#16234a";
        ctx.beginPath();
        ctx.arc(r + 14, 66, 28, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#f4e7cc";
        sparkle(ctx, 46, 58, 8);
        sparkle(ctx, 140, 44, 5);
        sparkle(ctx, 146, 104, 7);
        sparkle(ctx, 54, 112, 4);
        ctx.fillStyle = "#f4e7cc";
        capFont(ctx, 400, 40, f.anton);
        ctx.textAlign = "center";
        tracked(ctx, "NIGHT", r, 168, 1.5);
        tracked(ctx, "SHIFT", r, 212, 1.5);
        ctx.fillStyle = "#e9b44c";
        capFont(ctx, 800, 7, f.sans);
        tracked(ctx, "COFFEE ROASTERS", r, 226, 1.8);
    }
};
const hopScotch = {
    id: "hop-scotch",
    name: "Hop Scotch IPA",
    spec: "Gloss vinyl, rounded rectangle",
    finish: "gloss",
    w: 196,
    h: 252,
    border: 10,
    draw (ctx, f) {
        const { w, h } = this;
        ctx.save();
        rr(ctx, 0, 0, w, h, 22);
        ctx.clip();
        ctx.fillStyle = "#bde552";
        ctx.fillRect(0, 0, w, h);
        const ink = "#16391d";
        ctx.fillStyle = ink;
        capFont(ctx, 800, 7, f.sans);
        tracked(ctx, "SMALL BATCH BREWING", w / 2, 30, 1.8);
        capFont(ctx, 400, 74, f.anton);
        ctx.textAlign = "center";
        tracked(ctx, "HOP", w / 2, 118, 1);
        capFont(ctx, 400, 34, f.anton);
        tracked(ctx, "SCOTCH", w / 2, 160, 2);
        // checker band: a nod to the scotch plaid and the hopscotch court
        const sq = 12;
        const cols = Math.ceil(w / sq);
        for(let row = 0; row < 2; row++){
            for(let col = 0; col < cols; col++){
                if ((row + col) % 2 === 0) ctx.fillRect(col * sq, 176 + row * sq, sq, sq);
            }
        }
        ctx.fillRect(0, 200, w, h - 200);
        ctx.fillStyle = "#bde552";
        capFont(ctx, 800, 9, f.sans);
        tracked(ctx, "INDIA PALE ALE", w / 2, 224, 1.6);
        ctx.fillStyle = "#f6f2e6";
        capFont(ctx, 600, 6.5, f.sans);
        tracked(ctx, "16 FL OZ  ·  6.8% ABV", w / 2, 239, 1.2);
        ctx.restore();
    }
};
const beeline = {
    id: "beeline",
    name: "Beeline Honey",
    spec: "Gloss paper, hexagon die-cut",
    finish: "gloss",
    w: 196,
    h: 226,
    border: 11,
    draw (ctx, f) {
        const { w, h } = this;
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.lineJoin = "round";
        hexPath(ctx, cx, cy, 112);
        ctx.fillStyle = "#f6a91f";
        ctx.fill();
        ctx.clip();
        // honeycomb
        ctx.strokeStyle = "#e48d0c";
        ctx.lineWidth = 2;
        const s = 13;
        for(let row = -1; row < 12; row++){
            for(let col = -1; col < 10; col++){
                const x = col * s * Math.sqrt(3) + (row % 2 ? s * Math.sqrt(3) / 2 : 0);
                const y = row * s * 1.5;
                hexPath(ctx, x, y, s - 1.5);
                ctx.stroke();
            }
        }
        // label band
        ctx.fillStyle = "#fff4d8";
        ctx.fillRect(0, 98, w, 66);
        ctx.fillStyle = "#1a1408";
        ctx.fillRect(0, 98, w, 3);
        ctx.fillRect(0, 161, w, 3);
        capFont(ctx, 900, 22, f.sans, "expanded", {
            text: "BEELINE",
            max: 150,
            tracking: 0.5
        });
        tracked(ctx, "BEELINE", cx, 137, 0.5);
        capFont(ctx, 700, 6.6, f.sans, undefined, {
            text: "RAW WILDFLOWER HONEY",
            max: 150,
            tracking: 1.6
        });
        tracked(ctx, "RAW WILDFLOWER HONEY", cx, 152, 1.6);
        ctx.restore();
        // bee
        const bx = cx;
        const by = 60;
        ctx.fillStyle = "rgba(255,250,236,0.95)";
        ctx.strokeStyle = "#1a1408";
        ctx.lineWidth = 2.5;
        for (const side of [
            -1,
            1
        ]){
            ctx.beginPath();
            ctx.ellipse(bx + side * 12, by - 16, 11, 17, side * 0.5, 0, TAU);
            ctx.fill();
            ctx.stroke();
        }
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(bx, by, 24, 16, 0, 0, TAU);
        ctx.fillStyle = "#ffd23a";
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = "#1a1408";
        for (const x of [
            -10,
            2,
            14
        ])ctx.fillRect(bx + x - 3, by - 20, 6.5, 40);
        ctx.restore();
        ctx.beginPath();
        ctx.ellipse(bx, by, 24, 16, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#1a1408";
        ctx.beginPath();
        ctx.arc(bx - 24, by - 1, 8, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx + 23, by - 3);
        ctx.lineTo(bx + 33, by);
        ctx.lineTo(bx + 23, by + 3);
        ctx.fill();
        ctx.fillStyle = "#1a1408";
        capFont(ctx, 700, 6.6, f.sans);
        tracked(ctx, "NET WT 12 OZ", cx, 190, 1.6);
    }
};
const thankYou = {
    id: "thank-you",
    name: "Thank-you packaging seal",
    spec: "Kraft paper, circle",
    finish: "kraft",
    w: 188,
    h: 188,
    border: 0,
    draw (ctx, f) {
        const c = 94;
        ctx.save();
        ctx.beginPath();
        ctx.arc(c, c, 94, 0, TAU);
        ctx.clip();
        kraft(ctx, 188, 188, 11);
        ctx.restore();
        ctx.fillStyle = "#24170c";
        for(let i = 0; i < 64; i++){
            const a = i / 64 * TAU;
            ctx.beginPath();
            ctx.arc(c + 82 * Math.cos(a), c + 82 * Math.sin(a), 1.7, 0, TAU);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(c, c + 6);
        ctx.rotate(-0.12);
        setFont(ctx, 400, 54, f.script);
        ctx.textAlign = "center";
        ctx.fillText("thank you", 0, 0);
        ctx.restore();
        capFont(ctx, 800, 7, f.sans);
        tracked(ctx, "FOR SHOPPING SMALL", c, 136, 2);
        // heart
        ctx.save();
        ctx.translate(c, 46);
        ctx.beginPath();
        ctx.moveTo(0, 9);
        ctx.bezierCurveTo(-14, 0, -11, -11, -4, -10);
        ctx.bezierCurveTo(-2, -10, 0, -8, 0, -5);
        ctx.bezierCurveTo(0, -8, 2, -10, 4, -10);
        ctx.bezierCurveTo(11, -11, 14, 0, 0, 9);
        ctx.fill();
        ctx.restore();
    }
};
const fresh = {
    id: "fresh",
    name: "Fresh! lettering",
    spec: "Gloss vinyl, contour cut",
    finish: "gloss",
    w: 268,
    h: 132,
    border: 13,
    draw (ctx, f) {
        const { w, h } = this;
        ctx.save();
        ctx.translate(w / 2, h / 2 + 30);
        ctx.rotate(-0.1);
        setFont(ctx, 400, 104, f.script);
        ctx.textAlign = "center";
        // extruded shadow, sign-painter style
        ctx.fillStyle = "#141414";
        for(let i = 1; i <= 7; i++)ctx.fillText("Fresh!", i * 0.9, i * 1.1);
        ctx.fillStyle = "#ff5a2b";
        ctx.fillText("Fresh!", 0, 0);
        ctx.restore();
    }
};
const newBurst = {
    id: "new-burst",
    name: "New flavour burst",
    spec: "Glitter vinyl, starburst",
    finish: "glitter",
    w: 176,
    h: 176,
    border: 9,
    draw (ctx, f) {
        const c = 88;
        ctx.lineJoin = "round";
        starPath(ctx, c, c, 18, 88, 74);
        ctx.fillStyle = "#ff4f9b";
        ctx.fill();
        ctx.strokeStyle = "#ffe3ef";
        ctx.lineWidth = 2;
        ctx.setLineDash([
            3,
            5
        ]);
        ctx.beginPath();
        ctx.arc(c, c, 62, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#fff6fa";
        capFont(ctx, 900, 34, f.sans, "expanded", {
            text: "NEW",
            max: 104
        });
        tracked(ctx, "NEW", c, c + 12, 0);
        capFont(ctx, 800, 8, f.sans);
        tracked(ctx, "FLAVOUR", c, c + 34, 2.4);
        sparkle(ctx, c, c - 40, 8);
    }
};
const emberOak = {
    id: "ember-oak",
    name: "Ember & Oak candle label",
    spec: "Matte paper, oval",
    finish: "matte",
    w: 236,
    h: 150,
    border: 0,
    draw (ctx, f) {
        const { w, h } = this;
        const cx = w / 2;
        const cy = h / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
        ctx.fillStyle = "#f3ebdc";
        ctx.fill();
        ctx.strokeStyle = "#1c1712";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 - 9, h / 2 - 9, 0, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 - 14, h / 2 - 14, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#1c1712";
        // flame mark
        ctx.beginPath();
        ctx.moveTo(cx, 30);
        ctx.bezierCurveTo(cx + 9, 40, cx + 8, 50, cx, 54);
        ctx.bezierCurveTo(cx - 8, 50, cx - 9, 40, cx, 30);
        ctx.fill();
        capFont(ctx, 600, 21, f.serif);
        ctx.textAlign = "center";
        ctx.fillText("Ember & Oak", cx, 87);
        capFont(ctx, 700, 6, f.sans);
        tracked(ctx, "HAND POURED SOY CANDLE", cx, 104, 1.8);
        ctx.fillStyle = "#8a3b1d";
        capFont(ctx, 600, 6, f.sans);
        tracked(ctx, "CEDAR  ·  SMOKE  ·  AMBER", cx, 119, 1.4);
    }
};
const caution = {
    id: "caution",
    name: "Caution label",
    spec: "Gloss vinyl, rectangle",
    finish: "gloss",
    w: 266,
    h: 120,
    border: 0,
    draw (ctx, f) {
        const { w, h } = this;
        ctx.save();
        rr(ctx, 0, 0, w, h, 12);
        ctx.clip();
        ctx.fillStyle = "#ffc414";
        ctx.fillRect(0, 0, w, h);
        // hazard stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, 64, h);
        ctx.clip();
        ctx.fillStyle = "#121212";
        for(let i = -6; i < 12; i++){
            ctx.beginPath();
            const x = i * 22;
            ctx.moveTo(x, h);
            ctx.lineTo(x + 11, h);
            ctx.lineTo(x + 11 + h, 0);
            ctx.lineTo(x + h, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "#121212";
        ctx.fillRect(64, 0, 3, h);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#121212";
        rr(ctx, 6, 6, w - 12, h - 12, 8);
        ctx.stroke();
        const room = w - 82 - 20;
        capFont(ctx, 900, 27, f.sans, "expanded", {
            text: "CAUTION",
            max: room
        });
        ctx.textAlign = "left";
        tracked(ctx, "CAUTION", 82, 54, 0, "left");
        capFont(ctx, 800, 7.6, f.sans, undefined, {
            text: "CONTENTS EXTREMELY STICKY",
            max: room,
            tracking: 1.1
        });
        tracked(ctx, "CONTENTS EXTREMELY STICKY", 83, 76, 1.1, "left");
        capFont(ctx, 600, 6.4, f.sans, undefined, {
            text: "PEEL SLOWLY · KEEP DRY",
            max: room,
            tracking: 1.1
        });
        tracked(ctx, "PEEL SLOWLY · KEEP DRY", 83, 93, 1.1, "left");
        ctx.restore();
    }
};
const approved = {
    id: "approved",
    name: "Proof approved seal",
    spec: "Gloss vinyl, circle",
    finish: "gloss",
    w: 156,
    h: 156,
    border: 9,
    draw (ctx, f) {
        const c = 78;
        ctx.beginPath();
        ctx.arc(c, c, 78, 0, TAU);
        ctx.fillStyle = "#151515";
        ctx.fill();
        ctx.fillStyle = "#f5f1e8";
        capFont(ctx, 800, 9, f.sans);
        const text = "PROOF APPROVED ✦ PRINT READY ✦ ";
        // run the text all the way round
        const chars = [
            ...text
        ];
        const widths = chars.map((ch)=>ctx.measureText(ch).width);
        const total = widths.reduce((a, b)=>a + b, 0);
        const r = 60;
        const track = (TAU * r - total) / chars.length;
        let a = -Math.PI / 2;
        ctx.textAlign = "center";
        chars.forEach((ch, i)=>{
            const half = widths[i] / 2 / r;
            a += half;
            ctx.save();
            ctx.translate(c + r * Math.cos(a), c + r * Math.sin(a));
            ctx.rotate(a + Math.PI / 2);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            a += half + track / r;
        });
        ctx.strokeStyle = "#ffd21f";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(c - 24, c + 2);
        ctx.lineTo(c - 7, c + 19);
        ctx.lineTo(c + 25, c - 17);
        ctx.stroke();
    }
};
const DESIGNS = [
    fireEscape,
    nightShift,
    beeline,
    labelBros,
    thankYou,
    hopScotch,
    newBurst,
    fresh,
    emberOak,
    caution,
    approved
];
const PAD = 4;
function stickerSize(design) {
    const pad = design.border + PAD;
    return {
        width: design.w + pad * 2,
        height: design.h + pad * 2
    };
}
function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}
function yieldToMain() {
    const sched = globalThis.scheduler;
    if (sched?.yield) return sched.yield();
    return new Promise((r)=>setTimeout(r, 0));
}
async function renderSticker(design, fonts, scale, opts = {}) {
    const pad = design.border + PAD;
    const width = design.w + pad * 2;
    const height = design.h + pad * 2;
    const W = Math.ceil(width * scale);
    const H = Math.ceil(height * scale);
    const art = makeCanvas(W, H);
    const actx = art.getContext("2d");
    actx.scale(scale, scale);
    actx.translate(pad, pad);
    design.draw(actx, fonts);
    await yieldToMain();
    const out = makeCanvas(W, H);
    const ctx = out.getContext("2d");
    if (design.border > 0) {
        // white silhouette, then stamp it round a few rings: a round-cornered dilation that also
        // covers thin strokes
        const sil = makeCanvas(W, H);
        const sctx = sil.getContext("2d");
        sctx.drawImage(art, 0, 0);
        sctx.globalCompositeOperation = "source-in";
        sctx.fillStyle = "#ffffff";
        sctx.fillRect(0, 0, W, H);
        const total = design.border * scale;
        const rings = Math.max(2, Math.ceil(total / (3.2 * scale)));
        for(let k = rings; k >= 1; k--){
            const r = total * k / rings;
            const steps = k === rings ? 20 : 12;
            for(let i = 0; i < steps; i++){
                const a = i / steps * TAU + k * 0.37;
                ctx.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r);
            }
        }
        ctx.drawImage(sil, 0, 0);
        await yieldToMain();
    }
    ctx.drawImage(art, 0, 0);
    if (opts.mask === false) return {
        canvas: out,
        width,
        height,
        mask: new Uint8ClampedArray(0),
        maskW: 0,
        maskH: 0
    };
    // hit mask at ~1 sample per 2 logical px
    const maskW = Math.ceil(width / 2);
    const maskH = Math.ceil(height / 2);
    const m = makeCanvas(maskW, maskH);
    const mctx = m.getContext("2d", {
        willReadFrequently: true
    });
    mctx.drawImage(out, 0, 0, maskW, maskH);
    const data = mctx.getImageData(0, 0, maskW, maskH).data;
    const mask = new Uint8ClampedArray(maskW * maskH);
    for(let i = 0; i < mask.length; i++)mask[i] = data[i * 4 + 3];
    return {
        canvas: out,
        width,
        height,
        mask,
        maskW,
        maskH
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/sections/SampleKit.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIT",
    ()=>KIT,
    "SampleKit",
    ()=>SampleKit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.4.3_@babel+core@7.29.7_supports-color@7.2.0__@types+node@20.19.43_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2f$Arrow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/site/Arrow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2f$Motion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/site/Motion.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stickers$2f$StickerArt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/stickers/StickerArt.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stickers$2f$ratio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/stickers/ratio.ts [app-client] (ecmascript)");
;
;
;
;
;
const KIT = [
    {
        id: "thank-you",
        x: -0.36,
        y: -0.26,
        r: -20,
        w: 0.24
    },
    {
        id: "fire-escape",
        x: -0.25,
        y: -0.48,
        r: -12,
        w: 0.26
    },
    {
        id: "night-shift",
        x: -0.08,
        y: -0.58,
        r: -5,
        w: 0.22
    },
    {
        id: "label-bros",
        x: 0.12,
        y: -0.56,
        r: 4,
        w: 0.33
    },
    {
        id: "beeline",
        x: 0.3,
        y: -0.43,
        r: 12,
        w: 0.22
    },
    {
        id: "new-burst",
        x: 0.38,
        y: -0.22,
        r: 20,
        w: 0.19
    }
];
function SampleKit() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "samples",
        "aria-labelledby": "samples-title",
        className: "kit",
        "data-motion-root": true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2f$Motion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Motion"], {
                name: "kit"
            }, void 0, false, {
                fileName: "[project]/src/components/sections/SampleKit.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "kit-intro",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: "samples-title",
                        className: "section-title",
                        children: "Hold them before you order."
                    }, void 0, false, {
                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-5 max-w-[40ch] text-16 leading-[1.45] md:mt-7 md:text-18",
                        children: "A pack of real stickers and labels, sent to your door, so you can see the colours in daylight and feel the finishes before you choose."
                    }, void 0, false, {
                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/sections/SampleKit.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "kit-action",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "kit-facts",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ph",
                                    children: "[[What is in the kit]]"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ph",
                                    children: "[[Kit price]]"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ph",
                                    children: "[[Delivery time]]"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 flex flex-wrap items-center gap-x-7 gap-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#[[SAMPLE_KIT_URL]]",
                                className: "btn btn-primary",
                                children: [
                                    "Order a sample kit",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2f$Arrow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Arrow"], {}, void 0, false, {
                                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                                        lineNumber: 53,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#pricing",
                                className: "text-link",
                                children: "Or get instant pricing"
                            }, void 0, false, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/sections/SampleKit.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "kit-scene",
                "aria-hidden": "true",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "kit-envelope",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "kit-back"
                        }, void 0, false, {
                            fileName: "[project]/src/components/sections/SampleKit.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "kit-samples",
                            children: KIT.map((k, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-sample": i,
                                    className: "kit-sample",
                                    style: {
                                        "--x": k.x,
                                        "--y": k.y,
                                        "--r": `${k.r}deg`,
                                        "--w": k.w,
                                        "--ratio": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stickers$2f$ratio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stickerRatio"])(k.id)
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stickers$2f$StickerArt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StickerArt"], {
                                        id: k.id,
                                        ratio: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stickers$2f$ratio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stickerRatio"])(k.id)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                                        lineNumber: 80,
                                        columnNumber: 17
                                    }, this)
                                }, k.id, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 66,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/sections/SampleKit.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "kit-front",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "kit-label",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "kit-label-title",
                                        children: "Sample kit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                                        lineNumber: 86,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "kit-label-line",
                                        children: "Stickers and labels"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "kit-label-line",
                                        children: "To: you"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/sections/SampleKit.tsx",
                                        lineNumber: 88,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/sections/SampleKit.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/sections/SampleKit.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "kit-flap"
                        }, void 0, false, {
                            fileName: "[project]/src/components/sections/SampleKit.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "kit-seal logo",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Label"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this),
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$4$2e$3_$40$babel$2b$core$40$7$2e$29$2e$7_supports$2d$color$40$7$2e$2$2e$0_$5f40$types$2b$node$40$20$2e$19$2e$43_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Bros"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                                    lineNumber: 93,
                                    columnNumber: 32
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/sections/SampleKit.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/sections/SampleKit.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/sections/SampleKit.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/sections/SampleKit.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = SampleKit;
var _c;
__turbopack_context__.k.register(_c, "SampleKit");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/sections/kit-motion.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "init",
    ()=>init
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scroll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/scroll.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-client] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/sections/SampleKit.tsx [app-client] (ecmascript)");
"use client";
;
;
function init(root) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scroll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["reducedMotion"])()) return ()=>{};
    const q = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].utils.selector(root);
    const scene = q(".kit-scene")[0];
    if (!scene) return ()=>{};
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].context(()=>{
        const W = ()=>scene.offsetWidth;
        const samples = q("[data-sample]");
        const flap = q(".kit-flap");
        const seal = q(".kit-seal");
        // the sealed envelope
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(flap, {
            rotationX: 0,
            zIndex: 3
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(seal, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotation: -8,
            opacity: 1
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(samples, {
            xPercent: -50,
            yPercent: -50,
            x: (i)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KIT"][i].x * W() * 0.18,
            y: ()=>W() * 0.12,
            rotation: (i)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KIT"][i].r * 0.25,
            scale: 0.86
        });
        const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline({
            defaults: {
                ease: "none"
            }
        });
        tl.to(seal, {
            x: ()=>W() * 0.1,
            y: ()=>-W() * 0.12,
            rotation: 26,
            opacity: 0,
            duration: 0.2,
            ease: "peel"
        }, 0);
        tl.to(flap, {
            rotationX: 180,
            duration: 0.32,
            ease: "power2.inOut"
        }, 0.1);
        tl.set(flap, {
            zIndex: 0
        }, 0.26);
        tl.to(samples, {
            x: (i)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KIT"][i].x * W(),
            y: (i)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KIT"][i].y * W(),
            rotation: (i)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$SampleKit$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KIT"][i].r,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out"
        }, 0.3);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
            trigger: scene,
            start: "top 82%",
            end: "center 56%",
            scrub: 0.6,
            animation: tl,
            invalidateOnRefresh: true
        });
    }, root);
    return ()=>ctx.revert();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/stickers/ratio.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stickerName",
    ()=>stickerName,
    "stickerRatio",
    ()=>stickerRatio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/engine/art.ts [app-client] (ecmascript)");
;
function stickerRatio(id) {
    const design = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESIGNS"].find((d)=>d.id === id);
    if (!design) return 1;
    const { width, height } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stickerSize"])(design);
    return width / height;
}
function stickerName(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESIGNS"].find((d)=>d.id === id)?.name ?? id;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/gsap.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$CustomEase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/CustomEase.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$gsap$2b$react$40$2$2e$1$2e$2_gsap$40$3$2e$15$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@gsap+react@2.1.2_gsap@3.15.0_react@19.3.0/node_modules/@gsap/react/src/index.js [app-client] (ecmascript)");
"use client";
;
;
;
if ("TURBOPACK compile-time truthy", 1) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$gsap$2b$react$40$2$2e$1$2e$2_gsap$40$3$2e$15$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGSAP"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$CustomEase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CustomEase"]);
    // "slap": a sticker hitting the table. Fast in, firm stop, no bounce.
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$CustomEase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CustomEase"].create("slap", "M0,0 C0.4,0 0.08,1 1,1");
    // "peel": slow start as the adhesive lets go, then quick release.
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$CustomEase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CustomEase"].create("peel", "M0,0 C0.55,0 0.25,1 1,1");
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/scroll.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducedMotion",
    ()=>reducedMotion
]);
/*
 * Scroll motion for the sections below the hero. Imported only by the lazy section modules,
 * so ScrollTrigger and DrawSVG never weigh on the first screen.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-client] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$DrawSVGPlugin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/DrawSVGPlugin.js [app-client] (ecmascript)");
"use client";
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$DrawSVGPlugin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DrawSVGPlugin"]);
// Late web fonts change line heights, and with them every trigger position.
let fontsHooked = false;
if (typeof document !== "undefined" && !fontsHooked) {
    fontsHooked = true;
    document.fonts?.ready.then(()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].refresh());
}
const reducedMotion = ()=>("TURBOPACK compile-time value", "object") !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_1hd8d59vevx3m._.js.map