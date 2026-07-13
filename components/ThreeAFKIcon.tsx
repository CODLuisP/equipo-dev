"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeAFKIcon({
  iconKey,
  colorHex,
  size = 40,
}: {
  iconKey: string;
  colorHex: string | number;
  size?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Limpieza agresiva para React Fast Refresh
    mountRef.current.innerHTML = '';

    const w = size;
    const h = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // Color base
    const baseColor = new THREE.Color(colorHex);
    const mat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.3, metalness: 0.2 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    // Animators array
    const animators: ((time: number) => void)[] = [];

    if (iconKey === "coffee") {
      // Taza
      const cupGeo = new THREE.CylinderGeometry(0.8, 0.6, 1.5, 32);
      const cup = new THREE.Mesh(cupGeo, mat);
      cup.position.y = -0.2;
      group.add(cup);

      // Asa
      const handleGeo = new THREE.TorusGeometry(0.4, 0.12, 16, 32);
      const handle = new THREE.Mesh(handleGeo, mat);
      handle.position.set(0.8, -0.2, 0);
      group.add(handle);

      // Humo (Partículas)
      const smokeParticles: { mesh: THREE.Mesh; phase: number; speed: number }[] = [];
      const smokeGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const smokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(smokeGeo, smokeMat);
        group.add(p);
        smokeParticles.push({ mesh: p, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 });
      }

      animators.push((time) => {
        group.rotation.y = time * 0.5;
        smokeParticles.forEach((sp, i) => {
          const t = (time * sp.speed + sp.phase) % 2; // Loop from 0 to 2
          sp.mesh.position.y = 0.5 + t * 1.5;
          sp.mesh.position.x = Math.sin(time * 2 + i) * 0.3;
          sp.mesh.scale.setScalar(Math.max(0, 1 - t / 2));
          (sp.mesh.material as THREE.Material).opacity = Math.max(0, 0.6 - t * 0.3);
        });
      });
    } 
    else if (iconKey === "bathroom") {
      // Inodoro minimalista
      const tankGeo = new THREE.BoxGeometry(1.2, 1.2, 0.6);
      const tank = new THREE.Mesh(tankGeo, mat);
      tank.position.set(0, 0.6, -0.5);
      group.add(tank);

      const bowlGeo = new THREE.CylinderGeometry(0.6, 0.5, 1, 32);
      const bowl = new THREE.Mesh(bowlGeo, mat);
      bowl.position.set(0, -0.2, 0.2);
      group.add(bowl);

      const seatGeo = new THREE.TorusGeometry(0.6, 0.15, 16, 32);
      const seat = new THREE.Mesh(seatGeo, mat);
      seat.rotation.x = Math.PI / 2;
      seat.position.set(0, 0.3, 0.2);
      group.add(seat);

      // Gotas de agua flotando alrededor
      const drops: THREE.Mesh[] = [];
      for(let i=0; i<3; i++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({color: 0x60a5fa}));
        group.add(drop);
        drops.push(drop);
      }

      animators.push((time) => {
        group.rotation.y = Math.sin(time * 0.5) * 0.5;
        drops.forEach((d, i) => {
           d.position.y = Math.sin(time * 2 + i * 2) * 0.3 + 0.5;
           d.position.x = Math.cos(time * 1.5 + i) * 1.2;
           d.position.z = Math.sin(time * 1.5 + i) * 1.2;
        });
      });
    }
    else if (iconKey === "food") {
      // Hamburguesa animada
      const topBunGeo = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const topBun = new THREE.Mesh(topBunGeo, mat); // Usa el color del status
      group.add(topBun);

      const meatGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.3, 32);
      const meat = new THREE.Mesh(meatGeo, darkMat);
      group.add(meat);

      const botBunGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
      const botBun = new THREE.Mesh(botBunGeo, mat);
      group.add(botBun);

      animators.push((time) => {
        group.rotation.y = time * 0.8;
        group.rotation.z = Math.sin(time) * 0.1;
        // Bouncing effect
        const bounce = Math.sin(time * 3);
        topBun.position.y = 0.5 + Math.max(0, bounce * 0.2);
        meat.position.y = 0;
        botBun.position.y = -0.4 - Math.max(0, bounce * 0.1);
      });
    }
    else if (iconKey === "call") {
      // ── Cuerpo del smartphone ──────────────────────────────
      // Marco exterior (cuerpo oscuro con bordes redondeados simulados)
      const bodyGeo = new THREE.BoxGeometry(1.1, 2.0, 0.12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.3, metalness: 0.6 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Pantalla (ligeramente más pequeña que el cuerpo)
      const screenGeo = new THREE.PlaneGeometry(0.92, 1.78);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x0a1628 }); // azul oscuro = pantalla activa
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.065;
      group.add(screen);

      // ── Speaker grill (ranura en la parte superior) ────────
      const grillGeo = new THREE.BoxGeometry(0.3, 0.06, 0.02);
      const grillMat = new THREE.MeshBasicMaterial({ color: 0x333355 });
      const grill = new THREE.Mesh(grillGeo, grillMat);
      grill.position.set(0, 0.82, 0.07);
      group.add(grill);

      // ── Botón verde de llamada (círculo en pantalla) ───────
      const btnGeo = new THREE.CircleGeometry(0.22, 32);
      const btnMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // verde vivo
      const btn = new THREE.Mesh(btnGeo, btnMat);
      btn.position.set(0, -0.55, 0.07);
      group.add(btn);

      // Ícono de teléfono dentro del botón (círculo blanco pequeño como indicador)
      const phoneDotGeo = new THREE.CircleGeometry(0.07, 16);
      const phoneDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const phoneDot = new THREE.Mesh(phoneDotGeo, phoneDotMat);
      phoneDot.position.set(0, -0.55, 0.072);
      group.add(phoneDot);

      // ── Barras de audio animadas (3 barras en pantalla) ────
      const barMats: THREE.MeshBasicMaterial[] = [];
      const bars: THREE.Mesh[] = [];
      const barHeights = [0.25, 0.4, 0.25];
      const barOffsets = [-0.18, 0, 0.18];
      barHeights.forEach((h, i) => {
        const barGeo = new THREE.PlaneGeometry(0.1, h);
        const bMat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.9 });
        const bar = new THREE.Mesh(barGeo, bMat);
        bar.position.set(barOffsets[i], 0.1, 0.071);
        group.add(bar);
        bars.push(bar);
        barMats.push(bMat);
      });

      // ── Anillos de señal saliendo del teléfono ─────────────
      const rings: { mesh: THREE.Mesh; offset: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const rGeo = new THREE.RingGeometry(0.7 + i * 0.22, 0.78 + i * 0.22, 48);
        const rMat = new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.position.set(0, 0, 0.066);
        group.add(ring);
        rings.push({ mesh: ring, offset: i * 0.6 });
      }

      animators.push((time) => {
        // Leve balanceo del teléfono (como si alguien lo sostuviera)
        group.rotation.y = Math.sin(time * 0.7) * 0.2;
        group.rotation.z = Math.sin(time * 0.5) * 0.04;
        group.position.y = Math.sin(time * 1.2) * 0.06 - 0.1;

        // Barras de audio pulsando (cada una con frecuencia distinta)
        const freqs = [2.1, 3.3, 1.7];
        bars.forEach((bar, i) => {
          const scaleY = 0.6 + Math.abs(Math.sin(time * freqs[i] + i * 1.2)) * 1.4;
          bar.scale.y = scaleY;
        });

        // Botón verde pulsando sutilmente
        const btnPulse = 0.95 + Math.sin(time * 2.5) * 0.07;
        btn.scale.setScalar(btnPulse);

        // Ondas de señal expandiéndose desde el teléfono
        rings.forEach(({ mesh, offset }) => {
          const t = (time * 0.9 + offset) % 2.2;
          const progress = t / 2.2;
          mesh.scale.setScalar(1 + progress * 1.1);
          (mesh.material as THREE.MeshBasicMaterial).opacity =
            Math.max(0, 0.5 * (1 - progress));
        });
      });
    }
    else if (iconKey === "rest") {
      // Luna
      const moonGeo = new THREE.TorusGeometry(0.8, 0.3, 16, 32, Math.PI);
      const moon = new THREE.Mesh(moonGeo, mat);
      moon.rotation.z = Math.PI / 4;
      group.add(moon);

      // Zzz partículas (esferitas)
      const zzz: THREE.Mesh[] = [];
      for(let i=0; i<3; i++){
        const z = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
        group.add(z);
        zzz.push(z);
      }

      animators.push((time) => {
        moon.rotation.y = Math.sin(time) * 0.3;
        moon.rotation.x = Math.sin(time * 0.8) * 0.2;
        
        zzz.forEach((z, i) => {
          const t = (time * 0.5 + i * 0.6) % 2;
          z.position.y = t * 1.5;
          z.position.x = 0.5 + Math.sin(time * 3 + i) * 0.3;
          z.scale.setScalar(t * 1.5);
          (z.material as THREE.Material).opacity = 1 - (t / 2);
        });
      });
    }
    else if (iconKey === "out") {
      // Platillo volador (UFO abduciendo)
      const ufo = new THREE.Group();

      // Disco del OVNI
      const saucerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32);
      const saucer = new THREE.Mesh(saucerGeo, mat);
      ufo.add(saucer);

      // Cúpula de cristal (Usamos el baseColor pero más brillante)
      const domeGeo = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.1 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 0.1;
      ufo.add(dome);

      // Haz de luz (Teletransporte)
      const beamGeo = new THREE.CylinderGeometry(0.1, 1.2, 2.5, 32);
      // Trasladar pivot a la punta superior
      beamGeo.translate(0, -1.25, 0);
      const beamMat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      ufo.add(beam);

      group.add(ufo);

      // Pequeña esfera (representa a la persona) siendo abducida
      const personGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const person = new THREE.Mesh(personGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
      group.add(person);

      animators.push((time) => {
        // Movimiento flotante del OVNI
        ufo.position.y = Math.sin(time * 2) * 0.2 + 0.8;
        ufo.rotation.y = time * 2;
        ufo.rotation.z = Math.sin(time * 1.5) * 0.1;
        ufo.rotation.x = Math.cos(time * 1.5) * 0.1;

        // Haz de luz latiendo
        (beam.material as THREE.Material).opacity = 0.3 + Math.sin(time * 15) * 0.15;

        // Ciclo de abducción de la "persona"
        const t = (time * 0.8) % 1; // Ciclo de 0 a 1
        person.position.y = -1.2 + t * 2.2; // Sube por el haz de luz
        person.rotation.y = time * 10; // Gira rápidamente
        person.scale.setScalar(Math.max(0, 1 - (t * 0.5))); // Se hace más pequeña mientras sube

        if (t > 0.8) {
           (person.material as THREE.Material).opacity = 1 - ((t - 0.8) * 5); // Desaparece al entrar
        } else {
           (person.material as THREE.Material).opacity = 1;
        }
      });
    }
    else {
      // Online o Genérico: Radar de pulsos (esfera latiendo)
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), mat);
      group.add(center);

      const aura = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.4, side: THREE.BackSide }));
      group.add(aura);

      animators.push((time) => {
        const scale = 1 + Math.sin(time * 4) * 0.1;
        center.scale.setScalar(scale);
        
        const auraScale = 1 + (time * 2 % 1) * 1.5;
        aura.scale.setScalar(auraScale);
        (aura.material as THREE.Material).opacity = Math.max(0, 0.5 - (time * 2 % 1) * 0.5);
      });
    }

    // Centrar
    group.position.y = -0.2;

    const clock = new THREE.Clock();
    let animationFrame: number | null = null;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      animators.forEach(a => a(time));
      renderer.render(scene, camera);
    };
    const startLoop = () => { if (animationFrame === null) animate(); };
    const stopLoop = () => { if (animationFrame !== null) { cancelAnimationFrame(animationFrame); animationFrame = null; } };

    // No malgastar GPU/CPU renderizando un ícono decorativo cuando no está visible
    // (ej. el panel de DevToolkit oculto vía CSS, o la pestaña del navegador en segundo plano).
    let isIntersecting = true;
    const syncLoop = () => {
      if (isIntersecting && !document.hidden) startLoop(); else stopLoop();
    };
    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      syncLoop();
    }, { threshold: 0 });
    if (mountRef.current) io.observe(mountRef.current);
    document.addEventListener('visibilitychange', syncLoop);

    startLoop();

    const domElement = renderer.domElement;

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', syncLoop);
      if (domElement && domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [iconKey, colorHex, size]);

  return <div ref={mountRef} style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />;
}
