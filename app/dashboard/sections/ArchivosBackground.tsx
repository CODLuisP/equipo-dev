"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ── Helpers: crea geometrías de documento y carpeta ─────────────────────────

function makeDocGeo(w = 1, h = 1.3, fold = 0.22): THREE.BufferGeometry {
  // Rectángulo con esquina doblada (page fold)
  const pts: number[] = [
    0, 0, 0,
    w, 0, 0,
    w, h - fold, 0,
    w - fold, h, 0,
    0, h, 0,
    0, 0, 0,
  ];
  const foldPts: number[] = [
    w, h - fold, 0,
    w - fold, h - fold, 0,
    w - fold, h, 0,
  ];
  const geo = new THREE.BufferGeometry();
  const all = [...pts, ...foldPts];
  geo.setAttribute("position", new THREE.Float32BufferAttribute(all, 3));
  return geo;
}

function makeDocLines(w = 1, h = 1.3, fold = 0.22): THREE.Line[] {
  const outline = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(w, 0, 0),
    new THREE.Vector3(w, h - fold, 0),
    new THREE.Vector3(w - fold, h, 0),
    new THREE.Vector3(0, h, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  const foldCorner = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(w, h - fold, 0),
    new THREE.Vector3(w - fold, h - fold, 0),
    new THREE.Vector3(w - fold, h, 0),
  ]);
  // Líneas de contenido (texto simulado)
  const lines: THREE.BufferGeometry[] = [outline, foldCorner];
  const lineYs = [h * 0.62, h * 0.48, h * 0.34, h * 0.20];
  const lineWidths = [w * 0.72, w * 0.85, w * 0.60, w * 0.78];
  lineYs.forEach((y, i) => {
    const lw = lineWidths[i];
    lines.push(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(w * 0.14, y, 0),
        new THREE.Vector3(w * 0.14 + lw, y, 0),
      ])
    );
  });
  return lines.map(g => new THREE.Line(g));
}

function makeFolderLines(fw = 1.1, fh = 0.85): THREE.Line[] {
  const tabW = fw * 0.38, tabH = fh * 0.14, tabX = fw * 0.1;
  const bodies: THREE.BufferGeometry[] = [
    // Cuerpo principal
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(fw, 0, 0),
      new THREE.Vector3(fw, fh, 0),
      new THREE.Vector3(0, fh, 0),
      new THREE.Vector3(0, 0, 0),
    ]),
    // Pestaña
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(tabX, fh, 0),
      new THREE.Vector3(tabX + tabW * 0.18, fh + tabH, 0),
      new THREE.Vector3(tabX + tabW, fh + tabH, 0),
      new THREE.Vector3(tabX + tabW + tabW * 0.12, fh, 0),
    ]),
  ];
  return bodies.map(g => new THREE.Line(g));
}

// ── Datos de instancias ──────────────────────────────────────────────────────

interface ShapeInstance {
  group: THREE.Group;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  breathPhase: number;
  breathAmp: number;
}

