'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────
// Three.js sphere — extracted from Hero so it can be lazy-loaded via
// next/dynamic. Drops the homepage initial bundle from ~232kB to ~110kB.
// ─────────────────────────────────────────────────────────────────────────

export default function ThreeSphere() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.opacity = '0.9';
    canvas.style.pointerEvents = 'none';
    wrapRef.current?.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // Fibonacci-distributed dot sphere
    const sphereGroup = new THREE.Group();
    const N = window.innerWidth < 768 ? 1800 : 5000;
    const radius = 2.6;
    const positions = new Float32Array(N * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      positions[i * 3]     = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x8B5CF6, size: 0.022, transparent: true, opacity: 0.85 });
    sphereGroup.add(new THREE.Points(geo, mat));

    // Two orbital rings
    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(2.92, 2.94, 128),
      new THREE.MeshBasicMaterial({ color: 0xC084FC, side: THREE.DoubleSide, transparent: true, opacity: 0.45 }),
    );
    ring1.rotation.x = Math.PI / 2.3;
    sphereGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(3.25, 3.26, 128),
      new THREE.MeshBasicMaterial({ color: 0x8B5CF6, side: THREE.DoubleSide, transparent: true, opacity: 0.28 }),
    );
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 4;
    sphereGroup.add(ring2);

    scene.add(sphereGroup);

    // Background stars
    const starN = 300;
    const sPos = new Float32Array(starN * 3);
    for (let i = 0; i < starN; i++) {
      sPos[i * 3]     = (Math.random() - 0.5) * 32;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      sPos[i * 3 + 2] = -10 + (Math.random() - 0.5) * 6;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const stars = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({ color: 0xE5E7EB, size: 0.04, transparent: true, opacity: 0.6 }),
    );
    scene.add(stars);

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const pulses: Array<{ time: number }> = [];
    const onClick = () => { pulses.push({ time: performance.now() }); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    let visible = true;
    const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    if (wrapRef.current) obs.observe(wrapRef.current);

    let raf = 0;
    const BASE_SPEED_X = 0.0015;
    const BASE_SPEED_Y = 0.0022;
    const animate = () => {
      if (visible) {
        sphereGroup.rotation.x += BASE_SPEED_X + my * 0.0008;
        sphereGroup.rotation.y += BASE_SPEED_Y + mx * 0.0008;
        ring1.rotation.z += 0.003;
        ring2.rotation.z -= 0.0022;
        stars.rotation.z += 0.0003;

        const now = performance.now();
        let scale = 1;
        for (let i = pulses.length - 1; i >= 0; i--) {
          const age = (now - pulses[i].time) / 800;
          if (age >= 1) pulses.splice(i, 1);
          else scale += Math.sin(age * Math.PI) * 0.04;
        }
        sphereGroup.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      obs.disconnect();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={wrapRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
