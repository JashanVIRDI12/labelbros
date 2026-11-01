(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/sections/deck-motion.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "init",
    ()=>init
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scroll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/scroll.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-client] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/ScrollTrigger.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$peel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/peel.ts [app-client] (ecmascript)");
"use client";
;
;
/*
 * The peel-off pad. One scrubbed timeline: for each label, the fold travels in from the
 * bottom-right corner, the paper back follows it over, and the label leaves the stack up and to
 * the left. The next label straightens as the one above clears it.
 */ const ANGLE = 62 * Math.PI / 180; // travel: mostly up, a little left
const COS = Math.cos(ANGLE);
_c = COS;
const SIN = Math.sin(ANGLE);
_c1 = SIN;
const SHADE_TURN = ANGLE - Math.PI / 2;
const TEASE = 18; // px of corner lifted on the label on top, so it reads as peelable
const HOVER = 26; // extra lift while the pointer is on it
const OFF = 1.16; // how far past "fully peeled" the fold goes, so the label clears the screen
// Same query as the CSS that turns the list into a pad.
const MODE = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
function init(root) {
    if (!window.matchMedia(MODE).matches) return ()=>{};
    const track = root.querySelector(".deck-track");
    const cards = [
        ...root.querySelectorAll("[data-card]")
    ].map((el, i)=>({
            el,
            face: el.querySelector("[data-face]"),
            flap: el.querySelector("[data-flap]"),
            shade: el.querySelector("[data-shade]"),
            w: 0,
            h: 0,
            p: 0,
            t: i === 0 ? 1 : 0,
            hover: 0
        }));
    const n = cards.length;
    const step = Number(root.dataset.step) || 80;
    const lead = (Number(root.dataset.lead) || 0) / step;
    const tail = (Number(root.dataset.tail) || 0) / step;
    const index = [
        ...root.querySelectorAll("[data-goto]")
    ];
    const bars = [
        ...root.querySelectorAll(".deck-progress i")
    ];
    const holo = [
        ...root.querySelectorAll('[data-sticker="label-bros"]')
    ];
    let active = 0;
    let st = null;
    const render = (c)=>{
        if (!c.w) return;
        const max = c.w * COS + c.h * SIN;
        const s = Math.max(c.p * max, (TEASE + c.hover) * c.t);
        const g = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$peel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["peelShape"])(c.w, c.h, s, ANGLE);
        c.face.style.clipPath = g.face;
        c.flap.style.clipPath = g.flap;
        c.flap.style.transform = g.matrix;
        // the shade band lies along the fold, on the lifted side
        const qx = c.w - s * COS;
        const qy = c.h - s * SIN;
        c.shade.style.transform = `translate(${qx.toFixed(1)}px,${qy.toFixed(1)}px) rotate(${SHADE_TURN}rad) translate(-1500px,0)`;
    };
    const measure = ()=>{
        for (const c of cards){
            c.w = c.face.offsetWidth;
            c.h = c.face.offsetHeight;
            render(c);
        }
    };
    const setActive = (i)=>{
        if (i === active) return;
        active = i;
        index.forEach((b, k)=>k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"));
    };
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].context(()=>{
        // GSAP owns the pile transforms from here on
        cards.forEach((c)=>{
            const css = c.el.style;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(c.el, {
                x: parseFloat(css.getPropertyValue("--x")) || 0,
                y: parseFloat(css.getPropertyValue("--y")) || 0,
                rotation: parseFloat(css.getPropertyValue("--rot")) || 0
            });
        });
        const tl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline({
            defaults: {
                ease: "none"
            }
        });
        tl.addLabel("c0", lead);
        cards.forEach((c, i)=>{
            if (i === n - 1) return;
            const at = lead + i;
            const next = cards[i + 1];
            tl.to(c, {
                p: OFF,
                duration: 1,
                onUpdate: ()=>render(c)
            }, at);
            // the label underneath squares up as it is uncovered
            tl.to(next.el, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.6,
                ease: "power2.inOut"
            }, at + 0.3);
            tl.to(next, {
                t: 1,
                duration: 0.25,
                onUpdate: ()=>render(next)
            }, at + 0.75);
            tl.addLabel(`c${i + 1}`, at + 1);
        });
        tl.to({}, {
            duration: tail
        }, lead + n - 1);
        if (holo.length) tl.fromTo(holo, {
            "--holo": "0deg"
        }, {
            "--holo": "300deg",
            duration: tl.duration()
        }, 0);
        st = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$ScrollTrigger$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollTrigger"].create({
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            animation: tl,
            onRefresh: measure
        });
        // follow the (smoothed) animation, not the scroll position: after a jump the scrub
        // catches up over a few frames and the index should follow it
        tl.eventCallback("onUpdate", ()=>{
            const time = tl.time();
            let i = 0;
            while(i < n - 1 && cards[i].p > 0.55)i++;
            setActive(i);
            bars.forEach((bar, k)=>{
                const fill = k === 0 ? 1 : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].utils.clamp(0, 1, (time - lead - (k - 1)) / 0.7);
                bar.style.setProperty("--p", fill.toFixed(3));
            });
        });
        measure();
        bars.forEach((bar, k)=>bar.style.setProperty("--p", k === 0 ? "1" : "0"));
    }, root);
    const scrollFor = (i)=>{
        if (!st) return 0;
        const tl = st.animation;
        return st.start + (st.end - st.start) * ((tl.labels[`c${i}`] ?? 0) / tl.duration());
    };
    // index buttons jump to their label
    const onIndex = (e)=>{
        const b = e.target.closest("[data-goto]");
        if (!b) return;
        window.scrollTo({
            top: scrollFor(Number(b.dataset.goto)) + 1,
            behavior: "smooth"
        });
    };
    // keyboard: focusing a link on a covered label peels everything above it
    const onFocus = (e)=>{
        const card = e.target.closest("[data-card]");
        if (!card) return;
        const i = Number(card.dataset.card);
        if (i !== active) window.scrollTo({
            top: scrollFor(i) + 1,
            behavior: "instant"
        });
    };
    // hovering the top label lifts its corner a little further
    const hover = (on)=>(e)=>{
            if (e.pointerType === "touch") return;
            const i = Number(e.currentTarget.closest("[data-card]")?.dataset.card);
            const c = cards[i];
            if (!c || i !== active) return;
            // "auto" only replaces an earlier hover tween; "true" would also kill this card's scroll peel
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(c, {
                hover: on ? HOVER : 0,
                duration: on ? 0.55 : 0.4,
                ease: on ? "expo.out" : "slap",
                overwrite: "auto",
                onUpdate: ()=>render(c)
            });
        };
    const enter = hover(true);
    const leave = hover(false);
    root.addEventListener("click", onIndex);
    root.addEventListener("focusin", onFocus);
    cards.forEach((c)=>{
        c.face.addEventListener("pointerenter", enter);
        c.face.addEventListener("pointerleave", leave);
    });
    return ()=>{
        root.removeEventListener("click", onIndex);
        root.removeEventListener("focusin", onFocus);
        cards.forEach((c)=>{
            c.face.removeEventListener("pointerenter", enter);
            c.face.removeEventListener("pointerleave", leave);
            c.face.style.clipPath = "";
            c.flap.style.clipPath = "";
            c.flap.style.transform = "";
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf(c);
        });
        ctx.revert();
    };
}
var _c, _c1;
__turbopack_context__.k.register(_c, "COS");
__turbopack_context__.k.register(_c1, "SIN");
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
"[project]/src/lib/peel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * A flat label peeling off its stack, in plain 2D. The fold is a straight line that travels in
 * from the bottom-right corner along `d`. Everything on the corner side of the line is lifted:
 * it is cut from the face and shown again as the paper back, mirrored across the fold.
 * The same geometry as the peeling buttons, at card scale.
 */ __turbopack_context__.s([
    "peelShape",
    ()=>peelShape
]);
const EMPTY = "polygon(0px 0px, 0px 0px, 0px 0px)";
function clipHalf(poly, f) {
    const out = [];
    for(let i = 0; i < poly.length; i++){
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const fa = f(a);
        const fb = f(b);
        if (fa >= 0) out.push(a);
        if (fa >= 0 !== fb >= 0) {
            const t = fa / (fa - fb);
            out.push([
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t
            ]);
        }
    }
    return out;
}
const poly = (pts)=>pts.length < 3 ? EMPTY : `polygon(${pts.map(([x, y])=>`${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
function peelShape(w, h, s, angle, pad = 2) {
    const dx = -Math.cos(angle);
    const dy = -Math.sin(angle);
    const cx = w;
    const cy = h;
    const max = -(w * dx + h * dy); // distance to the far (top-left) corner along d
    const rect = [
        [
            -pad,
            -pad
        ],
        [
            w + pad,
            -pad
        ],
        [
            w + pad,
            h + pad
        ],
        [
            -pad,
            h + pad
        ]
    ];
    const f = (p)=>(p[0] - cx) * dx + (p[1] - cy) * dy - s;
    const face = s <= 0 ? "none" : poly(clipHalf(rect, f));
    const flap = s <= 0 ? EMPTY : poly(clipHalf(rect, (p)=>-f(p)));
    // mirror across the fold: P' = (I - 2ddT) P + 2 (C.d + s) d
    const k = 2 * (cx * dx + cy * dy + s);
    const a = 1 - 2 * dx * dx;
    const b = -2 * dx * dy;
    const d = 1 - 2 * dy * dy;
    const matrix = `matrix(${a.toFixed(5)},${b.toFixed(5)},${b.toFixed(5)},${d.toFixed(5)},${(k * dx).toFixed(2)},${(k * dy).toFixed(2)})`;
    return {
        face,
        flap,
        matrix,
        max
    };
}
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

//# sourceMappingURL=src_1i3y2ue5w-cys._.js.map