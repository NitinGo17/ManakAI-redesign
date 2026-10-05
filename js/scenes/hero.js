/* ============================================================
   ManakAI — the hero scene.
   A full-bleed procedural WebGL field: an analytic four-sine
   contour field rolled by two crossed sine displacements, with a
   lattice of dots that light toward the cursor. No external
   assets, no libraries — one canvas, one context, one shader.
   ============================================================ */

const HERO_VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const HERO_FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform vec2  uRes;
uniform vec2  uPointer;     // NDC, y up
uniform float uTime;
uniform float uAspect;
uniform vec3  uGround;
uniform vec3  uLine;
uniform vec3  uAccent;
uniform vec3  uCopper;

/* Four sines at incommensurate frequencies, two of them diagonal —
   continuous everywhere, so every iso-line is one unbroken curve. */
float field(vec2 p, float t) {
  float f = sin(p.x * 1.00 + t * 0.60) * 0.50;
  f += sin(p.y * 0.85 - t * 0.45) * 0.45;
  f += sin((p.x + p.y) * 0.65 + t * 0.35) * 0.35;
  f += sin((p.x - p.y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
}

void main() {
  vec2 uv  = gl_FragCoord.xy / uRes;
  vec2 ndc = uv * 2.0 - 1.0;
  ndc.x *= uAspect;

  float t = uTime * 0.12;

  /* Two out-of-phase displacements — one per axis — so the field rolls. */
  vec2 p = ndc * 3.0;
  vec2 q = p;
  q.x += sin(p.y * 0.8 + t * 0.7) * 0.37;
  q.y += cos(p.x * 0.7 - t * 0.6) * 0.37;

  float scaled = field(q, t) * 2.5;
  float w = max(fwidth(scaled) * 1.4, 1e-4);
  float line = 1.0 - smoothstep(0.0, w, abs(fract(scaled) - 0.5));

  /* The lattice: a dot per cell, lit toward the cursor. */
  vec2 grid = (ndc * 0.5 + 0.5) * vec2(uAspect, 1.0) * 26.0;
  vec2 local = fract(grid) - 0.5;
  float dotd = length(local);
  float dot = 1.0 - smoothstep(0.055, 0.11, dotd);

  float pd = length(ndc - uPointer);
  float light = exp(-pd * pd * 3.2);
  float spread = exp(-pd * pd * 0.55);

  vec3 col = uGround;
  col = mix(col, uLine, line * 0.85);
  col = mix(col, uAccent, dot * (0.10 + 0.85 * light));
  col = mix(col, uCopper, dot * spread * 0.16);
  col = mix(col, uAccent, spread * 0.05);

  gl_FragColor = vec4(col, 1.0);
}
`;

function initHeroScene(canvas) {
  if (REDUCED) return null;
  const opts = { antialias: true, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' };
  const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
  if (!gl) return null;
  gl.getExtension('OES_standard_derivatives');

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, HERO_VERT);
  const fs = compile(gl.FRAGMENT_SHADER, HERO_FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uPointer = U('uPointer'), uTime = U('uTime'), uAspect = U('uAspect');
  const uGround = U('uGround'), uLine = U('uLine'), uAccent = U('uAccent'), uCopper = U('uCopper');

  const hex = (v) => {
    const s = (v || '').trim().replace('#', '');
    if (s.length !== 6) return [0, 0, 0];
    const n = parseInt(s, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const ground = hex(cssVar('--raw-pearl-50') || '#f6f7fb');
  const line = hex(cssVar('--raw-pearl-200') || '#dfe2ee');
  const accent = hex(cssVar('--raw-blue-600') || '#3155d9');
  const copper = hex(cssVar('--raw-copper-500') || '#d98b5f');
  gl.uniform3fv(uGround, ground);
  gl.uniform3fv(uLine, line);
  gl.uniform3fv(uAccent, accent);
  gl.uniform3fv(uCopper, copper);

  const pointer = { x: 0.25, y: 0.1, tx: 0.25, ty: 0.1 };
  let ratio = 1, w = 1, h = 1, started = false, ready = false, onReady = null;

  function resize() {
    const cap = window.matchMedia('(hover: none) and (pointer: coarse)').matches ? 1 : 2;
    ratio = Math.min(window.devicePixelRatio || 1, cap);
    w = Math.max(1, Math.round(canvas.clientWidth * ratio));
    h = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  Ticker.subscribe((time) => {
    if (!started) started = true;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.uniform1f(uTime, time / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) { ready = true; if (onReady) onReady(); }
  }, () => 0);

  return { onReady: (cb) => { onReady = cb; if (ready) cb(); } };
}
