"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ── Helpers ──────────────────────────────────────────────────────────────────

function pts(...coords: number[][]): THREE.Vector3[] {
  return coords.map(([x, y]) => new THREE.Vector3(x, y, 0));
}

function arcPts(cx: number, cy: number, r: number, from: number, to: number, segs = 24): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = from + (to - from) * (i / segs);
    out.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
  }
  return out;
}

function circlePts(cx: number, cy: number, r: number, segs = 32): THREE.Vector3[] {
  return arcPts(cx, cy, r, 0, Math.PI * 2, segs);
}

function makeLines(groups: THREE.Vector3[][], mat: THREE.LineBasicMaterial): THREE.Line[] {
  return groups.map(g => new THREE.Line(new THREE.BufferGeometry().setFromPoints(g), mat));
}

// ── Formas temáticas ──────────────────────────────────────────────────────────

/** Llave simple */
function makeKey(): THREE.Vector3[][] {
  const P = Math.PI;
  return [
    // mango circular
    circlePts(0, 0, 0.38),
    // agujero interior del mango
    circlePts(0, 0, 0.18),
    // caña de la llave
    pts([0.38, 0], [1.15, 0]),
    // dientes
    pts([0.75, 0], [0.75, -0.20]),
    pts([0.98, 0], [0.98, -0.14]),
  ];
}

/** Candado cerrado */
function makePadlock(): THREE.Vector3[][] {
  const W = 0.50, H = 0.40, R = 0.22;
  return [
    // cuerpo
    pts([-W/2, 0], [-W/2, -H], [W/2, -H], [W/2, 0]),
    // arco superior
    arcPts(0, 0, R, Math.PI, 0, 28),
    // línea horizontal del cuerpo superior
    pts([-W/2, 0], [W/2, 0]),
    // ojo de la cerradura
    circlePts(0, -H * 0.45, 0.08, 16),
    pts([0, -H * 0.45 - 0.08], [0, -H * 0.70]),
  ];
}

/** Escudo */
function makeShield(): THREE.Vector3[][] {
  const top = 0.55, bot = -0.65, side = 0.42;
  return [
    // contorno: arriba plano, lados curvos, punta abajo
    [
      new THREE.Vector3(-side, top, 0),
      new THREE.Vector3( side, top, 0),
      ...arcPts(side - 0.12, top - 0.12, 0.12, 0, -Math.PI / 2, 8).reverse(),
      new THREE.Vector3(side - 0.0, top - 0.12, 0),
      new THREE.Vector3(side - 0.0, -0.10, 0),
      new THREE.Vector3(0, bot, 0),
      new THREE.Vector3(-(side - 0.0), -0.10, 0),
      new THREE.Vector3(-(side - 0.0), top - 0.12, 0),
      new THREE.Vector3(-side, top, 0),
    ],
    // línea horizontal interna
    pts([-side * 0.6, 0.10], [side * 0.6, 0.10]),
    // chevron interno
    pts([-side * 0.4, 0.10], [0, -0.28], [side * 0.4, 0.10]),
  ];
}

/** Mini dial de bóveda */
function makeVaultDial(): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = [
    circlePts(0, 0, 0.55),
    circlePts(0, 0, 0.38),
  ];
  // 6 marcas
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    lines.push(pts(
      [Math.cos(a) * 0.38, Math.sin(a) * 0.38],
      [Math.cos(a) * 0.55, Math.sin(a) * 0.55],
    ));
  }
  // 3 radios
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    lines.push(pts([0, 0], [Math.cos(a) * 0.30, Math.sin(a) * 0.30]));
  }
  return lines;
}

