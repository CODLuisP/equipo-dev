"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import * as THREE from "three";

const USERS = [
  { username: "dev", password: "velsat" },
  { username: "admin", password: "dev2025" },
];

/* ─────────────────────────────────────────────
   Three.js helpers (same as WhoAreYouScreen)
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
export default function LoginPage() {
  const router        = useRouter();
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = sessionStorage.getItem("equipo_dev_session");
    if (s) router.replace("/dashboard");
  }, [router]);

  /* Three.js scene — right panel */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
  }, [mounted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const match = USERS.find(u => u.username === username.trim().toLowerCase() && u.password === password);
    if (match) {
      sessionStorage.setItem("equipo_dev_session", JSON.stringify({ user: match.username, at: Date.now() }));
      router.push("/dashboard");
    } else {
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    background: "rgba(8,10,20,0.75)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.35)" : "rgba(37,99,235,0.18)"}`,
    borderRadius: 10, padding: "11px 14px", fontSize: 14,
    color: "#eef0fb", outline: "none", width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sweep   { 0% { top:-4px; } 100% { top:100%; } }
        @keyframes float   { 0%,100% { transform:translate(-50%,-52%); } 50% { transform:translate(-50%,-55%); } }
        .fade-up  { animation: fadeUp 0.55s ease both; }
        .delay-1  { animation-delay: 0.12s; }
        .login-input:focus {
          border-color: rgba(37,99,235,0.5) !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.10) !important;
        }
        @media (max-width: 1023px) {
          .login-card-back-1, .login-card-back-2 { display: none !important; }
          .login-card-main {
            background: transparent !important;
            border: none !important; box-shadow: none !important;
            padding: 8px 0 !important; border-radius: 0 !important;
          }
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#080a14", display:"flex", fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:"hidden" }}>

        {/* ── Left panel — image ── */}
        <div className="hidden lg:flex" style={{
          flex:"0 0 52%", position:"relative", overflow:"hidden", background:"#07091a",
        }}>
          <img src="/assets/equipodev.png" alt="Equipo Dev" style={{
            position:"absolute", top:"50%", left:"50%",
            width:"68%", height:"auto", objectFit:"contain", zIndex:2,
            filter:"drop-shadow(0 16px 52px rgba(37,99,235,0.32))",
            pointerEvents:"none",
            animation:"float 6s ease-in-out infinite",
          }} />
          <div style={{ position:"absolute", top:"38%", left:"50%", transform:"translate(-50%,-50%)", width:"65%", height:"50%", background:"radial-gradient(ellipse at center, rgba(37,99,235,0.16) 0%, transparent 70%)", filter:"blur(32px)", pointerEvents:"none", zIndex:1 }} />
          <div style={{ position:"absolute", inset:0, zIndex:1, backgroundImage:"radial-gradient(rgba(37,99,235,0.07) 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"30%", zIndex:3, background:"linear-gradient(to bottom, #07091a 15%, rgba(7,9,26,0.6) 60%, transparent 100%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%", zIndex:3, background:"linear-gradient(to top, #07091a 20%, rgba(7,9,26,0.6) 60%, transparent 100%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", left:0, right:0, height:2, zIndex:4, background:"linear-gradient(90deg, transparent, rgba(37,99,235,0.14) 40%, rgba(96,165,250,0.22) 50%, rgba(37,99,235,0.14) 60%, transparent)", animation:"sweep 8s linear infinite", pointerEvents:"none" }} />
          <div className="fade-up" style={{ position:"absolute", top:42, left:52, right:52, zIndex:5 }}>
            <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:38, fontWeight:800, color:"#eef0fb", margin:0, lineHeight:1.12, letterSpacing:"-0.8px" }}>
              Equipo{" "}
              <span style={{ background:"linear-gradient(135deg,#60a5fa,#93c5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Dev.</span>
            </h1>
            <p style={{ fontSize:13, color:"#8b91b8", marginTop:10, lineHeight:1.6, fontWeight:400 }}>Panel de gestión interna para el equipo de programadores.</p>
          </div>
          <div className="fade-up delay-1" style={{ position:"absolute", bottom:36, left:52, right:52, zIndex:5, display:"flex", alignItems:"center" }}>
            {[{value:"100%",label:"Equipo activo"},{value:"∞",label:"Snippets"},{value:"24/7",label:"Disponible"}].map((s,i)=>(
              <div key={s.label} style={{ display:"flex", alignItems:"center" }}>
                {i>0 && <div style={{ width:1, height:28, background:"rgba(37,99,235,0.2)", margin:"0 20px" }} />}
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:"#eef0fb", letterSpacing:"-0.4px" }}>{s.value}</div>
                  <div style={{ fontSize:9, color:"#3a4060", marginTop:2, letterSpacing:"0.1em", fontFamily:"'JetBrains Mono',monospace", textTransform:"uppercase" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel — Three.js + form ── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", background:"#080a14" }}>

          {/* Three.js canvas — fondo completo del panel derecho */}
          <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0 }} />

          {/* Gradiente para que el form sea legible sobre los personajes */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 80% at 50% 50%, rgba(8,10,20,0.55) 0%, rgba(8,10,20,0.82) 100%)", pointerEvents:"none", zIndex:1 }} />

          {/* Fade izquierdo que une con el panel izquierdo */}
          <div style={{ position:"absolute", top:0, left:0, bottom:0, width:"35%", background:"linear-gradient(to right, #07091a 0%, rgba(8,10,20,0.5) 55%, transparent 100%)", pointerEvents:"none", zIndex:2 }} />

          {/* Form */}
          <div style={{ width:"100%", maxWidth:360, position:"relative", zIndex:3 }}>
            <div className="fade-up delay-1" style={{ position:"relative" }}>

              {/* Capas inclinadas */}
              <div className="login-card-back-2" style={{ position:"absolute", inset:0, borderRadius:22, background:"rgba(29,78,216,0.28)", border:"1px solid rgba(37,99,235,0.18)", transform:"rotate(4deg) translate(8px,6px)", transformOrigin:"bottom center", zIndex:0 }} />
              <div className="login-card-back-1" style={{ position:"absolute", inset:0, borderRadius:22, background:"rgba(37,99,235,0.42)", border:"1px solid rgba(37,99,235,0.32)", transform:"rotate(2deg) translate(4px,3px)", transformOrigin:"bottom center", zIndex:1 }} />

              {/* Card principal */}
              <div className="login-card-main" style={{ position:"relative", zIndex:2, background:"rgba(10,13,28,0.92)", border:"1px solid rgba(37,99,235,0.22)", borderRadius:22, padding:"36px 32px 32px", boxShadow:"0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.06)", backdropFilter:"blur(20px)" }}>

                <div style={{ marginBottom:28 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <img src="/assets/logo.png" alt="Logo" style={{ height:26, width:"auto" }} />
                    <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:22, fontWeight:800, color:"#eef0fb", margin:0, letterSpacing:"-0.5px" }}>Iniciar sesión</h2>
                  </div>
                  <p style={{ fontSize:12, color:"#4a5570", margin:0 }}>Accede al panel de gestión del equipo</p>
                </div>

                <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:"#8b91b8" }}>Usuario</label>
                    <input className="login-input" type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="tu usuario" required autoComplete="username" style={inputStyle(!!error)} />
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <label style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:"#8b91b8" }}>Contraseña</label>
                    <div style={{ position:"relative" }}>
                      <input className="login-input" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" style={{ ...inputStyle(!!error), padding:"11px 42px 11px 14px" }} />
                      <button type="button" onClick={()=>setShowPassword(!showPassword)}
                        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#4a5070", display:"flex", padding:0, transition:"color 0.15s" }}
                        onMouseEnter={e=>{e.currentTarget.style.color="#60a5fa";}}
                        onMouseLeave={e=>{e.currentTarget.style.color="#4a5070";}}>
                        {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"10px 13px", fontSize:12, color:"#f87171", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"#ef4444", flexShrink:0 }} />{error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ marginTop:6, background:loading?"rgba(37,99,235,0.35)":"#2563eb", border:"none", borderRadius:12, padding:"13px 20px", color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.15s, transform 0.15s, box-shadow 0.15s", width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 20px rgba(37,99,235,0.35)" }}
                    onMouseEnter={e=>{if(!loading){e.currentTarget.style.background="#1d4ed8";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(37,99,235,0.55)";}}}
                    onMouseLeave={e=>{e.currentTarget.style.background=loading?"rgba(37,99,235,0.35)":"#2563eb";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 20px rgba(37,99,235,0.35)";}}
                    onMouseDown={e=>{if(!loading)e.currentTarget.style.transform="translateY(0)";}}>
                    {loading
                      ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.25)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />Verificando…</>
                      : <>Acceder <ArrowRight size={15} strokeWidth={2.5}/></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