export default function ArchivosBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Escena ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 28);

    // ── Nebulosa de fondo (un solo sprite difuminado) ────────────────────
    const gc = document.createElement("canvas");
    gc.width = gc.height = 512;
    const gctx = gc.getContext("2d")!;
    const gr = gctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gr.addColorStop(0,   "rgba(30, 60, 140, 0.14)");
    gr.addColorStop(0.5, "rgba(20, 40, 100, 0.06)");
    gr.addColorStop(1,   "rgba(0,0,0,0)");
    gctx.fillStyle = gr;
    gctx.fillRect(0, 0, 512, 512);
    const glowTex = new THREE.CanvasTexture(gc);
    const glowSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
    glowSpr.scale.set(80, 50, 1);
    glowSpr.position.set(0, 0, -15);
    scene.add(glowSpr);

    // ── Material compartido ──────────────────────────────────────────────
    const makeMat = (opacity: number) =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0.28, 0.45, 0.9),
        transparent: true,
        opacity,
      });

    // ── Crear instancias ─────────────────────────────────────────────────
    const instances: ShapeInstance[] = [];

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // 14 documentos
    for (let i = 0; i < 14; i++) {
      const group = new THREE.Group();
      const scale = rnd(0.55, 1.7);
      const depth = rnd(-18, 4);
      const opacity = rnd(0.04, 0.13) * (1 - Math.abs(depth) / 24);
      const mat = makeMat(Math.max(0.03, opacity));
      const docLines = makeDocLines(1, 1.3, 0.22);
      docLines.forEach(l => { l.material = mat; group.add(l); });
      group.scale.setScalar(scale);
      group.position.set(rnd(-22, 22), rnd(-13, 13), depth);
      group.rotation.set(rnd(-0.3, 0.3), rnd(-0.4, 0.4), rnd(-0.25, 0.25));
      scene.add(group);
      instances.push({
        group,
        vx: rnd(-0.008, 0.008),
        vy: rnd(-0.006, 0.006),
        vz: 0,
        rx: rnd(-0.0006, 0.0006),
        ry: rnd(-0.0008, 0.0008),
        rz: rnd(-0.0004, 0.0004),
        breathPhase: Math.random() * Math.PI * 2,
        breathAmp: rnd(0.005, 0.015),
      });
    }

    // 7 carpetas
    for (let i = 0; i < 7; i++) {
      const group = new THREE.Group();
      const scale = rnd(0.7, 1.9);
      const depth = rnd(-16, 2);
      const opacity = rnd(0.03, 0.10) * (1 - Math.abs(depth) / 20);
      const mat = makeMat(Math.max(0.03, opacity));
      const folderLines = makeFolderLines(1.1, 0.85);
      folderLines.forEach(l => { l.material = mat; group.add(l); });
      group.scale.setScalar(scale);
      group.position.set(rnd(-22, 22), rnd(-13, 13), depth);
      group.rotation.set(rnd(-0.25, 0.25), rnd(-0.5, 0.5), rnd(-0.2, 0.2));
      scene.add(group);
      instances.push({
        group,
        vx: rnd(-0.007, 0.007),
        vy: rnd(-0.005, 0.005),
        vz: 0,
        rx: rnd(-0.0005, 0.0005),
        ry: rnd(-0.0007, 0.0007),
        rz: rnd(-0.0003, 0.0003),
        breathPhase: Math.random() * Math.PI * 2,
        breathAmp: rnd(0.004, 0.012),
      });
    }

    // ── Animación ────────────────────────────────────────────────────────
    const BOUNDS = { x: 24, y: 15 };
    let frame: number;
    let t = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.012;

      instances.forEach(inst => {
        const g = inst.group;
        // Drift
        g.position.x += inst.vx;
        g.position.y += inst.vy;
        // Wrap around edges
        if (g.position.x >  BOUNDS.x) g.position.x = -BOUNDS.x;
        if (g.position.x < -BOUNDS.x) g.position.x =  BOUNDS.x;
        if (g.position.y >  BOUNDS.y) g.position.y = -BOUNDS.y;
        if (g.position.y < -BOUNDS.y) g.position.y =  BOUNDS.y;
        // Slow rotation
        g.rotation.x += inst.rx;
        g.rotation.y += inst.ry;
        g.rotation.z += inst.rz;
        // Subtle breathing scale
        const base = g.userData.baseScale ?? g.scale.x;
        if (!g.userData.baseScale) g.userData.baseScale = base;
        const breath = 1 + Math.sin(t + inst.breathPhase) * inst.breathAmp;
        g.scale.setScalar(base * breath);
      });

      // Camera micro-drift
      camera.position.x = Math.sin(t * 0.05) * 0.8;
      camera.position.y = Math.cos(t * 0.04) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────────────────
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
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 18,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
