"use client";

import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member } from "@/app/dashboard/types";
import * as THREE from "three";

interface WhoAreYouScreenProps {
  members: Member[];
  onSelect: (member: Member) => void;
  onSkip: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

/* ─────────────────────────────────────────────
   Three.js scene helpers
───────────────────────────────────────────── */
function symTexture(text: string, color: string) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 56;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 56);
  ctx.font = "bold 24px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 28);
  return new THREE.CanvasTexture(c);
}

function lam(color: number, emissive = 0x000000) {
  return new THREE.MeshLambertMaterial({ color, emissive });
}

function buildProgrammer(
  scene: THREE.Scene,
  posX: number,
  type: 0 | 1 | 2
) {
  const g = new THREE.Group();

  const torsoColor  = [0x1e3a5f, 0x1a4a3a, 0x3b1f60][type];
  const hairColor   = type === 2 ? 0x888888 : 0x2c1810;
  const symColor    = ["#60a5fa", "#34d399", "#c084fc"][type];
  const skin        = 0xf0c090;

  /* ── legs ── */
  ([-0.19, 0.19] as number[]).forEach(x => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), lam(0x141626));
    leg.position.set(x, -0.86, 0);
    leg.castShadow = true;
    g.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.36), lam(0x0a0a0f));
    shoe.position.set(x, -1.27, 0.07);
    g.add(shoe);
  });

  /* ── torso ── */
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.28), lam(torsoColor));
  torso.position.y = -0.11;
  torso.castShadow = true;
  g.add(torso);

  /* ── arms (animated groups so rotation pivots at shoulder) ── */
  const armL = new THREE.Group();
  const armR = new THREE.Group();
  const armMesh = () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), lam(torsoColor));
    m.position.y = -0.31;
    m.castShadow = true;
    return m;
  };
  armL.add(armMesh()); armL.position.set(-0.44, 0.04, 0);
  armR.add(armMesh()); armR.position.set( 0.44, 0.04, 0);
  g.add(armL, armR);

  /* ── neck ── */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 8), lam(skin));
  neck.position.y = 0.38;
  g.add(neck);

  /* ── head ── */
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), lam(skin));
  head.position.y = 0.72;
  head.castShadow = true;
  g.add(head);

  /* ── hair ── */
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), lam(hairColor));
  hair.position.set(0, 0.93, 0);
  g.add(hair);

  /* ── eyes ── */
  ([-0.1, 0.1] as number[]).forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), lam(0x111111));
    eye.position.set(ex, 0.74, 0.25);
    g.add(eye);
  });

  /* ── glasses ── */
  const glassM = lam(0xbbbbbb);
  if (type === 1) {
    // square frames
    ([-0.1, 0.1] as number[]).forEach(gx => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.012), new THREE.MeshLambertMaterial({ color: 0xaaaaaa, wireframe: true }));
      frame.position.set(gx, 0.74, 0.27);
      g.add(frame);
    });
  } else {
    // round (torus)
    ([-0.1, 0.1] as number[]).forEach(gx => {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), glassM);
      lens.position.set(gx, 0.74, 0.27);
      lens.rotation.x = Math.PI / 2;
      g.add(lens);
    });
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), glassM);
  bridge.position.set(0, 0.74, 0.27);
  g.add(bridge);

  /* ── accessories ── */
  if (type === 0) {
    // coffee mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.2, 10), lam(0xcc3300));
    mug.position.set(0.5, -0.42, 0.1);
    g.add(mug);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 6, 10, Math.PI), lam(0xaa2a00));
    handle.position.set(0.575, -0.42, 0.1);
    handle.rotation.y = Math.PI / 2;
    g.add(handle);
    // steam wisps
    for (let i = 0; i < 3; i++) {
      const wisp = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
      );
      wisp.position.set(0.47 + i * 0.04, -0.14 + i * 0.08, 0.1);
      wisp.userData.steamIdx = i;
      g.add(wisp);
    }
  }

  if (type === 1) {
    // laptop base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.03, 0.38), lam(0x1e2d3d));
    base.position.set(0, -0.49, 0.22);
    // screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.018), lam(0x091a2e));
    screen.position.set(0, -0.31, 0.2);
    screen.rotation.x = -Math.PI / 5.5;
    // screen glow
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.005), lam(0x0d4aaa, 0x061828));
    glow.position.set(0, -0.31, 0.21);
    glow.rotation.x = -Math.PI / 5.5;
    g.add(base, screen, glow);
  }

  if (type === 2) {
    // headphones arc
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.024, 8, 20, Math.PI), lam(0x1a3050));
    arc.position.set(0, 0.9, 0);
    arc.rotation.z = Math.PI;
    g.add(arc);
    ([-0.24, 0.24] as number[]).forEach(ex => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.055, 10), lam(0x0d1c2e));
      cup.position.set(ex, 0.69, 0);
      cup.rotation.z = Math.PI / 2;
      g.add(cup);
    });
  }

  /* ── floating code symbols ── */
  const symbolSets = [["</>", "{}", "#!"], ["=> ", "fn()", "0x0"], ["git", "★", "∞"]];
  const floaters: THREE.Mesh[] = [];

  symbolSets[type].forEach((sym, i) => {
    const tex = symTexture(sym, symColor);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.19),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.82, depthWrite: false, side: THREE.DoubleSide })
    );
    plane.position.set(-0.3 + i * 0.32, 1.26 + i * 0.14, 0.05);
    (plane.userData as { floatOff: number; baseY: number }).floatOff = i * (Math.PI * 2 / 3);
    (plane.userData as { baseY: number }).baseY = plane.position.y;
    g.add(plane);
    floaters.push(plane);
  });

  g.position.set(posX, 0, 0);
  scene.add(g);
  return { group: g, armL, armR, floaters };
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function WhoAreYouScreen({ members, onSelect, onSkip, toasterProps }: WhoAreYouScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* renderer */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070917);
    scene.fog = new THREE.FogExp2(0x070917, 0.055);

    /* camera */
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    camera.position.set(0, 1.6, 9.5);
    camera.lookAt(0, 0.4, 0);

    /* resize */
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* lights */
    scene.add(new THREE.AmbientLight(0x1a2860, 1.4));

    const key = new THREE.DirectionalLight(0x7aadff, 1.6);
    key.position.set(4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.far = 30;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x2050c0, 0.5);
    fill.position.set(-5, 3, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4090ff, 0.35);
    rim.position.set(1, 4, -6);
    scene.add(rim);

    /* floor */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshLambertMaterial({ color: 0x090c1c })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    floor.receiveShadow = true;
    scene.add(floor);

    /* grid */
    const grid = new THREE.GridHelper(28, 36, 0x162256, 0x0e1840);
    grid.position.y = -1.34;
    scene.add(grid);

    /* back wall glow strips */
    for (let i = 0; i < 3; i++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 3.5),
        new THREE.MeshBasicMaterial({ color: [0x1a4aee, 0x0d8060, 0x6020b0][i], transparent: true, opacity: 0.18 })
      );
      strip.position.set(-3.5 + i * 3.5, 0.4, -6);
      scene.add(strip);
    }

    /* characters */
    const chars = [
      buildProgrammer(scene, -3.6, 0),
      buildProgrammer(scene,  0,   1),
      buildProgrammer(scene,  3.6, 2),
    ];

    /* small platforms under each character */
    chars.forEach((_, ci) => {
      const plat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32),
        new THREE.MeshLambertMaterial({ color: [0x0d2040, 0x0a2818, 0x1a0d30][ci], emissive: [0x041020, 0x041410, 0x0d0618][ci] })
      );
      plat.position.set([-3.6, 0, 3.6][ci], -1.33, 0);
      plat.receiveShadow = true;
      scene.add(plat);
    });

    /* animate */
    let t = 0, animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.016;

      /* slow camera drift */
      camera.position.x = Math.sin(t * 0.07) * 1.4;
      camera.position.y = 1.6 + Math.sin(t * 0.11) * 0.15;
      camera.lookAt(0, 0.4, 0);

      chars.forEach((ch, ci) => {
        const phase = ci * (Math.PI * 2 / 3);

        /* body bob */
        ch.group.position.y = Math.sin(t * 1.4 + phase) * 0.045;

        /* arm swing */
        ch.armL.rotation.x = Math.sin(t * 1.3 + phase) * 0.18;
        ch.armR.rotation.x = Math.sin(t * 1.3 + phase + Math.PI) * 0.18;

        /* floating symbols */
        ch.floaters.forEach((f, fi) => {
          const ud = f.userData as { floatOff: number; baseY: number };
          f.position.y = ud.baseY + Math.sin(t * 1.7 + ud.floatOff + fi) * 0.09;
          f.rotation.z = Math.sin(t * 0.5 + fi) * 0.06;
          (f.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(t * 2.1 + fi) * 0.17;
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070917",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <Toaster {...toasterProps} />

      {/* Three.js canvas — full background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 0,
        }}
      />

      {/* Bottom gradient so cards are readable */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(to top, rgba(7,9,23,0.97) 30%, rgba(7,9,23,0.6) 70%, transparent 100%)",
        pointerEvents: "none", zIndex: 1,
      }} />
      {/* Top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(to bottom, rgba(7,9,23,0.85) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* UI content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 680, width: "100%" }}>

        {/* Icon */}
        <div style={{
          width: 58, height: 58, borderRadius: 15,
          background: "rgba(37,99,235,0.10)",
          border: "1px solid rgba(37,99,235,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px",
          boxShadow: "0 0 28px rgba(37,99,235,0.15)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: "#eef0fb",
          margin: "0 0 8px", letterSpacing: "-0.6px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          ¿Quién eres{" "}
          <span style={{
            background: "linear-gradient(135deg, #60a5fa, #93c5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>hoy</span>?
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 34px", lineHeight: 1.5 }}>
          Selecciona tu perfil para personalizar las notificaciones
        </p>

        {/* Member cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(152px, 1fr))",
          gap: 12,
        }}>
          {members.map((member, i) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              style={{
                background: "rgba(10,12,24,0.82)",
                border: "1px solid rgba(37,99,235,0.14)",
                borderRadius: 16,
                padding: "22px 14px 18px",
                cursor: "pointer",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 11,
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                animationDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(37,99,235,0.10)";
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.38)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(37,99,235,0.22), 0 0 22px rgba(37,99,235,0.09)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(10,12,24,0.82)";
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.14)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)";
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", inset: -4, borderRadius: 18,
                  background: `radial-gradient(circle, ${member.color}22 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={58} borderRadius={14} />
              </div>
              <div>
                <p style={{ color: "#eef0fb", fontWeight: 700, fontSize: 13, margin: 0, letterSpacing: "-0.1px" }}>
                  {member.name}
                </p>
                <p style={{ color: "#6b7280", fontSize: 11, margin: "3px 0 0", fontWeight: 500 }}>
                  {member.role}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            marginTop: 28, background: "none", border: "none",
            color: "#3a4060", fontSize: 12, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
            transition: "color 0.15s",
            display: "flex", alignItems: "center", gap: 6,
            margin: "28px auto 0",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#8b91b8"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#3a4060"; }}
        >
          Continuar sin seleccionar
        </button>
      </div>
    </div>
  );
}
