(()=>{"use strict";module.exports = [
"[project]/src/components/hero/engine/art.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/components/hero/engine/fonts.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Faces used inside the sticker artwork (canvas), read from the next/font CSS variables. */ __turbopack_context__.s([
    "loadFonts",
    ()=>loadFonts,
    "stickerFonts",
    ()=>stickerFonts,
    "warmFonts",
    ()=>warmFonts
]);
function stickerFonts() {
    const css = getComputedStyle(document.documentElement);
    const read = (v, fb)=>css.getPropertyValue(v).trim() || fb;
    return {
        sans: read("--font-archivo", "Arial"),
        anton: read("--font-anton", "Impact"),
        serif: read("--font-fraunces", "Georgia"),
        script: read("--font-yellowtail", "cursive")
    };
}
// Load by the primary family only. next/font lists a metric-matched "Fallback" face built
// from a local font (Arial); where that font is missing (Linux, many Android phones) the face
// fails at once and would reject the whole load before the real face has arrived.
const primary = (family)=>family.split(",")[0].trim();
function specs(f) {
    const sans = primary(f.sans);
    return [
        `900 40px ${sans}`,
        `800 40px ${sans}`,
        `700 40px ${sans}`,
        `600 40px ${sans}`,
        `400 40px ${primary(f.anton)}`,
        `600 40px ${primary(f.serif)}`,
        `400 40px ${primary(f.script)}`
    ];
}
let pending = null;
function warmFonts() {
    if (!pending) {
        const list = specs(stickerFonts());
        const loadAll = ()=>Promise.all(list.map((s)=>document.fonts.load(s).catch(()=>[])));
        pending = loadAll().then(async (found)=>{
            // no face matched yet: the font CSS is not in the document yet (dev CSS injection)
            if (found.some((faces)=>faces.length === 0)) {
                await document.fonts.ready;
                await loadAll();
            }
        });
    }
    return pending;
}
async function loadFonts(timeoutMs = 2500) {
    const fonts = stickerFonts();
    const ready = warmFonts();
    let complete = false;
    await Promise.race([
        ready.then(()=>complete = true),
        new Promise((r)=>setTimeout(r, timeoutMs))
    ]);
    return {
        fonts,
        complete,
        ready
    };
}
}),
"[project]/src/components/hero/engine/layout.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Where each sticker starts. x is a fraction of the hero width. y is a fraction of the sticker
 * band (from under the header to the top of the headline), or of the full hero height for items
 * in the "full" zone (the free space beside the headline). rot is in degrees.
 * The stage then nudges every start position clear of the text.
 */ __turbopack_context__.s([
    "DESKTOP",
    ()=>DESKTOP,
    "MOBILE",
    ()=>MOBILE,
    "pickLayout",
    ()=>pickLayout
]);
const DESKTOP = {
    name: "desktop",
    scale: (w, h, band)=>Math.min(1.35, Math.max(0.6, Math.min(w / 1440, h / 860, band / 390))),
    items: [
        {
            id: "fire-escape",
            x: 0.06,
            y: 0.42,
            rot: -12
        },
        {
            id: "night-shift",
            x: 0.205,
            y: 0.38,
            rot: 8
        },
        {
            id: "beeline",
            x: 0.36,
            y: 0.48,
            rot: -7
        },
        {
            id: "label-bros",
            x: 0.53,
            y: 0.3,
            rot: -4
        },
        {
            id: "thank-you",
            x: 0.675,
            y: 0.56,
            rot: 10
        },
        {
            id: "hop-scotch",
            x: 0.81,
            y: 0.36,
            rot: -9
        },
        {
            id: "new-burst",
            x: 0.955,
            y: 0.64,
            rot: 14
        },
        {
            id: "fresh",
            x: 0.5,
            y: 0.8,
            rot: 4
        },
        {
            id: "ember-oak",
            x: 0.83,
            y: 0.56,
            rot: -7,
            zone: "full"
        },
        {
            id: "caution",
            x: 0.92,
            y: 0.68,
            rot: 8,
            zone: "full",
            minWidth: 1024
        },
        {
            id: "approved",
            x: 0.945,
            y: 0.88,
            rot: -10,
            zone: "full"
        }
    ]
};
const MOBILE = {
    name: "mobile",
    scale: (w, _h, band)=>Math.min(0.62, Math.max(0.34, Math.min(w / 390 * 0.5, band / 350 * 0.5))),
    items: [
        {
            id: "fire-escape",
            x: 0.15,
            y: 0.3,
            rot: -12
        },
        {
            id: "label-bros",
            x: 0.62,
            y: 0.22,
            rot: -5
        },
        {
            id: "night-shift",
            x: 0.4,
            y: 0.66,
            rot: 8
        },
        {
            id: "hop-scotch",
            x: 0.86,
            y: 0.62,
            rot: -9
        },
        {
            id: "thank-you",
            x: 0.13,
            y: 0.8,
            rot: 10,
            minBand: 300
        },
        {
            id: "new-burst",
            x: 0.66,
            y: 0.92,
            rot: 13
        }
    ]
};
function pickLayout(w) {
    return w < 768 ? MOBILE : DESKTOP;
}
}),
"[project]/src/components/hero/engine/shaders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Sticker material. The vertex shader peels the sticker: every point between the support line
 * (the outermost edge in the peel direction) and the fold line wraps round a small cylinder,
 * then continues straight, so the flap lifts and shows its paper back.
 */ __turbopack_context__.s([
    "shadowFragment",
    ()=>shadowFragment,
    "shadowVertex",
    ()=>shadowVertex,
    "stickerFragment",
    ()=>stickerFragment,
    "stickerVertex",
    ()=>stickerVertex
]);
const stickerVertex = /* glsl */ `
  uniform vec2 uDir;       // unit vector pointing from the peeled edge into the sticker
  uniform float uSupport;  // distance from centre to the outermost edge along -uDir
  uniform float uPeel;     // how far the fold line has travelled in from that edge (px)
  uniform float uRadius;   // curl radius (px)
  uniform float uMaxAngle; // how far the flap turns before it runs straight

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vT;

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec3 n = vec3(0.0, 0.0, 1.0);

    float t = dot(pos.xy, uDir) + uSupport;
    vT = t;
    float u = uPeel - t;
    if (u > 0.0) {
      vec2 e = -uDir;
      vec2 fold = pos.xy + uDir * u;
      float arcMax = uRadius * uMaxAngle;
      float th = min(u / uRadius, uMaxAngle);
      vec3 p = vec3(fold + e * (uRadius * sin(th)), uRadius * (1.0 - cos(th)));
      if (u > arcMax) p += vec3(cos(th) * e, sin(th)) * (u - arcMax);
      pos = p;
      n = vec3(-sin(th) * e, cos(th));
    }

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const stickerFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float uOpacity;
  uniform float uHolo;
  uniform float uGloss;
  uniform float uGlitter;
  uniform float uPeel;
  uniform float uRadius;
  uniform float uTime;
  uniform vec2 uLight;     // pointer over the hero, -1..1
  uniform vec3 uBack;      // paper back colour

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vT;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 spectrum(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }

  void main() {
    vec4 tex = texture2D(map, vUv);
    if (tex.a < 0.004) discard;
    vec3 base = tex.rgb / tex.a;

    vec3 N = normalize(vNormal);
    bool front = gl_FrontFacing;
    if (!front) N = -N;
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 L = normalize(vec3(-0.45 + uLight.x * 0.25, 0.6 - uLight.y * 0.2, 0.95));
    float rest = L.z; // light on a sticker lying flat: the reference, so flat art keeps its true colour
    float diff = dot(N, L);
    float shade = clamp(1.0 + (diff - rest) * 0.9, 0.35, 1.25);

    vec3 col;
    if (front) {
      col = base;

      // holographic foil: light, unsaturated areas turn to a shifting spectrum
      if (uHolo > 0.0) {
        float lum = dot(base, vec3(0.299, 0.587, 0.114));
        float sat = max(max(base.r, base.g), base.b) - min(min(base.r, base.g), base.b);
        float foil = uHolo * smoothstep(0.55, 0.82, lum) * (1.0 - smoothstep(0.06, 0.22, sat));
        float phase = dot(vUv, vec2(1.15, 0.75)) * 1.35 + N.x * 1.6 - N.y * 1.2
          + uLight.x * 0.55 + uLight.y * 0.35 + vWorld.x * 0.0009;
        phase += 0.04 * sin(vUv.y * 60.0 + vUv.x * 18.0);
        vec3 irid = spectrum(phase);
        vec3 holo = mix(vec3(0.86, 0.87, 0.9), irid, 0.55) * (0.92 + 0.18 * lum);
        float glint = pow(max(0.0, 1.0 - abs(fract(phase * 0.5) - 0.5) * 6.0), 3.0);
        col = mix(col, holo + glint * 0.18, foil);
      }

      // glitter: tiny facets that catch the light as the sticker or the pointer moves
      if (uGlitter > 0.0) {
        vec2 cell = floor(vUv * 110.0);
        float h = hash(cell);
        float tw = pow(max(0.0, sin(h * 60.0 + uTime * 2.2 + (uLight.x + N.x) * 9.0 + (uLight.y - N.y) * 7.0)), 18.0);
        col += uGlitter * step(0.82, h) * tw * 0.9;
        col *= 1.0 + uGlitter * (hash(cell + 3.1) - 0.5) * 0.12;
      }

      // soft shade on the flat part, just beyond the fold, where the lifted flap blocks the light
      if (uPeel > 0.5) {
        float d = vT - uPeel;
        float ao = smoothstep(uRadius * 2.2, 0.0, d) * step(0.0, d);
        col *= 1.0 - 0.28 * ao;
      }
    } else {
      // the paper back, slightly warmer at the crest of the curl
      col = uBack * (0.92 + 0.08 * N.z);
    }

    col *= shade;

    // gloss: a broad highlight band that sweeps with the light
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 60.0);
    float band = dot(vWorld.xy * 0.0012 + vUv * 0.35, vec2(0.8, -0.6)) + uLight.x * 0.5 - uLight.y * 0.25 + N.x * 0.9 - N.y * 0.5;
    float sheen = smoothstep(0.16, 0.0, abs(band - 0.18));
    col += (front ? uGloss : 0.15) * (sheen * 0.11 + spec * 0.35);

    float a = tex.a * uOpacity;
    gl_FragColor = vec4(col * a, a);
  }
`;
const shadowVertex = /* glsl */ `
  uniform vec2 uExpand;
  varying vec2 vUv;
  void main() {
    vUv = (uv - 0.5) * uExpand + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const shadowFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float uOpacity;
  uniform float uLod;
  uniform vec2 uSpread;
  uniform vec3 uColor;
  varying vec2 vUv;

  float tap(vec2 uv) {
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
    return textureLod(map, uv, uLod).a;
  }

  void main() {
    float a = tap(vUv) * 0.2;
    for (int i = 0; i < 8; i++) {
      float ang = float(i) * 0.785398;
      a += tap(vUv + vec2(cos(ang), sin(ang)) * uSpread) * 0.1;
    }
    a *= uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;
}),
"[project]/src/components/hero/engine/stage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StickerStage",
    ()=>StickerStage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.187.0/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.187.0/node_modules/three/build/three.module.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/engine/art.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$fonts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/engine/fonts.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/engine/layout.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hero/engine/shaders.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const FOV = 18;
const LIFT = 130; // px a held sticker rises toward the camera
const ANGLES = 96; // resolution of each sticker's support-function table
const SHADOW_MARGIN = 48; // px of room around a sticker for its blurred shadow
const SHADOW_COLOR = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0.02, 0.05, 0.22);
const BACK_COLOR = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"](0.94, 0.92, 0.87);
const FINISH = {
    gloss: {
        holo: 0,
        gloss: 1,
        glitter: 0
    },
    matte: {
        holo: 0,
        gloss: 0.25,
        glitter: 0
    },
    kraft: {
        holo: 0,
        gloss: 0.1,
        glitter: 0
    },
    holo: {
        holo: 1,
        gloss: 0.8,
        glitter: 0
    },
    glitter: {
        holo: 0,
        gloss: 0.7,
        glitter: 1
    }
};
const clamp = (v, a, b)=>Math.min(b, Math.max(a, v));
const wrap = (a)=>Math.atan2(Math.sin(a), Math.cos(a));
/** Half extents of a w×h box turned by `rot`. */ function extents(w, h, rot) {
    const c = Math.abs(Math.cos(rot));
    const n = Math.abs(Math.sin(rot));
    return {
        hw: (w * c + h * n) / 2,
        hh: (w * n + h * c) / 2
    };
}
/** Push a start position up until a box no longer covers any of the rects. */ function avoid(home, w, h, rects, top) {
    const e = extents(w, h, home.rot);
    const hw = e.hw * 0.92;
    const hh = e.hh * 0.92;
    const gap = 12;
    for(let pass = 0; pass < 3; pass++){
        let moved = false;
        for (const r of rects){
            const clear = home.x + hw < r.x - gap || home.x - hw > r.x + r.w + gap || home.y + hh < r.y - gap || home.y - hh > r.y + r.h + gap;
            if (clear) continue;
            home.y = r.y - gap - hh;
            moved = true;
        }
        if (!moved) break;
    }
    home.y = Math.max(home.y, top * 0.55);
}
class StickerStage {
    o;
    renderer = null;
    scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"]();
    camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PerspectiveCamera"](FOV, 1, 10, 8000);
    stickers = [];
    stack = [];
    flat = [];
    layoutDef = null;
    W = 1;
    H = 1;
    base = 1;
    rect = null;
    drag = null;
    hover = null;
    light = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](0, 0);
    dirty = true;
    inView = true;
    destroyed = false;
    lastClickBlock = 0;
    movedFlag = false;
    time = 0;
    chipW = 0;
    ro;
    io;
    teaseCall;
    fonts = null;
    texScale = 2;
    building = false;
    constructor(o){
        this.o = o;
    }
    /* ------------------------------------------------------------ setup */ async init() {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-hidden", "true");
        canvas.className = "sticker-canvas";
        try {
            // no MSAA: every visible edge comes from texture alpha, so it would only cost fill rate
            this.renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
                canvas,
                antialias: false,
                alpha: true,
                premultipliedAlpha: true
            });
        } catch  {
            return false;
        }
        this.renderer.setClearColor(0x000000, 0);
        this.o.mount.appendChild(canvas);
        const rect = this.o.host.getBoundingClientRect();
        const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickLayout"])(rect.width);
        const band = this.band(rect.height);
        const base = layout.scale(rect.width, rect.height, band.bottom - band.top);
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        this.texScale = clamp(dpr * Math.max(base * 1.15, 0.8) * 1.15, 1.5, 2.8);
        const fonts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$fonts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadFonts"])();
        this.fonts = fonts.fonts;
        if (this.destroyed) return false;
        // if the faces were late, redraw the art once they arrive instead of keeping fallbacks
        if (!fonts.complete) void fonts.ready.then(()=>this.refreshArt());
        // only the stickers this screen shows; others are made if the layout ever needs them
        await this.ensure(this.neededIds(rect.width, layout));
        if (this.destroyed) return false;
        await this.renderer.compileAsync(this.scene, this.camera).catch(()=>undefined);
        if (this.destroyed) return false;
        this.layout(true);
        this.bind();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].ticker.add(this.tick);
        this.intro();
        this.o.onReady();
        // dev only: lets QA scripts find stickers
        if ("TURBOPACK compile-time truthy", 1) Object.assign(window, {
            __lbStage: this
        });
        return true;
    }
    /** No WebGL: lay the same artwork out as still images so the table is never empty. */ async fallback() {
        const { fonts } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$fonts$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadFonts"])();
        if (this.destroyed) return;
        const rect = this.o.host.getBoundingClientRect();
        const W = rect.width;
        const H = rect.height;
        const def = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickLayout"])(W);
        const band = this.band(H);
        const keep = this.keepouts();
        const base = def.scale(W, H, band.bottom - band.top);
        for (const p of def.items){
            if (!this.fits(p, W, band.bottom - band.top)) continue;
            const design = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DESIGNS"].find((d)=>d.id === p.id);
            if (!design) continue;
            const art = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renderSticker"])(design, fonts, Math.min(window.devicePixelRatio || 1, 2));
            if (this.destroyed) return;
            const k = base * (p.s ?? 1);
            const w = art.width * k;
            const h = art.height * k;
            const home = {
                x: p.x * W,
                y: this.homeY(p, H, band),
                rot: p.rot * Math.PI / 180
            };
            avoid(home, w, h, keep, band.top);
            const c = art.canvas;
            c.setAttribute("aria-hidden", "true");
            c.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform:translate(${home.x - w / 2}px,${home.y - h / 2}px) rotate(${home.rot}rad)`;
            this.o.mount.appendChild(c);
            this.flat.push(c);
        }
    }
    fits(it, W, bandH) {
        return W >= (it.minWidth ?? 0) && bandH >= (it.minBand ?? 0);
    }
    neededIds(W, def) {
        const band = this.band(this.o.host.offsetHeight);
        return def.items.filter((it)=>this.fits(it, W, band.bottom - band.top)).map((it)=>it.id);
    }
    /** Build any missing stickers, one short task at a time. */ async ensure(ids) {
        const r = this.renderer;
        if (!this.fonts || !r) return;
        const aniso = r.capabilities.getMaxAnisotropy();
        for (const design of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DESIGNS"]){
            if (!ids.includes(design.id) || this.stickers.some((s)=>s.design.id === design.id)) continue;
            const art = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renderSticker"])(design, this.fonts, this.texScale);
            if (this.destroyed) return;
            const s = this.build(design, art, this.texScale, aniso);
            s.active = false;
            s.mesh.visible = s.shadow.visible = false;
            this.stickers.push(s);
            this.stack.push(s);
            r.initTexture(s.mesh.material.uniforms.map.value); // upload now, not on first frame
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["yieldToMain"])();
            if (this.destroyed) return;
        }
        this.restack();
    }
    /** Redraw every built sticker (used when the art faces arrive late). */ async refreshArt() {
        if (!this.fonts || this.destroyed) return;
        for (const s of this.stickers){
            const art = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renderSticker"])(s.design, this.fonts, s.texScale);
            if (this.destroyed) return;
            const tex = s.mesh.material.uniforms.map.value;
            tex.image = art.canvas;
            tex.needsUpdate = true;
            s.art = art;
            s.support = this.supportTable(art);
            this.dirty = true;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$art$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["yieldToMain"])();
        }
    }
    build(design, art, texScale, aniso) {
        const tex = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CanvasTexture"](art.canvas);
        tex.colorSpace = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NoColorSpace"];
        tex.premultiplyAlpha = true;
        tex.anisotropy = Math.min(8, aniso);
        tex.needsUpdate = true;
        const f = FINISH[design.finish];
        const mat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
            vertexShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stickerVertex"],
            fragmentShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stickerFragment"],
            transparent: true,
            premultipliedAlpha: true,
            depthTest: true,
            depthWrite: true,
            side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"],
            uniforms: {
                map: {
                    value: tex
                },
                uDir: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](-1, 0)
                },
                uSupport: {
                    value: 0
                },
                uPeel: {
                    value: 0
                },
                uRadius: {
                    value: 12
                },
                uMaxAngle: {
                    value: Math.PI * 0.6
                },
                uOpacity: {
                    value: 1
                },
                uHolo: {
                    value: f.holo
                },
                uGloss: {
                    value: f.gloss
                },
                uGlitter: {
                    value: f.glitter
                },
                uTime: {
                    value: 0
                },
                uLight: {
                    value: this.light
                },
                uBack: {
                    value: BACK_COLOR
                }
            }
        });
        const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](art.width, art.height, 56, 56), mat);
        const sw = art.width + SHADOW_MARGIN * 2;
        const sh = art.height + SHADOW_MARGIN * 2;
        const smat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
            vertexShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowVertex"],
            fragmentShader: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$shaders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowFragment"],
            transparent: true,
            premultipliedAlpha: true,
            depthTest: true,
            depthWrite: false,
            uniforms: {
                map: {
                    value: tex
                },
                uExpand: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](sw / art.width, sh / art.height)
                },
                uSpread: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector2"](0, 0)
                },
                uLod: {
                    value: 1
                },
                uOpacity: {
                    value: 0.4
                },
                uColor: {
                    value: SHADOW_COLOR
                }
            }
        });
        const shadow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Mesh"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$187$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlaneGeometry"](sw, sh), smat);
        this.scene.add(shadow, mesh);
        const proxy = document.createElement("button");
        proxy.type = "button";
        proxy.className = "sticker-proxy";
        proxy.setAttribute("aria-label", `${design.name} sticker, ${design.spec.toLowerCase()}`);
        proxy.setAttribute("aria-describedby", "sticker-help");
        this.o.proxies.appendChild(proxy);
        const s = {
            design,
            art,
            texScale,
            itemScale: 1,
            mesh,
            shadow,
            support: this.supportTable(art),
            state: {
                x: 0,
                y: 0,
                rot: 0,
                scale: 1,
                lift: 0,
                peel: 0,
                radius: 10,
                curl: Math.PI * 0.6,
                pa: -Math.PI / 4,
                tiltX: 0,
                tiltY: 0,
                opacity: 1
            },
            home: {
                x: 0,
                y: 0,
                rot: 0
            },
            paTarget: null,
            hoverOn: false,
            active: true,
            moved: false,
            proxy,
            landing: null
        };
        proxy.addEventListener("keydown", (e)=>this.onKey(e, s));
        proxy.addEventListener("focus", ()=>this.showChip(s, null));
        proxy.addEventListener("blur", ()=>this.hideChip());
        return s;
    }
    /** For each direction, how far the sticker's outline reaches: the edge a peel starts from. */ supportTable(art) {
        const table = new Float32Array(ANGLES).fill(-1e9);
        const { mask, maskW, maskH, width, height } = art;
        const sx = width / maskW;
        const sy = height / maskH;
        const cos = new Float32Array(ANGLES);
        const sin = new Float32Array(ANGLES);
        for(let k = 0; k < ANGLES; k++){
            cos[k] = Math.cos(k / ANGLES * Math.PI * 2);
            sin[k] = Math.sin(k / ANGLES * Math.PI * 2);
        }
        for(let j = 0; j < maskH; j++){
            for(let i = 0; i < maskW; i++){
                if (mask[j * maskW + i] < 110) continue;
                const edge = i === 0 || j === 0 || i === maskW - 1 || j === maskH - 1 || mask[j * maskW + i - 1] < 110 || mask[j * maskW + i + 1] < 110 || mask[(j - 1) * maskW + i] < 110 || mask[(j + 1) * maskW + i] < 110;
                if (!edge) continue;
                const lx = (i + 0.5) * sx - width / 2;
                const ly = height / 2 - (j + 0.5) * sy;
                for(let k = 0; k < ANGLES; k++){
                    const d = lx * cos[k] + ly * sin[k];
                    if (d > table[k]) table[k] = d;
                }
            }
        }
        return table;
    }
    support(s, pa) {
        const f = (pa / (Math.PI * 2) % 1 + 1) % 1 * ANGLES;
        const i = Math.floor(f) % ANGLES;
        const t = f - Math.floor(f);
        return s.support[i] * (1 - t) + s.support[(i + 1) % ANGLES] * t + 1;
    }
    restack() {
        this.stack.forEach((s, i)=>{
            s.mesh.renderOrder = i * 2 + 1;
            s.shadow.renderOrder = i * 2;
            s.mesh.userData.z = i * 0.8;
        });
        this.dirty = true;
    }
    toTop(s) {
        this.stack = this.stack.filter((x)=>x !== s);
        this.stack.push(s);
        this.restack();
    }
    /** Resting scale of a sticker on screen. */ k(s) {
        return this.base * s.itemScale;
    }
    /* ------------------------------------------------------------ layout */ homeY(p, H, band) {
        return p.zone === "full" ? p.y * H : band.top + p.y * (band.bottom - band.top);
    }
    layout(initial) {
        const r = this.renderer;
        if (!r) return;
        const rect = this.o.host.getBoundingClientRect();
        this.rect = rect;
        const W = Math.max(1, rect.width);
        const H = Math.max(1, rect.height);
        const prevW = this.W;
        const prevH = this.H;
        this.W = W;
        this.H = H;
        // cap the backing store on very large retina screens
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pr = W * H * dpr * dpr > 6e6 ? Math.min(dpr, 1.5) : dpr;
        if (r.getPixelRatio() !== pr) r.setPixelRatio(pr);
        r.setSize(W, H, false);
        this.camera.aspect = W / H;
        this.camera.position.set(0, 0, H / 2 / Math.tan(FOV * Math.PI / 360));
        this.camera.near = 10;
        this.camera.far = this.camera.position.z * 3;
        this.camera.updateProjectionMatrix();
        const def = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hero$2f$engine$2f$layout$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickLayout"])(W);
        const changed = def !== this.layoutDef;
        this.layoutDef = def;
        const needed = this.neededIds(W, def);
        if (!initial && !this.building && needed.some((id)=>!this.stickers.some((s)=>s.design.id === id))) {
            this.building = true;
            void this.ensure(needed).then(()=>{
                this.building = false;
                if (!this.destroyed) this.layout(false);
            });
        }
        const band = this.band(H);
        const keep = this.keepouts();
        this.base = def.scale(W, H, band.bottom - band.top);
        for (const s of this.stickers){
            const p = def.items.find((it)=>it.id === s.design.id && this.fits(it, W, band.bottom - band.top));
            s.active = !!p;
            s.mesh.visible = s.shadow.visible = s.active;
            s.proxy.hidden = !s.active;
            if (!p) continue;
            s.itemScale = p.s ?? 1;
            s.home = {
                x: p.x * W,
                y: this.homeY(p, H, band),
                rot: p.rot * Math.PI / 180
            };
            avoid(s.home, (s.art.width - 8) * this.k(s), (s.art.height - 8) * this.k(s), keep, band.top);
            if (initial || changed || !s.moved) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf(s.state, "x,y,rot");
                s.state.x = s.home.x;
                s.state.y = s.home.y;
                s.state.rot = s.home.rot;
                if (changed && !initial) s.moved = false;
            } else {
                const next = this.settle(s, s.state.x * (W / prevW), s.state.y * (H / prevH), s.state.rot);
                s.state.x = next.x;
                s.state.y = next.y;
            }
            // keyboard stand-in: sized once here, only transformed per frame
            s.proxy.style.width = `${s.art.width * this.k(s)}px`;
            s.proxy.style.height = `${s.art.height * this.k(s)}px`;
        }
        if (changed && !initial) this.emitMoved();
        this.dirty = true;
    }
    /** Elements stickers must keep off. `hard` ones (paragraph, buttons) also can't be landed on. */ keepouts(hardOnly = false) {
        const host = this.o.host;
        return [
            ...host.querySelectorAll("[data-keepout]")
        ].filter((el)=>el.offsetWidth > 0 && (!hardOnly || el.dataset.keepout === "hard")).map((el)=>{
            // offsets, not getBoundingClientRect: the intro transforms must not skew the measurement
            let x = 0;
            let y = 0;
            let n = el;
            while(n && n !== host){
                x += n.offsetLeft;
                y += n.offsetTop;
                n = n.offsetParent;
            }
            return {
                x,
                y,
                w: el.offsetWidth,
                h: el.offsetHeight
            };
        });
    }
    headerH() {
        return document.querySelector("header")?.offsetHeight ?? 72;
    }
    /** The strip between the header and the headline where the collage lives. */ band(H) {
        const top = this.headerH();
        const keep = this.keepouts();
        const textTop = keep.length ? Math.min(...keep.map((r)=>r.y)) : H * 0.55;
        return {
            top,
            bottom: Math.max(top + 140, textTop - 6)
        };
    }
    /**
   * Where a sticker may come to rest: mostly on the table, below the header, and never on the
   * paragraph, the buttons or the controls (so it can't bury the call to action).
   */ settle(s, x, y, rot) {
        const { hw, hh } = extents((s.art.width - 8) * this.k(s), (s.art.height - 8) * this.k(s), rot);
        const minY = Math.min(this.H / 2, this.headerH() + hh * 0.75);
        let nx = clamp(x, hw * 0.45, this.W - hw * 0.45);
        let ny = clamp(y, minY, this.H - hh * 0.5);
        const gap = 10;
        for (const r of this.keepouts(true)){
            const clear = nx + hw * 0.9 < r.x - gap || nx - hw * 0.9 > r.x + r.w + gap || ny + hh * 0.9 < r.y - gap || ny - hh * 0.9 > r.y + r.h + gap;
            if (!clear) ny = Math.min(ny, r.y - gap - hh * 0.9);
        }
        nx = clamp(nx, hw * 0.45, this.W - hw * 0.45);
        return {
            x: nx,
            y: Math.max(ny, minY * 0.9)
        };
    }
    /* ------------------------------------------------------------ intro */ intro() {
        const live = this.stickers.filter((s)=>s.active);
        if (this.o.reduceMotion) {
            this.dirty = true;
            return;
        }
        const order = [
            ...live
        ].sort((a, b)=>a.home.x + a.home.y * 0.4 - (b.home.x + b.home.y * 0.4));
        order.forEach((s, i)=>{
            const st = s.state;
            st.opacity = 0;
            st.lift = 1.5;
            st.scale = 1.08;
            st.rot = s.home.rot + (i % 2 ? 0.35 : -0.35);
            st.peel = 26;
            st.radius = 14;
            st.curl = Math.PI * 0.7;
            st.pa = s.home.rot > 0 ? Math.PI * 0.25 : Math.PI * 0.75;
            const at = 0.28 + i * 0.075;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                opacity: 1,
                duration: 0.14,
                delay: at,
                ease: "none"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                lift: 0,
                duration: 0.55,
                delay: at,
                ease: "slap"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                rot: s.home.rot,
                duration: 0.7,
                delay: at,
                ease: "expo.out"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                peel: 0,
                duration: 0.5,
                delay: at + 0.32,
                ease: "power2.out"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline({
                delay: at + 0.4
            }).to(st, {
                scale: 0.97,
                duration: 0.14,
                ease: "power2.in"
            }).to(st, {
                scale: 1,
                duration: 0.4,
                ease: "expo.out"
            });
        });
        const end = 0.28 + order.length * 0.075 + 0.9;
        this.teaseCall = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].delayedCall(end, ()=>this.tease("label-bros"));
    }
    /** One sticker lifts a corner by itself, once, so people see that they peel. */ tease(id) {
        const s = this.stickers.find((x)=>x.design.id === id && x.active);
        if (!s || this.drag || this.hover || s.moved) return;
        const st = s.state;
        st.pa = -Math.atan2(s.art.height, s.art.width); // bottom-right corner
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline().to(st, {
            peel: this.hoverPeel(s) * 1.5,
            radius: 9,
            curl: Math.PI * 0.82,
            duration: 0.7,
            ease: "peel"
        }).to(st, {
            peel: 0,
            duration: 0.55,
            ease: "slap"
        }, "+=0.6");
    }
    /* ------------------------------------------------------------ pointer */ bind() {
        const h = this.o.host;
        h.addEventListener("pointerdown", this.onDown);
        h.addEventListener("pointermove", this.onMove);
        h.addEventListener("pointerup", this.onUp);
        h.addEventListener("pointercancel", this.onUp);
        h.addEventListener("pointerleave", this.onLeave);
        h.addEventListener("touchstart", this.onTouchStart, {
            passive: false
        });
        h.addEventListener("click", this.onClickCapture, true);
        window.addEventListener("scroll", this.onScroll, {
            passive: true
        });
        this.ro = new ResizeObserver(()=>{
            if (!this.destroyed) this.layout(false);
        });
        this.ro.observe(h);
        this.io = new IntersectionObserver(([e])=>{
            this.inView = e.isIntersecting;
            this.dirty = true;
        });
        this.io.observe(h);
    }
    onScroll = ()=>{
        this.rect = this.o.host.getBoundingClientRect();
    };
    local(e) {
        const r = this.rect ?? this.o.host.getBoundingClientRect();
        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top
        };
    }
    /** Pointer in the sticker's own frame (y up, unscaled px). */ toLocal(s, x, y) {
        const k = this.k(s) * s.state.scale;
        const dx = x - s.state.x;
        const dy = y - s.state.y;
        const c = Math.cos(s.state.rot);
        const n = Math.sin(s.state.rot);
        return {
            x: (dx * c + dy * n) / k,
            y: -(-dx * n + dy * c) / k
        };
    }
    hit(x, y) {
        for(let i = this.stack.length - 1; i >= 0; i--){
            const s = this.stack[i];
            if (!s.active || s.state.opacity < 0.5) continue;
            const p = this.toLocal(s, x, y);
            const { width, height, mask, maskW, maskH } = s.art;
            const u = (p.x + width / 2) / width;
            const v = (height / 2 - p.y) / height;
            if (u < 0 || v < 0 || u >= 1 || v >= 1) continue;
            if (mask[Math.floor(v * maskH) * maskW + Math.floor(u * maskW)] > 60) return s;
        }
        return null;
    }
    hoverPeel(s) {
        return clamp(Math.min(s.art.width, s.art.height) * 0.2, 22, 40);
    }
    /** Real stickers peel from corners: pull the peel direction onto a corner when near one. */ cornerBias(s, a) {
        const ca = Math.atan2(s.art.height, s.art.width);
        for (const c of [
            ca,
            Math.PI - ca,
            -Math.PI + ca,
            -ca
        ]){
            const d = wrap(a - c);
            if (Math.abs(d) < 0.45) return c + d * (Math.abs(d) / 0.45);
        }
        return a;
    }
    /** Is the edge we'd peel tucked under a sticker that sits on top of this one? */ edgeCovered(s, pa) {
        const k = this.k(s) * s.state.scale;
        const r = this.support(s, pa) * 0.9;
        const lx = Math.cos(pa) * r * k;
        const ly = -Math.sin(pa) * r * k;
        const c = Math.cos(s.state.rot);
        const n = Math.sin(s.state.rot);
        const top = this.hit(s.state.x + lx * c - ly * n, s.state.y + lx * n + ly * c);
        return !!top && top !== s;
    }
    onTouchStart = (e)=>{
        const t = e.touches[0];
        if (!t || e.touches.length > 1) return;
        const p = this.local(t);
        if (this.hit(p.x, p.y)) e.preventDefault(); // a sticker was touched: drag it, don't scroll
    };
    onClickCapture = (e)=>{
        if (performance.now() - this.lastClickBlock < 400) {
            e.preventDefault();
            e.stopPropagation();
        }
    };
    onDown = (e)=>{
        if (this.drag || e.pointerType === "mouse" && e.button !== 0) return;
        this.rect = this.o.host.getBoundingClientRect();
        const p = this.local(e);
        const s = this.hit(p.x, p.y);
        if (!s) return;
        e.preventDefault();
        this.lastClickBlock = performance.now();
        try {
            this.o.host.setPointerCapture(e.pointerId);
        } catch  {}
        this.teaseCall?.kill();
        const lp = this.toLocal(s, p.x, p.y);
        const angle = this.cornerBias(s, Math.atan2(lp.y, lp.x));
        if (this.hover !== s) s.state.pa = angle;
        s.paTarget = angle;
        this.hover = s;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf(s.state);
        s.landing?.kill();
        s.landing = null;
        this.toTop(s);
        this.drag = {
            s,
            id: e.pointerId,
            offX: p.x - s.state.x,
            offY: p.y - s.state.y,
            rot0: s.state.rot,
            sway: 0,
            samples: [
                {
                    t: performance.now(),
                    x: p.x,
                    y: p.y
                }
            ]
        };
        const m = Math.min(s.art.width, s.art.height);
        const st = s.state;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline().to(st, {
            peel: clamp(m * 0.36, 44, 90),
            radius: clamp(m * 0.09, 10, 20),
            curl: Math.PI * 0.86,
            duration: 0.24,
            ease: "peel"
        }).to(st, {
            peel: clamp(m * 0.24, 30, 58),
            curl: Math.PI * 0.78,
            radius: clamp(m * 0.1, 10, 22),
            duration: 0.5,
            ease: "power2.out"
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            lift: 1,
            scale: 1.06,
            opacity: 1,
            duration: 0.42,
            ease: "power3.out"
        });
        this.o.host.dataset.cursor = "grabbing";
        this.showChip(s, p);
        this.dirty = true;
    };
    onMove = (e)=>{
        const p = this.local(e);
        this.light.set(p.x / this.W * 2 - 1, p.y / this.H * 2 - 1);
        this.dirty = true;
        const d = this.drag;
        if (d && e.pointerId === d.id) {
            d.s.state.x = p.x - d.offX;
            d.s.state.y = p.y - d.offY;
            const now = performance.now();
            d.samples.push({
                t: now,
                x: p.x,
                y: p.y
            });
            while(d.samples.length > 2 && now - d.samples[0].t > 140)d.samples.shift();
            if (!d.s.moved) {
                d.s.moved = true;
                this.emitMoved();
            }
            this.moveChip(p);
            return;
        }
        if (e.pointerType !== "mouse" || d) return;
        const s = this.hit(p.x, p.y);
        if (s !== this.hover) {
            if (this.hover) this.unhover(this.hover);
            this.hover = s;
            if (s) {
                const lp = this.toLocal(s, p.x, p.y);
                s.state.pa = this.cornerBias(s, Math.atan2(lp.y, lp.x));
                s.hoverOn = false;
                this.o.host.dataset.cursor = "grab";
                this.showChip(s, p);
            } else {
                delete this.o.host.dataset.cursor;
                this.hideChip();
            }
        }
        if (s) {
            const lp = this.toLocal(s, p.x, p.y);
            s.paTarget = this.cornerBias(s, Math.atan2(lp.y, lp.x));
            // lift the edge nearest the pointer, unless another sticker lies on top of it
            const on = !this.edgeCovered(s, s.paTarget);
            if (on !== s.hoverOn) {
                s.hoverOn = on;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(s.state, {
                    peel: on ? this.hoverPeel(s) : 0,
                    radius: 7,
                    curl: Math.PI * 0.8,
                    duration: on ? 0.45 : 0.3,
                    ease: on ? "power3.out" : "power2.out",
                    overwrite: "auto"
                });
            }
            this.moveChip(p);
        }
    };
    unhover(s) {
        s.paTarget = null;
        s.hoverOn = false;
        if (this.drag?.s === s) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(s.state, {
            peel: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
        });
    }
    onLeave = (e)=>{
        if (e.pointerType !== "mouse" || this.drag) return;
        if (this.hover) this.unhover(this.hover);
        this.hover = null;
        delete this.o.host.dataset.cursor;
        this.hideChip();
        this.light.set(0, 0);
        this.dirty = true;
    };
    velocity(d) {
        const now = performance.now();
        const last = d.samples[d.samples.length - 1];
        if (!last || now - last.t > 90) return {
            vx: 0,
            vy: 0
        };
        let first = d.samples[0];
        for (const smp of d.samples){
            if (last.t - smp.t <= 100) {
                first = smp;
                break;
            }
        }
        const dt = Math.max(16, last.t - first.t) / 1000;
        return {
            vx: (last.x - first.x) / dt,
            vy: (last.y - first.y) / dt
        };
    }
    onUp = (e)=>{
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        try {
            this.o.host.releasePointerCapture(e.pointerId);
        } catch  {}
        this.drag = null;
        this.lastClickBlock = performance.now();
        const s = d.s;
        const st = s.state;
        const { vx, vy } = this.velocity(d);
        const speed = Math.hypot(vx, vy);
        const thrown = !this.o.reduceMotion && speed > 160;
        if (thrown) {
            const k = Math.min(1, 1800 / speed) * 0.32;
            const spin = clamp(vx * 0.00032, -0.8, 0.8);
            const to = this.settle(s, st.x + vx * k, st.y + vy * k, st.rot + spin);
            const dur = clamp(0.42 + speed / 5200, 0.45, 0.95);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                x: to.x,
                y: to.y,
                rot: st.rot + spin,
                duration: dur,
                ease: "power3.out"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                tiltX: 0,
                tiltY: 0,
                duration: dur,
                ease: "power2.out"
            });
            s.landing = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].delayedCall(dur * 0.45, ()=>this.slap(s));
        } else {
            const to = this.settle(s, st.x, st.y, st.rot);
            if (Math.abs(to.x - st.x) > 0.5 || Math.abs(to.y - st.y) > 0.5) {
                // not on the buttons: carry it to the nearest clear spot, then stick it
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                    x: to.x,
                    y: to.y,
                    duration: 0.45,
                    ease: "power2.inOut"
                });
                s.landing = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].delayedCall(0.3, ()=>this.slap(s));
            } else this.slap(s);
        }
        const p = this.local(e);
        const over = e.pointerType === "mouse" && !thrown ? this.hit(p.x, p.y) : null;
        this.hover = null;
        s.hoverOn = false;
        if (over) this.o.host.dataset.cursor = "grab";
        else {
            delete this.o.host.dataset.cursor;
            this.hideChip();
        }
    };
    /** Back onto the table: fast in, firm stop, a little squash. No bounce. */ slap(s) {
        const st = s.state;
        const rm = this.o.reduceMotion;
        s.landing = null;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            lift: 0,
            duration: rm ? 0.15 : 0.3,
            ease: "slap",
            overwrite: "auto"
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            peel: 0,
            duration: rm ? 0.15 : 0.32,
            ease: "power2.out",
            overwrite: "auto"
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            tiltX: 0,
            tiltY: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
        });
        if (rm) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            scale: 1,
            duration: 0.15,
            overwrite: "auto"
        });
        else __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline().to(st, {
            scale: 0.972,
            duration: 0.26,
            ease: "slap",
            overwrite: "auto"
        }).to(st, {
            scale: 1,
            duration: 0.34,
            ease: "expo.out"
        });
        s.paTarget = null;
    }
    /* ------------------------------------------------------------ keyboard */ onKey(e, s) {
        const step = e.shiftKey ? 72 : 24;
        const st = s.state;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowLeft") dx = -step;
        else if (e.key === "ArrowRight") dx = step;
        else if (e.key === "ArrowUp") dy = -step;
        else if (e.key === "ArrowDown") dy = step;
        else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.toTop(s);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                rot: st.rot + Math.PI / 12,
                duration: 0.4,
                ease: "power3.out"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                lift: 0.4,
                duration: 0.15,
                ease: "power2.out",
                onComplete: ()=>this.slap(s)
            });
            s.moved = true;
            this.emitMoved();
            return;
        } else return;
        e.preventDefault();
        this.toTop(s);
        const to = this.settle(s, st.x + dx, st.y + dy, st.rot);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            x: to.x,
            y: to.y,
            duration: this.o.reduceMotion ? 0 : 0.28,
            ease: "power2.out",
            onUpdate: ()=>this.showChip(s, null)
        });
        if (!this.o.reduceMotion) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
            lift: 0.35,
            duration: 0.12,
            ease: "power2.out",
            onComplete: ()=>this.slap(s)
        });
        if (!s.moved) {
            s.moved = true;
            this.emitMoved();
        }
    }
    /* ------------------------------------------------------------ info chip */ showChip(s, p) {
        const c = this.o.chip;
        c.querySelector("[data-name]").textContent = s.design.name;
        c.querySelector("[data-spec]").textContent = s.design.spec;
        c.dataset.show = "true";
        this.chipW = c.offsetWidth; // measured once per sticker, not per move
        if (p) this.moveChip(p);
        else this.moveChip({
            x: s.state.x - 40,
            y: s.state.y + s.art.height * this.k(s) / 2 - 8
        });
    }
    moveChip(p) {
        const x = clamp(p.x + 18, 8, this.W - this.chipW - 8);
        const y = clamp(p.y + 22, 8, this.H - 60);
        this.o.chip.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    hideChip() {
        if (document.activeElement && this.stickers.some((s)=>s.proxy === document.activeElement)) return;
        this.o.chip.dataset.show = "false";
    }
    /* ------------------------------------------------------------ reset */ reset() {
        this.teaseCall?.kill();
        let i = 0;
        for (const s of this.stickers){
            if (!s.active || !s.moved) continue;
            const st = s.state;
            s.moved = false;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf(st);
            s.landing?.kill();
            if (this.o.reduceMotion) {
                Object.assign(st, {
                    x: s.home.x,
                    y: s.home.y,
                    rot: s.home.rot,
                    lift: 0,
                    peel: 0,
                    scale: 1,
                    tiltX: 0,
                    tiltY: 0
                });
                continue;
            }
            const at = i++ * 0.05;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                lift: 0.7,
                scale: 1.04,
                duration: 0.25,
                delay: at,
                ease: "power2.out"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(st, {
                x: s.home.x,
                y: s.home.y,
                rot: s.home.rot,
                duration: 0.75,
                delay: at,
                ease: "power2.inOut"
            });
            s.landing = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].delayedCall(at + 0.55, ()=>this.slap(s));
        }
        this.emitMoved();
        this.dirty = true;
    }
    emitMoved() {
        const moved = this.stickers.some((s)=>s.active && s.moved);
        if (moved !== this.movedFlag) {
            this.movedFlag = moved;
            this.o.onMovedChange(moved);
        }
    }
    /* ------------------------------------------------------------ frame */ tick = (_t, deltaMs)=>{
        const r = this.renderer;
        if (this.destroyed || !this.inView || !r) return;
        const dt = Math.min(0.05, deltaMs / 1000);
        let busy = this.dirty;
        const d = this.drag;
        if (d) {
            const { vx, vy } = this.velocity(d);
            const target = clamp(vx * 0.00042, -0.3, 0.3);
            d.sway += (target - d.sway) * (1 - Math.exp(-dt * 9));
            const st = d.s.state;
            st.rot = d.rot0 + d.sway;
            st.tiltY += (clamp(vx * 0.00028, -0.28, 0.28) - st.tiltY) * (1 - Math.exp(-dt * 8));
            st.tiltX += (clamp(vy * 0.00028, -0.28, 0.28) - st.tiltX) * (1 - Math.exp(-dt * 8));
            busy = true;
        }
        for (const s of this.stickers){
            if (!s.active) continue;
            if (s.paTarget !== null) {
                const delta = wrap(s.paTarget - s.state.pa);
                if (Math.abs(delta) > 0.001) {
                    s.state.pa += delta * (1 - Math.exp(-dt * 12));
                    busy = true;
                }
            }
            if (!busy && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].isTweening(s.state)) busy = true;
        }
        if (!busy) return;
        this.time += dt;
        this.sync();
        r.render(this.scene, this.camera);
        this.dirty = false;
    };
    sync() {
        const W = this.W;
        const H = this.H;
        for (const s of this.stickers){
            if (!s.active) continue;
            const st = s.state;
            const rest = this.k(s);
            const k = rest * st.scale;
            const z = s.mesh.userData.z ?? 0;
            s.mesh.position.set(st.x - W / 2, H / 2 - st.y, z + st.lift * LIFT);
            s.mesh.rotation.set(-st.tiltX, st.tiltY, -st.rot);
            s.mesh.scale.setScalar(k);
            const u = s.mesh.material.uniforms;
            const c = Math.cos(st.pa);
            const n = Math.sin(st.pa);
            u.uDir.value.set(-c, -n);
            u.uSupport.value = this.support(s, st.pa);
            u.uPeel.value = st.peel;
            u.uRadius.value = st.radius;
            u.uMaxAngle.value = st.curl;
            u.uOpacity.value = st.opacity;
            u.uTime.value = this.time;
            // shadow: tight contact on the table, wide and soft when held
            const L = st.lift;
            const blur = 6 + L * 22;
            const offX = 2.5 + L * 20;
            const offY = 6 + L * 38;
            s.shadow.position.set(st.x + offX - W / 2, H / 2 - (st.y + offY), z - 0.4);
            s.shadow.rotation.set(0, 0, -st.rot);
            s.shadow.scale.setScalar(rest * (1 + L * 0.03));
            const su = s.shadow.material.uniforms;
            const sw = s.art.width + SHADOW_MARGIN * 2;
            const sh = s.art.height + SHADOW_MARGIN * 2;
            su.uSpread.value.set(blur / sw, blur / sh);
            su.uLod.value = Math.log2(Math.max(1, blur * s.texScale * rest * 0.5));
            su.uOpacity.value = (0.55 + L * 0.12) * st.opacity * (1 - Math.min(1, st.peel / 400));
            // keyboard stand-in follows with a transform only (its size is set in layout)
            const pw = s.art.width * rest;
            const ph = s.art.height * rest;
            s.proxy.style.transform = `translate3d(${st.x - pw / 2}px, ${st.y - ph / 2}px, 0) rotate(${st.rot}rad) scale(${st.scale})`;
        }
    }
    /* ------------------------------------------------------------ teardown */ destroy() {
        this.destroyed = true;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].ticker.remove(this.tick);
        this.teaseCall?.kill();
        const h = this.o.host;
        h.removeEventListener("pointerdown", this.onDown);
        h.removeEventListener("pointermove", this.onMove);
        h.removeEventListener("pointerup", this.onUp);
        h.removeEventListener("pointercancel", this.onUp);
        h.removeEventListener("pointerleave", this.onLeave);
        h.removeEventListener("touchstart", this.onTouchStart);
        h.removeEventListener("click", this.onClickCapture, true);
        window.removeEventListener("scroll", this.onScroll);
        delete h.dataset.cursor;
        this.ro?.disconnect();
        this.io?.disconnect();
        for (const s of this.stickers){
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf(s.state);
            s.landing?.kill();
            s.mesh.geometry.dispose();
            s.shadow.geometry.dispose();
            s.mesh.material.uniforms.map.value.dispose();
            s.mesh.material.dispose();
            s.shadow.material.dispose();
            s.proxy.remove();
        }
        this.flat.forEach((c)=>c.remove());
        this.renderer?.dispose();
        this.renderer?.domElement.remove();
    }
}
}),
"[project]/src/lib/gsap.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$CustomEase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/CustomEase.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$gsap$2b$react$40$2$2e$1$2e$2_gsap$40$3$2e$15$2e$0_react$40$19$2e$3$2e$0$2f$node_modules$2f40$gsap$2f$react$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@gsap+react@2.1.2_gsap@3.15.0_react@19.3.0/node_modules/@gsap/react/src/index.js [app-ssr] (ecmascript)");
"use client";
;
;
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
;
}),
];})()

//# sourceMappingURL=src_0s54i-w305ugb._.js.map