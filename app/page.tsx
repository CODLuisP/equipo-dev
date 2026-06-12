"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import * as THREE from "three";
import { api } from "@/lib/api";

/* ─────────────────────────────────────────────
   Three.js helpers
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

function buildProgrammer(scene: THREE.Scene, posX: number, type: 0 | 1 | 2) {
  const g = new THREE.Group();
  const torsoColor = [0x1e3a5f, 0x1a4a3a, 0x3b1f60][type];
  const hairColor  = type === 2 ? 0x888888 : 0x2c1810;
  const symColor   = ["#60a5fa", "#34d399", "#c084fc"][type];
  const skin       = 0xf0c090;

  ([-0.19, 0.19] as number[]).forEach(x => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), lam(0x141626));
    leg.position.set(x, -0.86, 0); leg.castShadow = true; g.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.36), lam(0x0a0a0f));
    shoe.position.set(x, -1.27, 0.07); g.add(shoe);
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.28), lam(torsoColor));
  torso.position.y = -0.11; torso.castShadow = true; g.add(torso);

  const armL = new THREE.Group();
  const armR = new THREE.Group();
  const armMesh = () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), lam(torsoColor));
    m.position.y = -0.31; m.castShadow = true; return m;
  };
  armL.add(armMesh()); armL.position.set(-0.44, 0.04, 0);
  armR.add(armMesh()); armR.position.set( 0.44, 0.04, 0);
  g.add(armL, armR);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 8), lam(skin));
  neck.position.y = 0.38; g.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), lam(skin));
  head.position.y = 0.72; head.castShadow = true; g.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), lam(hairColor));
  hair.position.set(0, 0.93, 0); g.add(hair);

  ([-0.1, 0.1] as number[]).forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), lam(0x111111));
    eye.position.set(ex, 0.74, 0.25); g.add(eye);
  });

  const glassM = lam(0xbbbbbb);
  if (type === 1) {
    ([-0.1, 0.1] as number[]).forEach(gx => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.012), new THREE.MeshLambertMaterial({ color: 0xaaaaaa, wireframe: true }));
      frame.position.set(gx, 0.74, 0.27); g.add(frame);
    });
  } else {
    ([-0.1, 0.1] as number[]).forEach(gx => {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), glassM);
      lens.position.set(gx, 0.74, 0.27); lens.rotation.x = Math.PI / 2; g.add(lens);
    });
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.01), glassM);
  bridge.position.set(0, 0.74, 0.27); g.add(bridge);

  if (type === 0) {
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.2, 10), lam(0xcc3300));
    mug.position.set(0.5, -0.42, 0.1); g.add(mug);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 6, 10, Math.PI), lam(0xaa2a00));
    handle.position.set(0.575, -0.42, 0.1); handle.rotation.y = Math.PI / 2; g.add(handle);
  }
  if (type === 1) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.03, 0.38), lam(0x1e2d3d));
    base.position.set(0, -0.49, 0.22);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.018), lam(0x091a2e));
    screen.position.set(0, -0.31, 0.2); screen.rotation.x = -Math.PI / 5.5;
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.005), lam(0x0d4aaa, 0x061828));
    glow.position.set(0, -0.31, 0.21); glow.rotation.x = -Math.PI / 5.5;
    g.add(base, screen, glow);
  }
  if (type === 2) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.024, 8, 20, Math.PI), lam(0x1a3050));
    arc.position.set(0, 0.9, 0); arc.rotation.z = Math.PI; g.add(arc);
    ([-0.24, 0.24] as number[]).forEach(ex => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.055, 10), lam(0x0d1c2e));
      cup.position.set(ex, 0.69, 0); cup.rotation.z = Math.PI / 2; g.add(cup);
    });
  }

  const symbolSets = [["</>", "{}", "#!"], ["=>", "fn()", "0x0"], ["git", "★", "∞"]];
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
   Login Page
───────────────────────────────────────────── */
const BADGES = [
  { label: "React 19",    symbol: "⚛",  color: "#61dafb", top: "37%", left: "4%",   delay: "0s",    dur: "3.8s" },
  { label: "TypeScript",  symbol: "TS", color: "#4895ef", top: "18%", right: "9%",  delay: "0.6s",  dur: "4.2s" },
  { label: "Next.js 15",  symbol: "▲",  color: "#e2e8f0", top: "70%", left: "5%",   delay: "1.2s",  dur: "3.5s" },
  { label: "Node.js",     symbol: "⬡",  color: "#68a063", top: "76%", right: "8%",  delay: "1.8s",  dur: "4.6s" },
  { label: "Git",         symbol: "⎇",  color: "#f97316", top: "52%", left: "3%",   delay: "2.4s",  dur: "3.2s" },
  { label: "VS Code",     symbol: "⧉",  color: "#0078d4", top: "46%", right: "5%",  delay: "3s",    dur: "4.0s" },
];

