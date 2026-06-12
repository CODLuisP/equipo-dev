"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeParticles({
  colorHex = 0xf43f5e,
}: {
  colorHex?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Cámara frontal para ver el campo de partículas
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // ─── Partículas (Luciérnagas/Polvo espacial) ───
    const particleCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Posiciones aleatorias en un área amplia
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Material con glow
    const material = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ─── Animación ───
    let animationFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mover suavemente las partículas
      const positions = geometry.attributes.position.array as Float32Array;
      const phases = geometry.attributes.phase.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Movimiento oscilante tipo "respiración"
        positions[i * 3 + 1] += Math.sin(elapsedTime * 0.5 + phases[i]) * 0.01;
        positions[i * 3] += Math.cos(elapsedTime * 0.3 + phases[i]) * 0.005;
      }
      geometry.attributes.position.needsUpdate = true;

      // Rotación muy lenta de todo el campo
      points.rotation.y = elapsedTime * 0.05;
      points.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;

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
      geometry.dispose();
      material.dispose();
    };
  }, [colorHex]);

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
        opacity: 0.5,
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    />
  );
}
