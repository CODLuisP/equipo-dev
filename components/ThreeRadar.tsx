"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface RadarMember {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
  isAFK: boolean;
  statusText?: string;
  iconKey?: string;
}

// Deterministic positioning based on user ID to keep positions stable
const getDeterministicPosition = (id: string, index: number, total: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Distribute angles evenly with some hash-based jitter
  const baseAngle = total > 0 ? (index / total) * Math.PI * 2 : 0;
  const jitterAngle = ((Math.abs(hash) % 100) / 100) * (Math.PI / 4) - (Math.PI / 8); // +/- 22.5 deg
  const angle = baseAngle + jitterAngle;
  
  // Concentric bands to prevent cluttering
  const band = index % 3; // 3 bands: close, mid, far
  const minD = [3.2, 5.5, 7.8][band];
  const maxD = [5.0, 7.2, 9.5][band];
  const distance = minD + ((Math.abs(hash >> 3) % 100) / 100) * (maxD - minD);
  
  return { angle, distance };
};

// Generate high-quality text sprite for member labels
const createTextSprite = (text: string, color: string, isMe = false) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Sprite();
  
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = "bold 24px 'JetBrains Mono', monospace";
  
  // Text shadow / glow outline
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  
  ctx.strokeStyle = "rgba(10, 15, 30, 0.95)";
  ctx.lineWidth = 5;
  ctx.strokeText(text, 128, 32);
  
  // Text fill
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "transparent";
  ctx.fillText(text, 128, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3, 0.75, 1);
  return sprite;
};

