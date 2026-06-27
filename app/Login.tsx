"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import * as THREE from "three";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Badge { label: string; img: string; top: string; right: string; delay: string; dur: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGES: Badge[] = [
  { label: "React",        img: "/assets/svg/react_dark.svg",       top: "8%",  right: "44%", delay: "0s",   dur: "3.8s" },
  { label: "TypeScript",   img: "/assets/svg/typescript.svg",        top: "18%", right: "3%",  delay: "0.6s", dur: "4.2s" },
  { label: "Next.js",      img: "/assets/svg/nextjs_icon_dark.svg",  top: "32%", right: "26%", delay: "1.1s", dur: "3.5s" },
  { label: "Node.js",      img: "/assets/svg/nodejs.svg",            top: "48%", right: "2%",  delay: "1.7s", dur: "4.6s" },
  { label: "Git",          img: "/assets/svg/git.svg",               top: "62%", right: "38%", delay: "2.1s", dur: "3.2s" },
  { label: "GitHub",       img: "/assets/svg/github_dark.svg",       top: "22%", right: "60%", delay: "2.6s", dur: "4.0s" },
  { label: "Claude AI",    img: "/assets/svg/claude-ai-icon.svg",    top: "76%", right: "10%", delay: "3.0s", dur: "3.7s" },
  { label: "Cloudflare",   img: "/assets/svg/cloudflare.svg",        top: "54%", right: "58%", delay: "0.9s", dur: "4.3s" },
  { label: "DigitalOcean", img: "/assets/svg/digitalocean.svg",      top: "88%", right: "34%", delay: "1.9s", dur: "3.9s" },
];

