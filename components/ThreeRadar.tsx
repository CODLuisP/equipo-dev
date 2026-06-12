"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeRadar({
  onlineCount = 0,
  afkCount = 0,
}: {
  onlineCount: number;
  afkCount: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Cámara isométrica/inclinada
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, -18, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ─── Anillos del radar ───
    const rings = new THREE.Group();
    for (let i = 1; i <= 3; i++) {
      const geo = new THREE.RingGeometry(i * 3.5, i * 3.5 + 0.05, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.15 / i,
        side: THREE.DoubleSide,
      });
      rings.add(new THREE.Mesh(geo, mat));
    }
    group.add(rings);

    // ─── Línea de barrido (Sweeper) ───
    const sweeperGeo = new THREE.PlaneGeometry(0.3, 11);
    sweeperGeo.translate(0, 5.5, 0); // Anclar en el centro
    const sweeperMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const sweeper = new THREE.Mesh(sweeperGeo, sweeperMat);
    group.add(sweeper);

    // ─── Gradiente debajo del sweeper (Haz de luz) ───
    const coneGeo = new THREE.RingGeometry(0, 11, 32, 1, 0, Math.PI / 4);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    // El RingGeometry empieza en el eje X (derecha). Lo rotamos para que alinee con el sweeper
    cone.rotation.z = -Math.PI / 8;
    sweeper.add(cone);

    // ─── Puntos (Usuarios) ───
    const particles = new THREE.Group();
    group.add(particles);

    const createDot = (colorHex: number, distance: number) => {
      const geo = new THREE.SphereGeometry(0.4, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(geo, mat);
      const theta = Math.random() * Math.PI * 2;
      mesh.position.set(distance * Math.cos(theta), distance * Math.sin(theta), 0);
      particles.add(mesh);
    };

    // Agregar puntos online (Verdes)
    for (let i = 0; i < onlineCount; i++) {
      createDot(0x10b981, Math.random() * 8 + 2);
    }
    // Agregar puntos AFK (Naranjas/Rojos)
    for (let i = 0; i < afkCount; i++) {
      createDot(0xf43f5e, Math.random() * 8 + 2);
    }

    // ─── Animación ───
    let animationFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotación del radar
      sweeper.rotation.z -= 0.03;
      rings.rotation.z += 0.002;

      // Latido de los puntos
      particles.children.forEach((p, i) => {
        const scale = 1 + Math.sin(elapsedTime * 3 + i) * 0.2;
        p.scale.set(scale, scale, scale);
      });

      // Flotación de toda la escena
      group.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;
      group.rotation.y = Math.cos(elapsedTime * 0.3) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize ───
    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      // dispose other resources in a real app, simplified here
    };
  }, [onlineCount, afkCount]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  );
}
