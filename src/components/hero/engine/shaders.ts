/*
 * Sticker material. The vertex shader peels the sticker: every point between the support line
 * (the outermost edge in the peel direction) and the fold line wraps round a small cylinder,
 * then continues straight, so the flap lifts and shows its paper back.
 */
export const stickerVertex = /* glsl */ `
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

export const stickerFragment = /* glsl */ `
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

export const shadowVertex = /* glsl */ `
  uniform vec2 uExpand;
  varying vec2 vUv;
  void main() {
    vUv = (uv - 0.5) * uExpand + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const shadowFragment = /* glsl */ `
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