export default function ThreeRadar({
  members = [],
  currentUser = null,
}: {
  members: RadarMember[];
  currentUser: any;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sweeperAngleRef = useRef<number>(0); // Store sweeper angle to prevent jumps on props update

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Clear mount point (React Fast Refresh safety)
    mountRef.current.innerHTML = '';

    const w = mountRef.current.clientWidth || 320;
    const h = mountRef.current.clientHeight || 220;

    const scene = new THREE.Scene();
    
    // Isometric camera tilted over the plane
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, -17, 13);
    camera.lookAt(0, 0, 0.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ─── Polar Grid (Radar Crosshairs) ───
    const polarGrid = new THREE.PolarGridHelper(10.5, 12, 4, 64, 0x3b82f6, 0x1d4ed8);
    polarGrid.rotation.x = Math.PI / 2;
    polarGrid.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        child.material.transparent = true;
        child.material.opacity = 0.12;
        child.material.depthWrite = false;
      }
    });
    group.add(polarGrid);

    // Coordinate axis lines (X and Y cross)
    const axisMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.08,
      depthWrite: false
    });
    
    const xGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-11, 0, 0),
      new THREE.Vector3(11, 0, 0)
    ]);
    const xAxis = new THREE.Line(xGeo, axisMat);
    
    const yGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -11, 0),
      new THREE.Vector3(0, 11, 0)
    ]);
    const yAxis = new THREE.Line(yGeo, axisMat);
    group.add(xAxis, yAxis);

    // Concentric Ring borders
    const rings = new THREE.Group();
    for (let i = 1; i <= 3; i++) {
      const geo = new THREE.RingGeometry(i * 3.4, i * 3.4 + 0.04, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.18 / i,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      rings.add(new THREE.Mesh(geo, mat));
    }
    group.add(rings);

    // ─── Sweeper Line & Gradient Light Cone ───
    const sweeperGeo = new THREE.PlaneGeometry(0.2, 10.5);
    sweeperGeo.translate(0, 5.25, 0); // Anchor at origin
    const sweeperMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sweeper = new THREE.Mesh(sweeperGeo, sweeperMat);
    sweeper.rotation.z = sweeperAngleRef.current; // Restore previous rotation
    group.add(sweeper);

    // Sweeping beam visual (45-degree sector)
    const coneGeo = new THREE.RingGeometry(0, 10.5, 32, 1, 0, Math.PI / 4);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.z = -Math.PI / 8; // Center it on the sweeper line
    sweeper.add(cone);

    // ─── Members Particles & Labels ───
    const particles = new THREE.Group();
    group.add(particles);

    // Combine me (at center) with rest of the team
    const allRenderMembers = [
      ...(currentUser ? [{
        ...currentUser,
        isMe: true,
        isOnline: true,
        isAFK: false,
        name: "TÚ"
      }] : []),
      ...members.map(m => ({ ...m, isMe: false }))
    ];

    const activeNodes: {
      mesh: THREE.Mesh;
      line: THREE.Line | null;
      shadow: THREE.Mesh;
      sprite: THREE.Sprite;
      angle: number;
      distance: number;
      isMe: boolean;
      isOnline: boolean;
      intensity: number;
    }[] = [];

    const nonMeMembers = allRenderMembers.filter(m => !m.isMe);
    const totalNonMe = nonMeMembers.length;

    allRenderMembers.forEach((member, idx) => {
      let angle = 0;
      let distance = 0;

      if (member.isMe) {
        angle = 0;
        distance = 0;
      } else {
        const nonMeIdx = nonMeMembers.findIndex(m => m.id === member.id);
        const pos = getDeterministicPosition(member.id, nonMeIdx >= 0 ? nonMeIdx : idx, totalNonMe);
        angle = pos.angle;
        distance = pos.distance;
      }

      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);
      const zHeight = 0.8; // Floating node height

      // Colors: cyan for Me, green for Online, orange for AFK, gray for Offline
      let colorHex = 0x64748b; // offline
      if (member.isMe) colorHex = 0x00f3ff;
      else if (member.isOnline) {
        colorHex = member.isAFK ? 0xf59e0b : 0x10b981;
      }

      const color = new THREE.Color(colorHex);

      // 1. Sphere Mesh
      const sphereGeo = new THREE.SphereGeometry(member.isMe ? 0.35 : 0.28, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: member.isMe ? 0.95 : member.isOnline ? 0.85 : 0.25,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, y, zHeight);
      particles.add(sphere);

      // 2. Dropline (floating anchor)
      let line: THREE.Line | null = null;
      if (!member.isMe) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y, 0),
          new THREE.Vector3(x, y, zHeight)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: member.isOnline ? 0.2 : 0.05,
          depthWrite: false
        });
        line = new THREE.Line(lineGeo, lineMat);
        particles.add(line);
      }

      // 3. Shadow base ring
      const shadowGeo = new THREE.RingGeometry(0.12, 0.18, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: member.isMe ? 0.4 : member.isOnline ? 0.25 : 0.08,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.position.set(x, y, 0.005);
      particles.add(shadow);

      // 4. Sprite label
      const nameColorStr = member.isMe ? "#00f3ff" : member.isOnline ? (member.isAFK ? "#f59e0b" : "#10b981") : "#64748b";
      const sprite = createTextSprite(member.name.split(" ")[0], nameColorStr, member.isMe);
      sprite.position.set(x, y, zHeight + 0.52);
      sprite.material.opacity = member.isMe ? 0.9 : member.isOnline ? 0.55 : 0.12;
      particles.add(sprite);

      activeNodes.push({
        mesh: sphere,
        line,
        shadow,
        sprite,
        angle,
        distance,
        isMe: !!member.isMe,
        isOnline: !!member.isOnline,
        intensity: 0
      });
    });

    // ─── Animation Loop ───
    let animationFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Sweeper rotation (clockwise)
      sweeper.rotation.z -= 0.022;
      sweeperAngleRef.current = sweeper.rotation.z;

      // Extract normalized sweep angle in [0, 2PI]
      let sweepAngle = sweeper.rotation.z % (Math.PI * 2);
      if (sweepAngle < 0) sweepAngle += Math.PI * 2;

      activeNodes.forEach((node) => {
        // Floating movement (fine vertical offset)
        const floatOffset = Math.sin(elapsedTime * 2.5 + node.angle) * 0.06;
        node.mesh.position.z = 0.8 + floatOffset;
        node.sprite.position.z = 0.8 + 0.52 + floatOffset;

        if (node.line) {
          const positions = node.line.geometry.attributes.position.array as Float32Array;
          positions[5] = node.mesh.position.z;
          node.line.geometry.attributes.position.needsUpdate = true;
        }

        // Radar ping collision checks
        if (!node.isMe) {
          let diff = sweepAngle - node.angle;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // normalize to [-PI, PI]

          // Clockwise sweeper scans when diff is between 0 and 0.55 radians (approx 30 deg sector)
          const isScanning = diff >= 0 && diff <= 0.55;
          if (isScanning) {
            node.intensity = 1.0;
          } else {
            node.intensity = Math.max(0, node.intensity - 0.012); // smooth fade
          }

          // Scale particle on ping
          const scale = 1 + node.intensity * 0.75;
          node.mesh.scale.set(scale, scale, scale);

          // Projected shadow grows on sweep
          const shadowScale = 1 + node.intensity * 1.6;
          node.shadow.scale.set(shadowScale, shadowScale, 1);
          
          // Light up sprite label and lines on sweep
          node.sprite.material.opacity = (node.isOnline ? 0.55 : 0.12) + node.intensity * 0.45;
          if (node.line) {
            (node.line.material as THREE.Material).opacity = (node.isOnline ? 0.2 : 0.05) + node.intensity * 0.35;
          }
          (node.shadow.material as THREE.Material).opacity = (node.isOnline ? 0.25 : 0.08) + node.intensity * 0.45;
        } else {
          // Me node pulsing halo
          const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.08;
          node.mesh.scale.set(pulse, pulse, pulse);
          node.sprite.material.opacity = 0.85 + Math.sin(elapsedTime * 2.0) * 0.1;
        }
      });

      // Subtle global camera float
      camera.position.x = Math.sin(elapsedTime * 0.4) * 0.35;
      camera.position.y = -17 + Math.cos(elapsedTime * 0.3) * 0.25;
      camera.lookAt(0, 0, 0.4);

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize listener ───
    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    // ─── Resource Disposal ───
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose materials and geometries to prevent memory leaks
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        } else if (object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        } else if (object instanceof THREE.Sprite) {
          object.material.dispose();
          if (object.material.map) object.material.map.dispose();
        }
      });
      renderer.dispose();
    };
  }, [members, currentUser]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
