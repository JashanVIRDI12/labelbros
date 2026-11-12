import {
  BackSide, BoxGeometry, CanvasTexture, Color, DoubleSide, Mesh, MeshBasicMaterial,
  PlaneGeometry, PMREMGenerator, Scene, Vector2,
  type MeshPhysicalMaterial, type Texture, type WebGLProgramParametersWithUniforms, type WebGLRenderer,
} from "three";

export type EffectSurface = "silver" | "gold" | "holo" | "glitter";
export const SURFACE_COLOUR = {
  silver: [225, 228, 232],
  gold: [235, 196, 112],
  holo: [226, 231, 237],
  glitter: [199, 192, 215],
} satisfies Record<EffectSurface, [number, number, number]>;

/** Neutral photographic softboxes with feathered edges and grey bounce cards. */
export function materialStudio(renderer: WebGLRenderer) {
  const room = new Scene();
  room.add(new Mesh(new BoxGeometry(30, 30, 30), new MeshBasicMaterial({ color: new Color(0.19, 0.20, 0.22), side: BackSide })));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const g = canvas.getContext("2d")!;
  const gradient = g.createRadialGradient(64, 64, 18, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.96)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  const softbox = new CanvasTexture(canvas);
  const card = (w: number, h: number, brightness: number, position: [number, number, number], roll = 0) => {
    const mesh = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: softbox, color: new Color(brightness, brightness, brightness), transparent: true, depthWrite: false, side: DoubleSide }));
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(roll);
    room.add(mesh);
  };
  card(4.5, 12, 3.2, [-2.5, 5, 8], -0.32);
  card(3, 10, 1.8, [5, 4, 7], -0.32);
  card(12, 6, 0.8, [0, -6, 7]);
  card(10, 5, 1.2, [1, 10, 3]);
  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.04, 0.1, 100, { size: 256 });
  pmrem.dispose();
  softbox.dispose();
  room.traverse((o) => {
    if (o instanceof Mesh) { o.geometry.dispose(); o.material.dispose(); }
  });
  return target;
}

export function configureSurface(m: MeshPhysicalMaterial, look: EffectSurface, matte = false) {
  // Anisotropy also supplies a tangent frame for the flake shader, without a bumpy normal map.
  m.anisotropy = look === "glitter" ? 0.001 : look === "holo" ? 0.12 : matte ? 0.48 : 0.32;
  m.anisotropyRotation = Math.PI / 2;
  m.normalMap = null;
  m.envMapIntensity = look === "glitter" ? 0.9 : 0.8;
  m.specularIntensity = 0.65;
  m.clearcoat = matte ? 0.03 : look === "glitter" ? 0.3 : 0.18;
  m.clearcoatRoughness = matte ? 0.48 : 0.22;
  if (look === "glitter") { m.metalness = 0.86; m.iridescence = 0; }
}

const SURFACE_HEAD = /* glsl */ `
uniform sampler2D uSubstrateMask;
uniform vec2 uSubstrateSize;
vec2 lbHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
`;

/** The same physical surface on the home showcase and the customer's uploaded label. */
export function patchSurface(sh: WebGLProgramParametersWithUniforms, look: EffectSurface, mask: Texture, w: number, h: number) {
  sh.uniforms.uSubstrateMask = { value: mask };
  sh.uniforms.uSubstrateSize = { value: new Vector2(w, h) };
  const glitter = look === "glitter";
  sh.fragmentShader = sh.fragmentShader
    .replace("#include <common>", `#include <common>\n${SURFACE_HEAD}`)
    .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      float lbBare = gl_FrontFacing ? texture2D(uSubstrateMask, vMapUv).r : 0.0;
      ${glitter ? /* glsl */ `
        // Irregular microscopic facets, with no circular rims or repeated dot grid.
        vec2 lbP = vMapUv * uSubstrateSize * 135.0;
        vec2 lbCell = floor(lbP);
        vec2 lbF = fract(lbP);
        vec2 lbId = lbCell;
        float lbClosest = 9.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 cell = vec2(float(i), float(j));
            vec2 delta = cell + 0.1 + lbHash(lbCell + cell) * 0.8 - lbF;
            float d = dot(delta, delta);
            if (d < lbClosest) { lbClosest = d; lbId = lbCell + cell; }
          }
        }
        vec2 lbFacet = lbHash(lbId + 17.7);
        float lbResolved = 1.0 - smoothstep(0.8, 2.5, max(length(dFdx(lbP)), length(dFdy(lbP))));
        vec3 lbFlakeNormal = normalize(vec3((lbFacet - 0.5) * 1.35, 1.0));
        normal = normalize(mix(normal, tbn * lbFlakeNormal, lbBare * lbResolved));
        float lbValue = mix(0.55, 1.25, lbHash(lbId + 83.1).x);
        vec3 lbTint = mix(vec3(0.89, 0.94, 1.0), vec3(1.0, 0.96, 0.89), lbFacet.x);
        diffuseColor.rgb *= mix(vec3(1.0), lbTint * lbValue, lbBare * lbResolved);
      ` : /* glsl */ `
        // A film's very slight lay introduces a broad reflection, without ridges or dents.
        vec2 lbP = vMapUv * uSubstrateSize;
        vec2 lbLay = vec2(sin(lbP.x * 1.3 + lbP.y * 0.6), cos(lbP.y * 1.6 - lbP.x * 0.4)) * 0.025;
        normal = normalize(mix(normal, tbn * normalize(vec3(lbLay, 1.0)), lbBare));
      `}
    `)
    .replace("#include <lights_fragment_end>", `#include <lights_fragment_end>
      // The small key lights the ink; the foil reflects the large studio softboxes.
      reflectedLight.directSpecular *= mix(1.0, ${glitter ? "0.8" : "0.22"}, lbBare);
      #ifdef USE_CLEARCOAT
        clearcoatSpecularDirect *= 0.3;
      #endif
    `);
}