/** Gema / diamante */
function makeGem(): THREE.Vector3[][] {
  return [[
    new THREE.Vector3(0,    0.45, 0),
    new THREE.Vector3(0.38, 0.15, 0),
    new THREE.Vector3(0.24, -0.40, 0),
    new THREE.Vector3(-0.24, -0.40, 0),
    new THREE.Vector3(-0.38, 0.15, 0),
    new THREE.Vector3(0,    0.45, 0),
  ], pts([-0.38, 0.15], [0, 0.45], [0.38, 0.15]),
     pts([-0.38, 0.15], [-0.24, -0.40]),
     pts([0.38, 0.15], [0.24, -0.40]),
     pts([-0.38, 0.15], [0, -0.05], [0.38, 0.15]),
  ];
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Instance {
  group: THREE.Group;
  vx: number; vy: number;
  rx: number; ry: number; rz: number;
  breathPhase: number; breathAmp: number;
}

export default function BovedaBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 28);

    // Glow sutil de fondo
    const gc = document.createElement("canvas");
    gc.width = gc.height = 256;
    const gctx = gc.getContext("2d")!;
    const gr = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0,   "rgba(37,99,235,0.12)");
    gr.addColorStop(0.5, "rgba(37,99,235,0.04)");
    gr.addColorStop(1,   "rgba(0,0,0,0)");
    gctx.fillStyle = gr; gctx.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(gc);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
    glow.scale.set(80, 50, 1);
    glow.position.set(0, 0, -15);
    scene.add(glow);

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const instances: Instance[] = [];

    const SHAPES = [makeKey, makePadlock, makeShield, makeVaultDial, makeGem];
    const COUNTS  = [8,       7,           6,           5,             6];

    SHAPES.forEach((shapeFn, si) => {
      for (let i = 0; i < COUNTS[si]; i++) {
        const group  = new THREE.Group();
        const scale  = rnd(0.5, 1.6);
        const depth  = rnd(-18, 3);
        const opBase = rnd(0.04, 0.13) * (1 - Math.abs(depth) / 22);
        const op     = Math.max(0.03, opBase);

        const mat = new THREE.LineBasicMaterial({
          color: new THREE.Color(0.22 + rnd(0, 0.08), 0.40 + rnd(0, 0.10), 0.90),
          transparent: true,
          opacity: op,
        });

        makeLines(shapeFn(), mat).forEach(l => group.add(l));

        group.scale.setScalar(scale);
        group.position.set(rnd(-22, 22), rnd(-13, 13), depth);
        group.rotation.set(rnd(-0.3, 0.3), rnd(-0.4, 0.4), rnd(-Math.PI, Math.PI));
        scene.add(group);

        instances.push({
          group,
          vx: rnd(-0.007, 0.007),
          vy: rnd(-0.005, 0.005),
          rx: rnd(-0.0005, 0.0005),
          ry: rnd(-0.0007, 0.0007),
          rz: rnd(-0.0004, 0.0004),
          breathPhase: Math.random() * Math.PI * 2,
          breathAmp: rnd(0.004, 0.012),
        });
      }
    });

    // ── Animación ─────────────────────────────────────────────────────────
    const BOUNDS = { x: 24, y: 15 };
    let frame: number;
    let t = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.012;

      instances.forEach(inst => {
        const g = inst.group;
        g.position.x += inst.vx;
        g.position.y += inst.vy;
        if (g.position.x >  BOUNDS.x) g.position.x = -BOUNDS.x;
        if (g.position.x < -BOUNDS.x) g.position.x =  BOUNDS.x;
        if (g.position.y >  BOUNDS.y) g.position.y = -BOUNDS.y;
        if (g.position.y < -BOUNDS.y) g.position.y =  BOUNDS.y;
        g.rotation.x += inst.rx;
        g.rotation.y += inst.ry;
        g.rotation.z += inst.rz;
        const base = g.userData.bs ?? g.scale.x;
        if (!g.userData.bs) g.userData.bs = base;
        g.scale.setScalar(base * (1 + Math.sin(t + inst.breathPhase) * inst.breathAmp));
      });

      camera.position.x = Math.sin(t * 0.05) * 0.8;
      camera.position.y = Math.cos(t * 0.04) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      glowTex.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
  );
}
