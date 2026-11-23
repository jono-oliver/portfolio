// Folded-paper background: a few long creases split the hero into gently
// tilted facets. The cursor acts as a light source (a slow drifting light
// when idle / on touch), so facets brighten or darken and crease edges
// catch a thin highlight. Drawn as translucent light/shadow over the page,
// so it works in both themes without reading any colours.
//
// Usage: const destroy = initFoldedPaper(canvas, host)

// Creases as a point the line passes through (x as a share of the width,
// y as a share of the height) and an angle in degrees. `amp` is how far the
// facets either side tilt: alternating signs make valley and mountain folds.
const CREASES = [
  { x: 0.18, y: 0.0, angle: 64, amp: 0.16 },
  { x: 0.62, y: 1.0, angle: -72, amp: -0.14 },
  { x: 0.0, y: 0.58, angle: 9, amp: 0.12 },
  { x: 0.86, y: 0.0, angle: 118, amp: -0.15 },
  { x: 0.45, y: 0.32, angle: 28, amp: 0.1 },
];

const STRENGTH_DARK = 0.07; // max opacity of light/shadow in dark mode
const STRENGTH_LIGHT = 0.05; // shadows read stronger on light paper
const HIGHLIGHT = 0.45; // brightness of lit facets relative to shadows (1 = equal)
const FOLLOW = 0.06; // how quickly the light catches the cursor
const IDLE_AFTER = 2500;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform vec2 uLight;          // light position in pixels (y up)
uniform vec3 uCrease[5];      // xy = unit normal, z = offset (pixels)
uniform float uAmp[5];
uniform float uStrength;
uniform float uHighlight;     // scales lit facets only, so shadows keep the folds
uniform float uFold;          // softness of a fold, in pixels

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 n = vec3(0.0, 0.0, 1.0);
  float edge = 0.0;

  for (int i = 0; i < 5; i++) {
    float s = dot(uCrease[i].xy, p) - uCrease[i].z;    // signed distance
    float side = smoothstep(-uFold, uFold, s) * 2.0 - 1.0;
    n.xy += uCrease[i].xy * side * uAmp[i];
    // thin ridge right on the crease line
    edge += exp(-(s * s) / (uFold * uFold * 0.5)) * sign(uAmp[i]) * sign(s);
  }
  n = normalize(n);

  // Light hovers a little above the page at the cursor
  vec3 L = normalize(vec3(uLight - p, uRes.y * 0.6));
  vec3 flatL = normalize(vec3(uLight - p, uRes.y * 0.6));
  float shade = dot(n, L) - dot(vec3(0.0, 0.0, 1.0), flatL);
  shade = shade * 6.0 + edge * 0.35;
  shade = clamp(shade, -1.0, 1.0);

  // Positive = light (white), negative = shadow (black); premultiplied alpha
  float a = abs(shade) * uStrength * (shade > 0.0 ? uHighlight : 1.0);
  vec3 c = shade > 0.0 ? vec3(1.0) : vec3(0.0);
  gl_FragColor = vec4(c * a, a);
}
`;

export function initFoldedPaper(canvas, host) {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  });
  if (!gl) return () => {}; // no WebGL: page is fine without it

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
  gl.useProgram(prog);

  // One triangle that covers the whole canvas
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(prog, name);
  const uRes = u("uRes"),
    uLight = u("uLight"),
    uCrease = u("uCrease"),
    uAmp = u("uAmp"),
    uStrength = u("uStrength"),
    uFold = u("uFold"),
    uHighlight = u("uHighlight");

  let W = 1,
    H = 1;
  const light = { x: 0, y: 0, tx: 0, ty: 0 };

  const setStrength = () => {
    gl.uniform1f(uHighlight, HIGHLIGHT);
    gl.uniform1f(
      uStrength,
      document.documentElement.classList.contains("dark")
        ? STRENGTH_DARK
        : STRENGTH_LIGHT,
    );
  };

  const layout = () => {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uFold, 1.5 * dpr);

    // Crease lines in device pixels, y up (WebGL's origin is bottom-left)
    const creases = [];
    CREASES.forEach((c) => {
      const a = (c.angle * Math.PI) / 180;
      const nx = -Math.sin(a),
        ny = Math.cos(a);
      const px = c.x * canvas.width,
        py = (1 - c.y) * canvas.height;
      creases.push(nx, ny, nx * px + ny * py);
    });
    gl.uniform3fv(uCrease, creases);
    gl.uniform1fv(
      uAmp,
      CREASES.map((c) => c.amp),
    );

    if (!light.x && !light.y) {
      light.x = light.tx = W * 0.7;
      light.y = light.ty = H * 0.3;
    }
    setStrength();
    draw();
  };

  const draw = () => {
    gl.uniform2f(uLight, light.x * dpr, (H - light.y) * dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // ---- Pointer / idle drift ----
  let lastPointer = -Infinity;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    light.tx = e.clientX - r.left;
    light.ty = e.clientY - r.top;
    lastPointer = performance.now();
  };
  const onLeave = () => (lastPointer = -Infinity);

  let raf = 0;
  let running = false;
  const t0 = performance.now();

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (now - lastPointer > IDLE_AFTER) {
      const t = (now - t0) / 1000;
      light.tx = W * (0.5 + 0.4 * Math.sin(t * 0.09));
      light.ty = H * (0.4 + 0.3 * Math.cos(t * 0.13));
    }
    const dx = light.tx - light.x;
    const dy = light.ty - light.y;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return;
    light.x += dx * FOLLOW;
    light.y += dy * FOLLOW;
    draw();
  };

  const start = () => {
    if (running || reduceMotion) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  layout();

  if (!reduceMotion) {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
  }

  // Only animate while on screen and the tab is visible
  let inView = false;
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    inView && !document.hidden ? start() : stop();
  });
  io.observe(canvas);
  const onVisibility = () => (inView && !document.hidden ? start() : stop());
  document.addEventListener("visibilitychange", onVisibility);

  let resizeTimer = 0;
  let lastW = W;
  const ro = new ResizeObserver(() => {
    const w = canvas.getBoundingClientRect().width;
    if (Math.abs(w - lastW) < 2) return; // ignore mobile URL-bar jitter
    lastW = w;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });
  ro.observe(canvas);

  // Follow the light/dark toggle
  const mo = new MutationObserver(() => {
    setStrength();
    draw();
  });
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    clearTimeout(resizeTimer);
    document.removeEventListener("visibilitychange", onVisibility);
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
  };
}
