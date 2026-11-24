/**
 * pull-chain-scene.ts
 * A steel ball chain hanging from the top of the hero with an edge-lit acrylic tag on
 * the end, like the pull switch on a lamp. Drag the tag around; pull it down past the
 * chain's reach and the switch clicks, which toggles the particle field.
 *
 * Loaded with a dynamic import() from pull-chain.tsx, so three.js stays out of the
 * first-load bundle. Framework-free: the component owns the ticker and the resize.
 *
 * Physics is hand-rolled Verlet: one pinned anchor, a chain of point masses, and the tag
 * as a rigid triangle (hole H, bottom corners L and R) whose frame gives its 3D pose.
 * World units: the tag is TH tall; the camera is placed so that maps to `tagPx` pixels.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type PullChainOptions = {
  canvas: HTMLCanvasElement;
  /** Invisible element kept over the tag; the only part of the scene that takes pointers. */
  handle: HTMLElement;
  fonts: { display: string; mono: string };
  content: { initials: string; name: string; role: string; place: string };
  colors: { ink2: string; line: string; bone: string; mute: string; neon: string };
  /** Called when the switch clicks. `stopped` is the new state of the field. */
  onToggle: (stopped: boolean) => void;
};

export type PullChain = {
  resize: (width: number, height: number) => void;
  tick: (dtSeconds: number) => void;
  destroy: () => void;
};

// Tag, in world units. H (the hole) is the local origin; the tag's top edge is HOLE_TOP above it.
const TW = 1.0;
const TH = 1.55;
const TD = 0.05;
const HOLE_TOP = 0.16;
const HOLE_R = 0.065;
const CORNER = 0.16;

const SEG = 12; // chain point masses
const CLIP = 0.12; // last chain point -> hole
const BEAD_R = 0.024;
const BEAD_GAP = 0.062;
const MAX_BEADS = 160;

const DT = 1 / 120;
const ITER = 18;
const GRAV = new THREE.Vector3(0, -16, 0);
const MAX_STEP = 0.12; // per-step speed cap: a hard flick stays on screen
const TRAVEL = 0.34; // how far the anchor gives when pulled
const TRIGGER = 0.24; // pull distance that clicks the switch
const REARM = 0.06;

type Pt = { p: THREE.Vector3; o: THREE.Vector3; im: number };