// ─── Three.js helpers ─────────────────────────────────────────────────────────

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
  const g          = new THREE.Group();
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

  const armL = new THREE.Group(); const armR = new THREE.Group();
  const armMesh = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), lam(torsoColor)); m.position.y = -0.31; m.castShadow = true; return m; };
  armL.add(armMesh()); armL.position.set(-0.44, 0.04, 0);
  armR.add(armMesh()); armR.position.set(0.44, 0.04, 0);
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
    const base   = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.03, 0.38), lam(0x1e2d3d)); base.position.set(0, -0.49, 0.22);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.018), lam(0x091a2e)); screen.position.set(0, -0.31, 0.2); screen.rotation.x = -Math.PI / 5.5;
    const glow   = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.005), lam(0x0d4aaa, 0x061828)); glow.position.set(0, -0.31, 0.21); glow.rotation.x = -Math.PI / 5.5;
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
    g.add(plane); floaters.push(plane);
  });

  g.position.set(posX, 0, 0);
  scene.add(g);
  return { group: g, armL, armR, floaters };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export default function Login() {
  const router                          = useRouter();
  const canvasRef                       = useRef<HTMLCanvasElement>(null);
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [ready,        setReady]        = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("equipo_dev_token");
    if (!token) { setReady(true); return; }
    api.getMembers()
      .then(() => router.replace("/dashboard"))
      .catch(() => { localStorage.removeItem("equipo_dev_token"); router.replace("/register"); });
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0x080a14, 0.06);

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
    const key  = new THREE.DirectionalLight(0x7aadff, 1.6); key.position.set(4, 8, 6);  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const fill = new THREE.DirectionalLight(0x2050c0, 0.5); fill.position.set(-5, 3, 2); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0x4090ff, 0.35); rim.position.set(1, 4, -6); scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshLambertMaterial({ color: 0x090c1c }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.35; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(28, 36, 0x162256, 0x0e1840); grid.position.y = -1.34; scene.add(grid);

    const chars = [buildProgrammer(scene, -3.6, 0), buildProgrammer(scene, 0, 1), buildProgrammer(scene, 3.6, 2)];
    chars.forEach((_, ci) => {
      const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32), new THREE.MeshLambertMaterial({ color: [0x0d2040, 0x0a2818, 0x1a0d30][ci], emissive: [0x041020, 0x041410, 0x0d0618][ci] }));
      plat.position.set([-3.6, 0, 3.6][ci], -1.33, 0); plat.receiveShadow = true; scene.add(plat);
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
        ch.armL.rotation.x  = Math.sin(t * 1.3 + phase) * 0.18;
        ch.armR.rotation.x  = Math.sin(t * 1.3 + phase + Math.PI) * 0.18;
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
      setError("Contraseña incorrecta.");
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap');

        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake      { 0%,100% { transform:translateX(0); } 25%,75% { transform:translateX(-4px); } 50% { transform:translateX(4px); } }
        @keyframes badgeIn    { 0% { opacity:0; transform:translateX(14px) scale(0.88); } 100% { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes badgeFloat { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }

        * { box-sizing: border-box; }

        .l-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:12px 44px; font-size:14px; color:#f1f5f9; font-family:inherit; outline:none; transition:border-color .15s, box-shadow .15s; }
        .l-input::placeholder { color:rgba(148,163,184,0.35); }
        .l-input:focus { border-color:rgba(99,102,241,0.55); box-shadow:0 0 0 3px rgba(99,102,241,0.12); }

        .l-btn { width:100%; padding:13px; border-radius:10px; border:none; background:#4361ee; color:#fff; font-size:14px; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .15s, transform .15s, box-shadow .15s; }
        .l-btn:hover:not(:disabled) { background:#1565c0; transform:translateY(-1px); }
        .l-btn:active:not(:disabled) { transform:translateY(0); }
        .l-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .l-eye { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(148,163,184,0.45); display:flex; padding:0; transition:color .15s; }
        .l-eye:hover { color:rgba(148,163,184,0.9); }

        .slide-1 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .1s  both; }
        .slide-2 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .22s both; }
        .slide-3 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .34s both; }
        .slide-4 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .46s both; }
        .slide-5 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .58s both; }

        .badge { animation: badgeIn 0.6s cubic-bezier(.16,1,.3,1) var(--delay) both, badgeFloat var(--dur) ease-in-out var(--delay) infinite; }
        .err-shake   { animation: shake .35s ease; }
        .spinner     { animation: spin .7s linear infinite; }
      `}</style>

      {/* ── Root: canvas ocupa todo el fondo ── */}
      <div className="relative h-screen overflow-hidden " style={{ fontFamily: "'Inter', sans-serif", background: "#08091c" }}>

        {/* Canvas Three.js — ancho completo */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Difuminado top/bottom */}
        <div aria-hidden className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 inset-x-0 h-28" style={{ background: "linear-gradient(to bottom, #08091c, transparent)" }} />
          <div className="absolute bottom-0 inset-x-0 h-28" style={{ background: "linear-gradient(to top, #08091c, transparent)" }} />
        </div>

        {/* Difuminado izquierda → derecha */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "linear-gradient(to right, #08091c 0%, #08091c 2%, rgba(8,9,28,0.85) 30%, rgba(8,9,28,0.4) 70%, rgba(8,9,28,0.08) 78%, transparent 100%)" }}
        />

        {/* ── Form: flota sobre el gradiente ── */}
        <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-between w-110 px-12 py-10 ">

          {/* Logo */}
          <div className="slide-1 flex items-center gap-2.5">
            <img src="/assets/logo.png" alt="Codexa" className="h-5.5 " />
            <span className="text-[15px] font-semibold text-[#70a6ee] tracking-tight" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Codexa
            </span>
          </div>

          {/* Form area */}
          <div className="flex flex-col gap-8">

            <div className="slide-2">
              <h1 className="text-[28px] font-bold text-[#f1f5f9] leading-tight tracking-tight m-0">
                Bienvenido de vuelta
              </h1>
              <p className="text-[14px] text-gray-300 mt-2 m-0 leading-relaxed">
                Acceso exclusivo al equipo de desarrollo.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">

              <div className="slide-3 flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1565c0] pointer-events-none flex">
                    <Lock size={15} />
                  </div>
                  <input
                    className={`l-input${error ? " border-red-500/40!" : ""}`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                    placeholder="Ingresa la contraseña del equipo"
                    required
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button type="button" className="l-eye" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="err-shake flex items-center gap-2 text-[13px] text-red-400 bg-red-500/6 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              <div className="slide-4 mt-1">
                <button type="submit" disabled={loading} className="l-btn">
                  {loading
                    ? <><span className="spinner w-4 h-4 border-2 border-white/20 border-t-white rounded-full inline-block" /> Verificando…</>
                    : <>Acceder <ArrowRight size={15} /></>
                  }
                </button>
              </div>

            </form>
          </div>

          {/* Footer */}
          <p className="slide-5 text-[11px] text-[#1e293b] tracking-wide">
            Acceso restringido · solo equipo interno
          </p>
        </div>

        {/* ── Badges flotantes sobre el canvas ── */}

       

        {BADGES.map(b => (
          <div
            key={b.label}
            className="badge absolute z-10 pointer-events-none flex items-center gap-1.5 text-[11px] font-medium text-white/70"
            style={{ top: b.top, right: b.right, "--dur": b.dur, "--delay": b.delay } as React.CSSProperties}
          >
            <img src={b.img} alt={b.label} className="w-4 h-4 object-contain opacity-75" />
            {b.label}
          </div>
        ))}

        
  

        {/* Branding inferior derecha */}
<div className="absolute top-10 right-12 z-10 pointer-events-none">
  <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-white/90">
    Donde el código{" "}
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(135deg, #818cf8, #60a5fa)",
      }}
    >
      cobra vida.
    </span>
  </h2>
</div>


        {/* Metric cards */}
        <div className="absolute bottom-10 right-12 z-10 pointer-events-none flex gap-3">
          {[
            { value: "100%", label: "Equipo activo" },
            { value: "∞",    label: "Snippets"      },
            { value: "24/7", label: "Disponible"    },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                animation: `slideUp 0.5s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.1}s both`,
              }}
            >
              <span className="text-[20px] font-bold text-white leading-none">{s.value}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
