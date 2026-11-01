(()=>{"use strict";module.exports = [
"[project]/src/components/sections/pricing-motion.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "create",
    ()=>create
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gsap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gsap.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/index.js [app-ssr] (ecmascript) <locals> <export default as gsap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$MorphSVGPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/gsap@3.15.0/node_modules/gsap/MorphSVGPlugin.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$pricing$2d$model$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/sections/pricing-model.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].registerPlugin(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$MorphSVGPlugin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MorphSVGPlugin"]);
/*
 * The pricing preview's motion. Shape changes morph (travel: power2.inOut), the sticker lifts
 * and slaps back down on every change, new copies in the stack slap on one after another, and
 * gloss sends a sheen across. Reduced motion: the same states, set instantly.
 */ const TRAVEL = 0.7;
function create(svg, reduce) {
    const $ = (s)=>svg.querySelector(s);
    const outer = $("#q-outer");
    const inner = $("[data-inner]");
    const art = $("[data-art]");
    const scaler = $("[data-scale]");
    const lift = $("[data-lift]");
    const shadow = $("[data-shadow]");
    const copies = [
        ...svg.querySelectorAll("[data-copy]")
    ].sort((a, b)=>Number(a.dataset.copy) - Number(b.dataset.copy));
    const foil = $("[data-foil]");
    const matte = $("[data-matte]");
    const sheen = $("[data-sheen]");
    const dimH = $("[data-dim-h]");
    const dimV = $("[data-dim-v]");
    const dimHLabel = $("[data-dim-h-label]");
    const dimVLabel = $("[data-dim-v-label]");
    const ctx = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].context(()=>{});
    let prev = null;
    const d = (t)=>reduce ? 0 : t;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(art, {
        svgOrigin: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$pricing$2d$model$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CX"]} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$pricing$2d$model$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CY"]}`
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(scaler, {
        svgOrigin: "0 0"
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].set(sheen, {
        x: -80
    });
    const sheenX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].quickTo(sheen, "x", {
        duration: 0.6,
        ease: "power3.out"
    });
    const sweep = ()=>{
        if (reduce) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].fromTo(sheen, {
            x: -120
        }, {
            x: 330,
            duration: 0.9,
            ease: "power2.inOut",
            overwrite: "auto"
        });
    };
    function update(v) {
        ctx.add(()=>{
            const first = prev === null;
            const changed = (k)=>!prev || prev[k] !== v[k];
            if (changed("outer")) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(outer, {
                    morphSVG: v.outer,
                    duration: d(TRAVEL),
                    ease: "power2.inOut",
                    overwrite: true
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(inner, {
                    morphSVG: v.inner,
                    duration: d(TRAVEL),
                    ease: "power2.inOut",
                    overwrite: "auto"
                });
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(inner, {
                opacity: v.innerOn ? 1 : 0,
                duration: d(0.35),
                ease: "power2.inOut"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(art, {
                scale: v.art,
                duration: d(TRAVEL),
                ease: "power2.inOut",
                overwrite: "auto"
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(scaler, {
                scale: v.k,
                duration: d(TRAVEL),
                ease: "power2.inOut",
                overwrite: "auto"
            });
            // measuring lines follow the sticker's edges
            const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$sections$2f$pricing$2d$model$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dimsFor"])(v);
            const lines = {
                duration: d(TRAVEL),
                ease: "power2.inOut",
                overwrite: "auto"
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(dimH, {
                attr: {
                    x1: m.h.x1,
                    x2: m.h.x2,
                    y1: m.h.y,
                    y2: m.h.y
                },
                ...lines
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(dimV, {
                attr: {
                    x1: m.v.x,
                    x2: m.v.x,
                    y1: m.v.y1,
                    y2: m.v.y2
                },
                ...lines
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(dimHLabel, {
                x: (m.h.x1 + m.h.x2) / 2,
                y: m.h.y - 10,
                ...lines
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(dimVLabel, {
                x: m.v.x - 10,
                y: (m.v.y1 + m.v.y2) / 2,
                ...lines
            });
            // the stack: more copies for bigger runs, each one slapping down on the pile
            copies.forEach((c, i)=>{
                const on = i < v.copies;
                const was = prev ? i < prev.copies : on;
                if (on && !was) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].fromTo(c, {
                        opacity: 0,
                        y: -26
                    }, {
                        opacity: 1,
                        y: 0,
                        duration: d(0.42),
                        ease: "slap",
                        delay: reduce ? 0 : (i - (prev?.copies ?? 0)) * 0.08
                    });
                } else if (!on && was) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(c, {
                        opacity: 0,
                        duration: d(0.25),
                        ease: "power2.inOut"
                    });
                }
            });
            // finish
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(foil, {
                opacity: v.finish === "holo" ? 0.85 : 0,
                duration: d(0.4)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(matte, {
                opacity: v.finish === "matte" ? 0.12 : 0,
                duration: d(0.4)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].to(sheen, {
                opacity: v.finish === "matte" ? 0 : v.finish === "holo" ? 0.6 : 0.5,
                duration: d(0.3)
            });
            if (!first && v.finish !== "matte" && (changed("finish") || changed("outer"))) sweep();
            // every change: the sticker lifts and slaps back onto the mat
            if (!first && !reduce) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline().to(lift, {
                    y: -12,
                    duration: 0.18,
                    ease: "power2.out"
                }).to(lift, {
                    y: 0,
                    duration: 0.34,
                    ease: "slap"
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].timeline().to(shadow, {
                    opacity: 0.22,
                    attr: {
                        transform: "translate(10 26)"
                    },
                    duration: 0.18,
                    ease: "power2.out"
                }).to(shadow, {
                    opacity: 0.4,
                    attr: {
                        transform: "translate(6 14)"
                    },
                    duration: 0.34,
                    ease: "slap"
                });
            }
            prev = v;
        });
    }
    return {
        update,
        /** pointer across the preview, 0..1: the sheen follows it */ pointer (x) {
            if (!reduce) sheenX(-120 + x * 450);
        },
        destroy () {
            ctx.revert();
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$gsap$40$3$2e$15$2e$0$2f$node_modules$2f$gsap$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__gsap$3e$__["gsap"].killTweensOf([
                outer,
                inner,
                art,
                scaler,
                lift,
                shadow,
                ...copies,
                foil,
                matte,
                sheen,
                dimH,
                dimV,
                dimHLabel,
                dimVLabel
            ]);
        }
    };
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

//# sourceMappingURL=src_1n-z8urah8byb._.js.map