export async function createPullChain(opts: PullChainOptions): Promise<PullChain> {
  const { canvas, handle, fonts, content, colors } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a0b, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(3, 4, 6);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

  await Promise.all(
    [`700 64px ${fonts.display}`, `500 52px ${fonts.display}`, `500 30px ${fonts.mono}`].map((f) =>
      document.fonts.load(f).catch(() => []),
    ),
  );

  /* ---------- tag ---------- */
  let stopped = false;
  const TEX_W = 512;
  const TEX_H = Math.round((TEX_W * TH) / TW);
  const holeY = (HOLE_TOP / TH) * TEX_H;
  const holePx = (HOLE_R / TW) * TEX_W;

  const faceTex = (draw: (g: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // ShapeGeometry UVs are raw shape coordinates; map the tag's extent onto 0..1.
    t.repeat.set(1 / TW, 1 / TH);
    t.offset.set(0.5, (TH - HOLE_TOP) / TH);
    const redraw = () => {
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, TEX_W, TEX_H);
      g.fillStyle = colors.ink2;
      g.fillRect(0, 0, TEX_W, TEX_H);
      g.strokeStyle = colors.line;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(TEX_W / 2, holeY, holePx + 10, 0, Math.PI * 2);
      g.stroke();
      draw(g);
      t.needsUpdate = true;
    };
    return { t, redraw };
  };

  const mono = (g: CanvasRenderingContext2D, size: number, color: string) => {
    g.font = `500 ${size}px ${fonts.mono}`;
    g.fillStyle = color;
    g.letterSpacing = "0.15em";
  };

  const front = faceTex((g) => {
    g.textAlign = "center";
    mono(g, 30, colors.mute);
    g.fillText("PULL", TEX_W / 2, 190);
    const cy = 360;
    if (stopped) {
      g.strokeStyle = colors.mute;
      g.lineWidth = 6;
      g.beginPath();
      g.arc(TEX_W / 2, cy, 66, 0, Math.PI * 2);
      g.stroke();
    } else {
      g.shadowColor = colors.neon;
      g.shadowBlur = 40;
      g.fillStyle = colors.neon;
      g.beginPath();
      g.arc(TEX_W / 2, cy, 66, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
    }
    mono(g, 26, stopped ? colors.mute : colors.bone);
    g.fillText(stopped ? "FIELD OFF" : "FIELD ON", TEX_W / 2, 500);
    g.fillStyle = colors.line;
    g.fillRect(44, 572, TEX_W - 88, 2);
    g.textAlign = "left";
    g.letterSpacing = "0px";
    g.font = `700 64px ${fonts.display}`;
    g.fillStyle = colors.bone;
    g.fillText(content.initials, 44, 690);
    g.textAlign = "right";
    mono(g, 20, colors.mute);
    g.fillText(content.role.toUpperCase(), TEX_W - 44, 680);
  });

  const back = faceTex((g) => {
    g.letterSpacing = "0px";
    g.font = `500 52px ${fonts.display}`;
    g.fillStyle = colors.bone;
    content.name.split(" ").forEach((word, i) => g.fillText(word, 44, 330 + i * 60));
    mono(g, 20, colors.mute);
    g.fillText(content.role.toUpperCase(), 44, 470);
    g.fillText(content.place.toUpperCase(), 44, 690);
  });
  front.redraw();
  back.redraw();

  const shape = new THREE.Shape();
  {
    const x0 = -TW / 2, x1 = TW / 2, y0 = -(TH - HOLE_TOP), y1 = HOLE_TOP, r = CORNER;
    shape.moveTo(x0 + r, y0);
    shape.lineTo(x1 - r, y0);
    shape.quadraticCurveTo(x1, y0, x1, y0 + r);
    shape.lineTo(x1, y1 - r);
    shape.quadraticCurveTo(x1, y1, x1 - r, y1);
    shape.lineTo(x0 + r, y1);
    shape.quadraticCurveTo(x0, y1, x0, y1 - r);
    shape.lineTo(x0, y0 + r);
    shape.quadraticCurveTo(x0, y0, x0 + r, y0);
    const hole = new THREE.Path();
    hole.absarc(0, 0, HOLE_R, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const BEVEL = 0.012;
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: TD,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 10,
  });
  bodyGeo.translate(0, 0, -TD / 2);
  // Edge-lit acrylic: the rim glows neon while the field runs and dims when it's stopped.
  const edgeMat = new THREE.MeshStandardMaterial({
    color: colors.ink2,
    roughness: 0.25,
    emissive: new THREE.Color(colors.neon),
    emissiveIntensity: 0.9,
  });
  const faceMat = (map: THREE.Texture) =>
    new THREE.MeshStandardMaterial({
      map,
      emissiveMap: map,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      roughness: 0.35,
      envMapIntensity: 0.15,
    });
  const faceZ = TD / 2 + BEVEL + 0.002;
  const frontGeo = new THREE.ShapeGeometry(shape, 10).translate(0, 0, faceZ);
  const backGeo = new THREE.ShapeGeometry(shape, 10).translate(0, 0, faceZ).rotateY(Math.PI);
  const tag = new THREE.Group();
  const body = new THREE.Mesh(bodyGeo, edgeMat);
  tag.add(body, new THREE.Mesh(frontGeo, faceMat(front.t)), new THREE.Mesh(backGeo, faceMat(back.t)));
  scene.add(tag);

  const steel = new THREE.MeshStandardMaterial({ color: 0xc9c9cf, metalness: 1, roughness: 0.25 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.011, 10, 36), steel);
  scene.add(ring);
  const beadGeo = new THREE.SphereGeometry(BEAD_R, 12, 8);
  const beads = new THREE.InstancedMesh(beadGeo, steel, MAX_BEADS);
  beads.frustumCulled = false;
  scene.add(beads);

  /* ---------- physics ---------- */
  const P: Pt[] = [];
  const add = (im: number) => P.push({ p: new THREE.Vector3(), o: new THREE.Vector3(), im }) - 1;
  add(0);
  for (let i = 0; i < SEG; i++) add(1);
  const iH = add(0.3), iL = add(0.3), iR = add(0.3);
  const DIAG = Math.hypot(TW / 2, TH - HOLE_TOP);
  let segL = 0.15;
  const cons: [number, number, number | "seg"][] = [];
  for (let i = 0; i < SEG; i++) cons.push([i, i + 1, "seg"]);
  cons.push([SEG, iH, CLIP], [iH, iL, DIAG], [iH, iR, DIAG], [iL, iR, TW]);

  const anchorRest = new THREE.Vector3();
  let anchorDrop = 0;
  let ropeReach = 0;

  const xAx = new THREE.Vector3(), yAx = new THREE.Vector3(), zAx = new THREE.Vector3();
  const mid = new THREE.Vector3(), d = new THREE.Vector3(), v = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const frame = () => {
    const H = P[iH].p, L = P[iL].p, R = P[iR].p;
    mid.addVectors(L, R).multiplyScalar(0.5);
    yAx.subVectors(H, mid).normalize();
    xAx.subVectors(R, L);
    xAx.addScaledVector(yAx, -xAx.dot(yAx)).normalize();
    zAx.crossVectors(xAx, yAx);
  };

  const grab = {
    active: false,
    w: [0, 0, 0] as [number, number, number],
    local: new THREE.Vector2(),
    target: new THREE.Vector3(),
  };
  let armed = true;

  const solve = (a: number, b: number, len: number) => {
    const A = P[a], B = P[b], w = A.im + B.im;
    if (!w) return;
    d.subVectors(B.p, A.p);
    const dist = d.length() || 1e-6;
    const k = (dist - len) / (dist * w);
    A.p.addScaledVector(d, k * A.im);
    B.p.addScaledVector(d, -k * B.im);
  };

  let calm = 0;
  let asleep = false;
  const wake = () => {
    asleep = false;
    calm = 0;
  };

  // The switch: past full reach the anchor gives a little, and past TRIGGER it clicks.
  // Checked on every pointer move as well as every step, so a flick shorter than one
  // frame still counts.
  let pull = 0;
  const checkPull = () => {
    if (!grab.active) {
      pull = 0;
      return;
    }
    const reach = ropeReach + Math.hypot(grab.local.x, grab.local.y);
    pull = Math.max(0, anchorRest.distanceTo(grab.target) - reach);
    if (armed && pull > TRIGGER) {
      armed = false;
      stopped = !stopped;
      front.redraw();
      edgeMat.emissiveIntensity = stopped ? 0.12 : 0.9;
      opts.onToggle(stopped);
    } else if (!armed && pull < REARM) armed = true;
  };

  const step = () => {
    checkPull();
    anchorDrop += (Math.min(pull, TRAVEL) - anchorDrop) * 0.35;
    P[0].p.copy(anchorRest).y -= anchorDrop;

    const damp = grab.active ? 0.96 : 0.992;
    let moving = 0;
    for (const pt of P) {
      if (!pt.im) continue;
      v.subVectors(pt.p, pt.o).multiplyScalar(damp).clampLength(0, MAX_STEP);
      moving = Math.max(moving, v.lengthSq());
      pt.o.copy(pt.p);
      pt.p.add(v).addScaledVector(GRAV, DT * DT);
    }
    const H = P[iH].p, L = P[iL].p, R = P[iR].p;
    for (let it = 0; it < ITER; it++) {
      for (const [a, b, len] of cons) solve(a, b, len === "seg" ? segL : len);
      if (grab.active) {
        const [wH, wL, wR] = grab.w;
        d.set(0, 0, 0).addScaledVector(H, wH).addScaledVector(L, wL).addScaledVector(R, wR).sub(grab.target);
        const s = 0.5 / (wH * wH + wL * wL + wR * wR);
        H.addScaledVector(d, -s * wH);
        L.addScaledVector(d, -s * wL);
        R.addScaledVector(d, -s * wR);
      }
    }
    const tw = (R.z - L.z) * 0.012; // yaw spring: the tag drifts back to facing the viewer
    L.z += tw;
    R.z -= tw;

    calm = !grab.active && moving < 1e-9 && anchorDrop < 1e-4 ? calm + 1 : 0;
    if (calm > 120) asleep = true;
  };

  /* ---------- sizing ---------- */
  let W = 1, Hpx = 1, ppu = 100;
  const toWorld = (x: number, y: number, out: THREE.Vector3) =>
    out.set((x - W / 2) / ppu, (Hpx / 2 - y) / ppu, 0);

  const initPose = () => {
    // Everything stacked above the anchor, so the tag drops in on load.
    for (let i = 1; i <= SEG; i++) P[i].p.copy(anchorRest).add(new THREE.Vector3(0.02 * i, segL * i, 0));
    const top = P[SEG].p;
    const Hp = P[iH].p.copy(top).add(new THREE.Vector3(0.1, CLIP + TH, 0));
    P[iL].p.set(Hp.x - TW / 2, Hp.y - (TH - HOLE_TOP), 0);
    P[iR].p.set(Hp.x + TW / 2, Hp.y - (TH - HOLE_TOP), 0);
    for (const pt of P) pt.o.copy(pt.p);
    P[iL].o.z -= 0.02;
  };
  let posed = false;

  const resize = (width: number, height: number) => {
    W = Math.max(1, width);
    Hpx = Math.max(1, height);
    const mobile = W < 768;
    const tagPx = mobile ? 150 : Math.min(230, Hpx * 0.3);
    ppu = tagPx / TH;
    renderer.setSize(W, Hpx, false);
    camera.aspect = W / Hpx;
    camera.position.set(0, 0, Hpx / 2 / ppu / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();

    // Hole sits clear of the header; the tag stays above the headline rows.
    const holePxY = Math.min(Math.max(Hpx * 0.16, 104), 190);
    const tagWpx = TW * ppu;
    const xPx = mobile ? W - 24 - tagWpx / 2 : W * 0.85;
    const prev = anchorRest.clone();
    toWorld(xPx, -0.5 * ppu, anchorRest);
    const hole = toWorld(xPx, holePxY, new THREE.Vector3());
    ropeReach = anchorRest.distanceTo(hole);
    segL = (ropeReach - CLIP) / SEG;
    if (!posed) {
      initPose();
      posed = true;
    } else {
      // Keep the chain where it was relative to the moved anchor.
      d.subVectors(anchorRest, prev);
      for (const pt of P) {
        pt.p.add(d);
        pt.o.add(d);
      }
    }
    wake();
  };

  /* ---------- pointer ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const setRay = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  };
  const onDown = (e: PointerEvent) => {
    setRay(e);
    const hit = ray.intersectObject(tag, true)[0];
    if (!hit) return;
    e.preventDefault();
    frame();
    d.subVectors(hit.point, P[iH].p);
    const u = d.dot(xAx), w = d.dot(yAx);
    const h = TH - HOLE_TOP;
    grab.w = [1 + w / h, -u / TW - w / (2 * h), u / TW - w / (2 * h)];
    grab.local.set(u, w);
    grab.target.copy(hit.point);
    plane.constant = -hit.point.z;
    grab.active = true;
    handle.setPointerCapture(e.pointerId);
    handle.style.cursor = "grabbing";
    wake();
  };
  const onMove = (e: PointerEvent) => {
    if (!grab.active) return;
    setRay(e);
    ray.ray.intersectPlane(plane, grab.target);
    checkPull();
  };
  const onUp = () => {
    grab.active = false;
    armed = true;
    handle.style.cursor = "";
  };
  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);

  /* ---------- per frame ---------- */
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: SEG + 2 }, () => new THREE.Vector3()),
    false,
    "centripetal",
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const ringTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  const corner = new THREE.Vector3();
  const box = { x0: 0, y0: 0, x1: 0, y1: 0 };
  const CORNERS: [number, number][] = [
    [-TW / 2, HOLE_TOP],
    [TW / 2, HOLE_TOP],
    [-TW / 2, -(TH - HOLE_TOP)],
    [TW / 2, -(TH - HOLE_TOP)],
  ];

  const sync = () => {
    frame();
    const H = P[iH].p;
    basis.makeBasis(xAx, yAx, zAx);
    tag.quaternion.setFromRotationMatrix(basis);
    tag.position.copy(H);
    ring.quaternion.copy(tag.quaternion).multiply(ringTurn);
    ring.position.copy(H).addScaledVector(yAx, 0.045);

    for (let i = 0; i <= SEG; i++) curve.points[i].copy(P[i].p);
    curve.points[SEG + 1].copy(H).addScaledVector(yAx, 0.12);
    curve.updateArcLengths();
    const len = curve.getLength();
    const n = Math.min(MAX_BEADS, Math.floor(len / BEAD_GAP) + 1);
    for (let i = 0; i < n; i++) {
      curve.getPointAt(Math.min(1, (i * BEAD_GAP) / len), v);
      beads.setMatrixAt(i, m4.compose(v, q, corner.set(1, 1, 1)));
    }
    beads.count = n;
    beads.instanceMatrix.needsUpdate = true;

    // Keep the grab handle over the tag's on-screen bounding box.
    box.x0 = box.y0 = Infinity;
    box.x1 = box.y1 = -Infinity;
    for (const [cx, cy] of CORNERS) {
      corner.copy(H).addScaledVector(xAx, cx).addScaledVector(yAx, cy).project(camera);
      const sx = ((corner.x + 1) / 2) * W, sy = ((1 - corner.y) / 2) * Hpx;
      box.x0 = Math.min(box.x0, sx);
      box.x1 = Math.max(box.x1, sx);
      box.y0 = Math.min(box.y0, sy);
      box.y1 = Math.max(box.y1, sy);
    }
    handle.style.transform = `translate(${box.x0 - 6}px, ${box.y0 - 6}px)`;
    handle.style.width = `${box.x1 - box.x0 + 12}px`;
    handle.style.height = `${box.y1 - box.y0 + 12}px`;
    handle.style.display = "block";
  };

  let acc = 0;
  const tick = (dt: number) => {
    if (asleep) return;
    acc += Math.min(dt, 0.05);
    while (acc >= DT) {
      step();
      acc -= DT;
    }
    sync();
    renderer.render(scene, camera);
  };

  const destroy = () => {
    handle.removeEventListener("pointerdown", onDown);
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onUp);
    handle.removeEventListener("pointercancel", onUp);
    handle.style.display = "none";
    [bodyGeo, frontGeo, backGeo, beadGeo, ring.geometry].forEach((g) => g.dispose());
    tag.traverse((o) => {
      if (o instanceof THREE.Mesh) (o.material as THREE.Material).dispose();
    });
    front.t.dispose();
    back.t.dispose();
    steel.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { resize, tick, destroy };
}