const STATS = [
  { value: "100%", label: "Equipo activo" },
  { value: "∞",    label: "Snippets"      },
  { value: "24/7", label: "Disponible"    },
];

export default function LoginPage() {
  const router          = useRouter();
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [ready, setReady]               = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("equipo_dev_token");
    if (token) router.replace("/dashboard");
    else setReady(true);
  }, [router]);

  /* Three.js — left panel */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a14, 0.06);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    camera.position.set(0, 1.6, 9.5);
    camera.lookAt(0, 0.4, 0);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    scene.add(new THREE.AmbientLight(0x1a2860, 1.4));
    const key = new THREE.DirectionalLight(0x7aadff, 1.6);
    key.position.set(4, 8, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x2050c0, 0.5);
    fill.position.set(-5, 3, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x4090ff, 0.35);
    rim.position.set(1, 4, -6);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshLambertMaterial({ color: 0x090c1c }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.35; floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(28, 36, 0x162256, 0x0e1840);
    grid.position.y = -1.34; scene.add(grid);

    const chars = [
      buildProgrammer(scene, -3.6, 0),
      buildProgrammer(scene,  0,   1),
      buildProgrammer(scene,  3.6, 2),
    ];

    chars.forEach((_, ci) => {
      const plat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32),
        new THREE.MeshLambertMaterial({ color: [0x0d2040, 0x0a2818, 0x1a0d30][ci], emissive: [0x041020, 0x041410, 0x0d0618][ci] })
      );
      plat.position.set([-3.6, 0, 3.6][ci], -1.33, 0);
      plat.receiveShadow = true; scene.add(plat);
    });

    let t = 0, animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.016;
      camera.position.x = Math.sin(t * 0.07) * 1.4;
      camera.position.y = 1.6 + Math.sin(t * 0.11) * 0.15;
      camera.lookAt(0, 0.4, 0);

      chars.forEach((ch, ci) => {
        const phase = ci * (Math.PI * 2 / 3);
        ch.group.position.y = Math.sin(t * 1.4 + phase) * 0.045;
        ch.armL.rotation.x = Math.sin(t * 1.3 + phase) * 0.18;
        ch.armR.rotation.x = Math.sin(t * 1.3 + phase + Math.PI) * 0.18;
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

    return () => { cancelAnimationFrame(animId); ro.disconnect(); renderer.dispose(); };
  }, [ready]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { token } = await api.login(password);
      localStorage.setItem("equipo_dev_token", token);
      router.push("/dashboard");
    } catch {
      setError("Contraseña incorrecta. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes sweep    { 0% { top:-3px; opacity:.7; } 85% { opacity:.7; } 100% { top:101%; opacity:0; } }
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50%       { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-5px); }
          40%,80% { transform:translateX(5px); }
        }
        @keyframes pulseGlow {
          0%,100% { opacity:.5; transform:scale(1); }
          50%      { opacity:1; transform:scale(1.04); }
        }
        @keyframes scanline {
          0%   { opacity:0; transform:translateY(-100%); }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { opacity:0; transform:translateY(200%); }
        }

        .login-input::placeholder { color: rgba(255,255,255,0.18); }
        .login-input:focus {
          border-color: rgba(37,99,235,0.55) !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important;
          outline: none !important;
        }
        .submit-btn { transition: background 0.18s, transform 0.15s, box-shadow 0.18s !important; }
        .submit-btn:hover:not(:disabled) {
          background: #1d4ed8 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 36px rgba(37,99,235,0.55) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) !important; }

        @media (max-width: 1023px) {
          .form-card-inner {
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }
          .form-card-accent { display: none !important; }
          .form-card-inner > div { padding: 8px 4px !important; }
        }

        .form-card-entry { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .branding-entry  { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .stats-entry     { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .badge-entry     { animation: fadeIn 0.5s ease both; }

        .field-row-1 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .field-row-2 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
        .field-row-3 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.54s both; }

        .error-shake { animation: shake 0.4s ease; }

        .eye-btn:hover { color: rgba(96,165,250,0.9) !important; }

        @media (max-width: 1023px) {
          .left-panel { display: none !important; }
          .right-panel { flex: none !important; width: 100% !important; }
        }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        background: "#080a14",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}>

        {/* ══════════════════════════════════════
            LEFT PANEL — Three.js + Branding
        ══════════════════════════════════════ */}
        <div className="left-panel" style={{
          flex: "0 0 56%", position: "relative", overflow: "hidden", background: "#07091a",
          display: "flex", flexDirection: "column",
        }}>

          {/* Three.js canvas */}
          <canvas ref={canvasRef} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1,
          }} />

          {/* Dot grid overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            backgroundImage: "radial-gradient(rgba(37,99,235,0.06) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />

          {/* Top gradient */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "38%", zIndex: 3, pointerEvents: "none",
            background: "linear-gradient(to bottom, #07091a 12%, rgba(7,9,26,0.75) 55%, transparent)",
          }} />

          {/* Bottom gradient */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 3, pointerEvents: "none",
            background: "linear-gradient(to top, #07091a 15%, rgba(7,9,26,0.7) 55%, transparent)",
          }} />

          {/* Right edge blend into form panel */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: "18%", zIndex: 4, pointerEvents: "none",
            background: "linear-gradient(to left, #080a14 0%, rgba(8,10,20,0.5) 50%, transparent 100%)",
          }} />

          {/* Animated scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1, zIndex: 5, pointerEvents: "none",
            background: "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.12) 20%, rgba(96,165,250,0.35) 50%, rgba(37,99,235,0.12) 80%, transparent 100%)",
            animation: "scanline 10s linear infinite",
          }} />

          {/* Floating tech badges */}
          {BADGES.map((b, i) => (
            <div key={b.label} className="badge-entry" style={{
              position: "absolute", zIndex: 6, pointerEvents: "none",
              top: b.top,
              ...(b.left  ? { left:  b.left  } : {}),
              ...(b.right ? { right: b.right } : {}),
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(7,9,26,0.82)",
              border: `1px solid ${b.color}28`,
              borderRadius: 20, padding: "5px 11px 5px 8px",
              backdropFilter: "blur(10px)",
              animation: `badgeFloat ${b.dur} ease-in-out infinite, fadeIn 0.5s ${b.delay} ease both`,
              animationDelay: b.delay,
              fontSize: 11, fontWeight: 700, color: b.color,
              letterSpacing: "0.02em",
              boxShadow: `0 0 16px ${b.color}12`,
            }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, lineHeight: 1 }}>{b.symbol}</span>
              {b.label}
            </div>
          ))}

          {/* ─── Branding top ─── */}
          <div className="branding-entry" style={{
            position: "absolute", top: 40, left: 48, right: 60, zIndex: 7,
          }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 40, fontWeight: 800, margin: 0,
              color: "#eef0fb", lineHeight: 1.1, letterSpacing: "-1px",
            }}>
              Donde el código<br />
              <span style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>cobra vida.</span>
            </h1>
            <p style={{
              fontSize: 13, color: "rgba(139,145,184,0.65)",
              margin: "12px 0 0", lineHeight: 1.65, fontWeight: 400, maxWidth: 340,
            }}>
              Panel de gestión interna para el equipo<br />de programadores.
            </p>
          </div>

          {/* ─── Stats bottom ─── */}
          <div className="stats-entry" style={{
            position: "absolute", bottom: 36, left: 48, right: 60, zIndex: 7,
            display: "flex", alignItems: "center", gap: 0,
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{
                    width: 1, height: 30, background: "rgba(37,99,235,0.18)", margin: "0 22px",
                  }} />
                )}
                <div>
                  <div style={{
                    fontSize: 20, fontWeight: 800, color: "#eef0fb", letterSpacing: "-0.5px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 9, color: "rgba(58,64,96,0.9)", marginTop: 3,
                    letterSpacing: "0.14em", fontFamily: "JetBrains Mono, monospace",
                    textTransform: "uppercase", fontWeight: 500,
                  }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — Login form
        ══════════════════════════════════════ */}
        <div className="right-panel" style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 32px", position: "relative", background: "#080a14", overflow: "hidden",
        }}>

          {/* Subtle dot grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(rgba(37,99,235,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }} />

          {/* Radial ambient glow behind the card */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500, height: 500, pointerEvents: "none",
            background: "radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 68%)",
          }} />

          {/* Decorative code text — top right */}
          <div style={{
            position: "absolute", top: 28, right: 28,
            fontFamily: "JetBrains Mono, monospace", fontSize: 100, fontWeight: 800, lineHeight: 1,
            color: "rgba(37,99,235,0.035)", userSelect: "none", pointerEvents: "none",
            animation: "pulseGlow 5s ease-in-out infinite",
          }}>{"{ }"}</div>

          {/* Decorative bracket — bottom left */}
          <div style={{
            position: "absolute", bottom: 20, left: 24,
            fontFamily: "JetBrains Mono, monospace", fontSize: 64, fontWeight: 800, lineHeight: 1,
            color: "rgba(37,99,235,0.03)", userSelect: "none", pointerEvents: "none",
          }}>{"</>"}</div>

          {/* ─── Form card ─── */}
          <div className="form-card-entry" style={{
            width: "100%", maxWidth: 372,
            position: "relative", zIndex: 1,
          }}>
            {/* Glow behind card */}
            <div style={{
              position: "absolute", inset: -20,
              background: "radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)",
              borderRadius: 32, pointerEvents: "none",
              animation: "pulseGlow 4s ease-in-out infinite",
            }} />

            <div className="form-card-inner" style={{
              position: "relative",
              background: "rgba(7,9,26,0.96)",
              border: "1px solid rgba(37,99,235,0.14)",
              borderRadius: 22,
              backdropFilter: "blur(24px)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(37,99,235,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
              overflow: "hidden",
            }}>

              {/* Top accent bar */}
              <div className="form-card-accent" style={{
                height: 2,
                background: "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.5) 30%, rgba(96,165,250,0.65) 50%, rgba(37,99,235,0.5) 70%, transparent 100%)",
              }} />

              <div style={{ padding: "36px 36px 32px" }}>

                {/* Title block */}
                <div className="field-row-1" style={{ marginBottom: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                    <img src="/assets/logo.png" alt="Logo" style={{ height: 20, width: "auto", opacity: 0.85 }} />
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 800,
                      background: "linear-gradient(135deg, #60a5fa, #93c5fd)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      letterSpacing: "-0.5px",
                    }}>Flux</span>
                  </div>
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 20, fontWeight: 800, color: "#eef0fb",
                    margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2,
                  }}>
                    Acceso al equipo
                  </h2>
                  <p style={{
                    fontSize: 13, color: "rgba(139,145,184,0.8)",
                    margin: "7px 0 0", lineHeight: 1.55,
                  }}>
                    Ingresa la contraseña compartida del equipo
                  </p>
                </div>

                {/* ─── Form ─── */}
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Password field */}
                  <div className="field-row-2" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={{
                      fontSize: 10, fontWeight: 700, color: "rgba(139,145,184,0.9)",
                      letterSpacing: "0.16em", textTransform: "uppercase",
                    }}>
                      Contraseña del equipo
                    </label>
                    <div style={{ position: "relative" }}>
                      {/* Lock icon */}
                      <div style={{
                        position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                        color: "rgba(37,99,235,0.45)", display: "flex", pointerEvents: "none",
                      }}>
                        <Lock size={14} />
                      </div>
                      <input
                        className="login-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        style={{
                          display: "block", width: "100%",
                          background: "rgba(8,10,20,0.8)",
                          border: `1px solid ${error ? "rgba(239,68,68,0.32)" : "rgba(37,99,235,0.14)"}`,
                          borderRadius: 11, padding: "11px 40px 11px 38px",
                          fontSize: 14, color: "#eef0fb",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer",
                          color: "rgba(139,145,184,0.4)", display: "flex", padding: 0,
                          transition: "color 0.15s",
                        }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="error-shake" style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      borderRadius: 10, padding: "10px 13px",
                      fontSize: 12, color: "#f87171",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <div className="field-row-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="submit-btn"
                      style={{
                        width: "100%", marginTop: 6,
                        background: loading ? "rgba(37,99,235,0.35)" : "#2563eb",
                        border: "none", borderRadius: 12,
                        padding: "13px 20px",
                        color: "#fff", fontSize: 14, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: "0.01em",
                        boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.35)",
                      }}
                    >
                      {loading ? (
                        <>
                          <span style={{
                            width: 14, height: 14,
                            border: "2px solid rgba(255,255,255,0.25)",
                            borderTopColor: "#fff", borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                          }} />
                          Verificando…
                        </>
                      ) : (
                        <>
                          Acceder
                          <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer hint */}
                <p style={{
                  marginTop: 22, fontSize: 11,
                  color: "rgba(74,80,112,1)",
                  textAlign: "center", lineHeight: 1.5,
                  letterSpacing: "0.04em",
                }}>
                  Acceso restringido - solo equipo interno
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
