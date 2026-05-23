// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · HOMEPAGE HERO V2
// Phase 1.1 — the centrepiece. Three.js sphere + Arora avatar + magnetic
// CTAs + animated stat counters + bento features grid teaser.
// Self-serve first: primary CTA is the ROI Audit; Calendly nowhere here.
//
// Visual layers (back → front):
//   1. CSS aurora gradients (radial blurs)
//   2. Three.js canvas (5000 Fibonacci dots + 300 starfield + 2 rings)
//   3. CSS grid overlay (radial mask)
//   4. Hero content grid: text/CTAs/stats on left, Arora avatar on right
//   5. Bento features grid below the hero
//
// Performance:
//   - Three.js paused when hero leaves viewport (IntersectionObserver)
//   - prefers-reduced-motion: canvas hidden, CSS-only fallback
//   - DPR capped at 2 to protect mobile GPUs
//
// Assumes Three.js is loaded via CDN (r128). The component injects the
// script tag if window.THREE isn't present.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// ────── Helper: animated number counter ──────
function StatCounter({
  to,
  suffix = '',
  prefix = '',
  label,
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setVal(to); return; }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const tick = (t: number) => {
            const elapsed = t - start;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <div ref={ref} className="hv-stat">
      <div className="hv-stat-num">{prefix}{val}{suffix}</div>
      <div className="hv-stat-lbl">{label}</div>
    </div>
  );
}

// ────── Helper: magnetic button ──────
function MagneticButton({
  children,
  className = '',
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState('');
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (reduced.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < 100) {
      setT(`translate(${x * 0.18}px, ${y * 0.18}px)`);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={() => setT('')}
      onClick={onClick}
      style={{ transform: t, transition: t ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {children}
    </button>
  );
}

// ────── Helper: Three.js sphere ──────
function ThreeSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;
    let renderer: any, scene: any, camera: any, sphereGroup: any, stars: any;
    let ring1: any, ring2: any;
    let mx = 0, my = 0;
    let visible = true;
    let pulses: Array<{ time: number; intensity: number }> = [];
    let cleanup = () => {};

    const init = () => {
      const THREE = (window as any).THREE;
      const canvas = canvasRef.current;
      if (!THREE || !canvas) return;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 8;

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);

      // Build 5000 Fibonacci dots
      sphereGroup = new THREE.Group();
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
      const mat = new THREE.PointsMaterial({
        color: 0x00D4FF,
        size: 0.022,
        transparent: true,
        opacity: 0.85,
      });
      sphereGroup.add(new THREE.Points(geo, mat));

      // Two orbital rings
      const rGeo1 = new THREE.RingGeometry(2.92, 2.94, 128);
      ring1 = new THREE.Mesh(
        rGeo1,
        new THREE.MeshBasicMaterial({ color: 0x00FFE5, side: THREE.DoubleSide, transparent: true, opacity: 0.45 }),
      );
      ring1.rotation.x = Math.PI / 2.3;
      sphereGroup.add(ring1);

      const rGeo2 = new THREE.RingGeometry(3.25, 3.26, 128);
      ring2 = new THREE.Mesh(
        rGeo2,
        new THREE.MeshBasicMaterial({ color: 0x00D4FF, side: THREE.DoubleSide, transparent: true, opacity: 0.28 }),
      );
      ring2.rotation.x = Math.PI / 1.7;
      ring2.rotation.y = Math.PI / 4;
      sphereGroup.add(ring2);

      scene.add(sphereGroup);

      // Starfield (300 particles)
      const starN = 300;
      const sPos = new Float32Array(starN * 3);
      for (let i = 0; i < starN; i++) {
        sPos[i * 3]     = (Math.random() - 0.5) * 32;
        sPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        sPos[i * 3 + 2] = -10 + (Math.random() - 0.5) * 6;
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      stars = new THREE.Points(
        sGeo,
        new THREE.PointsMaterial({ color: 0xD4E8F7, size: 0.04, transparent: true, opacity: 0.6 }),
      );
      scene.add(stars);

      // Cursor + click
      const onMouse = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const onClick = () => {
        pulses.push({ time: performance.now(), intensity: 1 });
      };
      window.addEventListener('mousemove', onMouse);
      window.addEventListener('click', onClick);

      // Pause when off-screen
      const obs = new IntersectionObserver(
        ([entry]) => { visible = entry.isIntersecting; },
        { threshold: 0 },
      );
      if (wrapperRef.current) obs.observe(wrapperRef.current);

      // Animate
      const BASE_SPEED_X = 0.0015;
      const BASE_SPEED_Y = 0.0022;
      const animate = () => {
        if (visible) {
          sphereGroup.rotation.x += BASE_SPEED_X + my * 0.0008;
          sphereGroup.rotation.y += BASE_SPEED_Y + mx * 0.0008;
          ring1.rotation.z += 0.003;
          ring2.rotation.z -= 0.0022;
          stars.rotation.z += 0.0003;

          // Click pulses — temporary scale up & fade
          const now = performance.now();
          let scale = 1;
          pulses = pulses.filter(p => {
            const age = (now - p.time) / 800;
            if (age >= 1) return false;
            const wave = Math.sin(age * Math.PI);
            scale += wave * 0.04 * p.intensity;
            return true;
          });
          sphereGroup.scale.set(scale, scale, scale);

          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouse);
        window.removeEventListener('click', onClick);
        obs.disconnect();
        try { renderer.dispose(); } catch {}
      };
    };

    if ((window as any).THREE) {
      init();
    } else {
      const existing = document.querySelector(`script[src="${THREE_CDN}"]`);
      if (existing) {
        existing.addEventListener('load', init);
      } else {
        const s = document.createElement('script');
        s.src = THREE_CDN;
        s.async = true;
        s.onload = init;
        document.head.appendChild(s);
      }
    }

    return () => cleanup();
  }, []);

  return (
    <div ref={wrapperRef} className="hv-canvas-wrap">
      <canvas ref={canvasRef} className="hv-canvas" />
    </div>
  );
}

// ────── Helper: Arora avatar ──────
function AroraAvatar() {
  return (
    <div className="hv-arora">
      <div className="hv-arora-name">Arora · AI CEO</div>
      <div className="hv-arora-rings">
        <div className="hv-arora-ring" />
        <div className="hv-arora-ring r2" />
        <div className="hv-arora-ring r3" />
      </div>
      <div className="hv-arora-orb">A</div>
      <div className="hv-arora-status">
        <span className="hv-arora-dot" /> Online · 24/7
      </div>
      <div className="hv-arora-stat hv-arora-stat-1">
        <span className="v">£3,573</span>
        <span className="k">Catalogue Value</span>
      </div>
      <div className="hv-arora-stat hv-arora-stat-2">
        <span className="v">5 wks</span>
        <span className="k">Avg Payback</span>
      </div>
    </div>
  );
}

// ────── Bento features grid (teaser for next sections) ──────
function BentoTeaser() {
  return (
    <div className="hv-bento">
      <a href="/roi-audit" className="hv-bento-card hv-bento-1">
        <div className="hv-bento-eyebrow">▸ Free · 60 sec</div>
        <h3>Get your ROI number before you commit a pound</h3>
        <p>Personalised report. Plan + product recs based on your stage.</p>
        <span className="hv-bento-link">Run the audit →</span>
      </a>
      <a href="/services" className="hv-bento-card hv-bento-2">
        <div className="hv-bento-eyebrow">▸ 11 services</div>
        <h3>From manual chaos to self-running systems</h3>
        <span className="hv-bento-link">Explore →</span>
      </a>
      <a href="/digital-products" className="hv-bento-card hv-bento-3">
        <div className="hv-bento-eyebrow">▸ £17 – £997</div>
        <h3>19 self-serve toolkits</h3>
        <span className="hv-bento-link">Browse →</span>
      </a>
      <a href="/case-studies" className="hv-bento-card hv-bento-4">
        <div className="hv-bento-eyebrow">▸ Proof</div>
        <h3>The numbers, across 6 industries</h3>
        <span className="hv-bento-link">Read cases →</span>
      </a>
      <a href="/pricing" className="hv-bento-card hv-bento-5">
        <div className="hv-bento-eyebrow">▸ 3 plans · GBP</div>
        <h3>Done-for-you when you're ready</h3>
        <span className="hv-bento-link">See pricing →</span>
      </a>
    </div>
  );
}

// ────── Main ──────
export function HomePage() {
  return (
    <main className="hv-root">
      <section className="hv-hero">
        <ThreeSphere />
        <div className="hv-grid-overlay" aria-hidden="true" />
        <div className="hv-aurora hv-aurora-1" aria-hidden="true" />
        <div className="hv-aurora hv-aurora-2" aria-hidden="true" />

        <div className="hv-content">
          <div className="hv-left">
            <div className="hv-eyebrow">
              <span className="hv-pulse" /> Arora · AI CEO · Online
            </div>
            <h1 className="hv-h1">
              Automate the boring.
              <br />
              <span className="hv-grad">Scale the important.</span>
            </h1>
            <p className="hv-sub">
              Aiprosol designs, builds, and runs the AI automations that reclaim 35+ hours a week
              for your team — so you can stop firefighting and start scaling. Self-serve from £17,
              or step up to a managed plan.
            </p>
            <div className="hv-ctas">
              <MagneticButton
                className="hv-btn hv-btn-primary"
                onClick={() => (window.location.href = '/roi-audit')}
                ariaLabel="Get your free ROI audit"
              >
                Get Your Free ROI Audit
                <span className="hv-arrow">→</span>
              </MagneticButton>
              <MagneticButton
                className="hv-btn hv-btn-secondary"
                onClick={() => (window.location.href = '/digital-products')}
                ariaLabel="Browse digital products"
              >
                Browse 19 Products
              </MagneticButton>
            </div>
            <div className="hv-stats">
              <StatCounter to={340} suffix="%" label="Avg ROI" />
              <StatCounter to={35} suffix="+" label="Hrs/Wk Saved" />
              <StatCounter to={19} label="Products" />
              <StatCounter to={11} label="AI Services" />
            </div>
          </div>
          <div className="hv-right">
            <AroraAvatar />
          </div>
        </div>
      </section>

      <section className="hv-bento-section">
        <BentoTeaser />
      </section>

      <style>{`
        /* ───────── Root ───────── */
        .hv-root { background: #0A1628; color: #D4E8F7; min-height: 100vh; font-family: 'DM Sans', system-ui, sans-serif; overflow-x: hidden; }

        /* ───────── Hero shell ───────── */
        .hv-hero { position: relative; min-height: 100vh; padding: 140px 48px 80px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        @media (max-width: 640px) { .hv-hero { padding: 120px 20px 60px; } }

        /* Three.js canvas */
        .hv-canvas-wrap { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .hv-canvas { width: 100%; height: 100%; opacity: 0.9; }

        /* Grid overlay */
        .hv-grid-overlay { position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: linear-gradient(rgba(30,58,95,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.18) 1px, transparent 1px);
          background-size: 60px 60px;
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
                  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%); }

        /* Aurora blobs */
        .hv-aurora { position: absolute; z-index: 0; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .hv-aurora-1 { width: 600px; height: 600px; top: -200px; left: -100px; background: radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%); animation: hv-drift-1 20s ease-in-out infinite alternate; }
        .hv-aurora-2 { width: 500px; height: 500px; bottom: -150px; right: -100px; background: radial-gradient(circle, rgba(0,255,229,0.12), transparent 70%); animation: hv-drift-2 24s ease-in-out infinite alternate; }
        @keyframes hv-drift-1 { from { transform: translate(0,0); } to { transform: translate(60px, 80px); } }
        @keyframes hv-drift-2 { from { transform: translate(0,0); } to { transform: translate(-40px, -60px); } }

        /* Content */
        .hv-content { position: relative; z-index: 2; max-width: 1280px; width: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 60px; align-items: center; }
        @media (max-width: 1024px) { .hv-content { grid-template-columns: 1fr; gap: 60px; } .hv-right { display: flex; justify-content: center; } }

        .hv-left { max-width: 640px; }

        .hv-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 28px; }
        .hv-pulse { width: 6px; height: 6px; background: #00D4FF; border-radius: 50%; box-shadow: 0 0 8px #00D4FF; animation: hv-pulse 2s ease-in-out infinite; }
        @keyframes hv-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .hv-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(40px, 5.5vw, 76px); line-height: 1.05; letter-spacing: -0.01em; margin-bottom: 24px; }
        .hv-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .hv-sub { font-size: 18px; color: #8899AA; line-height: 1.7; margin-bottom: 36px; max-width: 560px; }

        .hv-ctas { display: flex; gap: 16px; margin-bottom: 56px; flex-wrap: wrap; }
        .hv-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; border-radius: 10px; cursor: pointer; }
        .hv-btn-primary { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; box-shadow: 0 0 32px rgba(0,212,255,0.35); }
        .hv-btn-secondary { background: transparent; color: #D4E8F7; border: 1px solid #1E3A5F; transition: border-color 0.2s, color 0.2s; }
        .hv-btn-secondary:hover { border-color: #00D4FF; color: #00D4FF; }
        .hv-arrow { transition: transform 0.2s; display: inline-block; }
        .hv-btn-primary:hover .hv-arrow { transform: translateX(4px); }

        .hv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 600px; }
        @media (max-width: 640px) { .hv-stats { grid-template-columns: repeat(2, 1fr); } }
        .hv-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 6px; }
        .hv-stat-lbl { font-size: 11px; color: #8899AA; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }

        /* ───────── Arora avatar ───────── */
        .hv-arora { position: relative; width: 100%; aspect-ratio: 1; max-width: 420px; margin-left: auto; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 1024px) { .hv-arora { margin: 0 auto; max-width: 320px; } }

        .hv-arora-name { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 6px 16px; background: #0D1F3C; border: 1px solid #00D4FF; border-radius: 999px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; z-index: 3; box-shadow: 0 0 14px rgba(0,212,255,0.25); }

        .hv-arora-rings { position: absolute; inset: 0; }
        .hv-arora-ring { position: absolute; inset: 0; border: 1px solid #00D4FF; border-radius: 50%; opacity: 0.3; animation: hv-spin 18s linear infinite; }
        .hv-arora-ring.r2 { inset: 12%; border-color: #00FFE5; opacity: 0.4; animation-direction: reverse; animation-duration: 24s; }
        .hv-arora-ring.r3 { inset: 25%; border-style: dashed; opacity: 0.5; animation-duration: 30s; }
        @keyframes hv-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .hv-arora-orb { width: 50%; height: 50%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #00FFE5, #00D4FF 50%, #006080 100%); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 80px; color: #0A1628; box-shadow: 0 0 64px rgba(0,212,255,0.45), inset 0 0 40px rgba(255,255,255,0.2); position: relative; z-index: 2; }

        .hv-arora-status { position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); padding: 8px 18px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; font-size: 12px; font-weight: 600; color: #D4E8F7; display: flex; align-items: center; gap: 8px; z-index: 3; }
        .hv-arora-dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; box-shadow: 0 0 8px #10B981; animation: hv-pulse 2s infinite; }

        .hv-arora-stat { position: absolute; padding: 12px 16px; background: rgba(13,31,60,0.85); backdrop-filter: blur(8px); border: 1px solid #1E3A5F; border-radius: 12px; font-size: 12px; box-shadow: 0 0 14px rgba(0,212,255,0.25); animation: hv-float 4s ease-in-out infinite; z-index: 3; }
        .hv-arora-stat .v { display: block; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #00D4FF; }
        .hv-arora-stat .k { font-size: 10px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; }
        .hv-arora-stat-1 { top: 8%; left: -10%; animation-delay: 0s; }
        .hv-arora-stat-2 { bottom: 12%; right: -8%; animation-delay: 2s; }
        @keyframes hv-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        /* ───────── Bento ───────── */
        .hv-bento-section { position: relative; padding: 80px 48px; max-width: 1280px; margin: 0 auto; }
        @media (max-width: 640px) { .hv-bento-section { padding: 60px 20px; } }
        .hv-bento { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 220px 220px; gap: 16px; }
        @media (max-width: 1024px) { .hv-bento { grid-template-columns: 1fr 1fr; grid-template-rows: auto; } }
        @media (max-width: 640px) { .hv-bento { grid-template-columns: 1fr; } }

        .hv-bento-card { position: relative; padding: 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; color: #D4E8F7; text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .hv-bento-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(0,212,255,0.06), transparent 60%); opacity: 0; transition: opacity 0.3s; }
        .hv-bento-card:hover { transform: translateY(-4px); border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.25); }
        .hv-bento-card:hover::before { opacity: 1; }
        .hv-bento-card > * { position: relative; }

        .hv-bento-1 { grid-column: 1 / 2; grid-row: 1 / 3; background: linear-gradient(135deg, #0D1F3C, #14284D); border-color: #00D4FF; box-shadow: 0 0 14px rgba(0,212,255,0.15); }
        @media (max-width: 1024px) { .hv-bento-1 { grid-column: 1 / -1; grid-row: auto; } }

        .hv-bento-card .hv-bento-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .hv-bento-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; line-height: 1.2; margin-bottom: 12px; }
        .hv-bento-1 h3 { font-size: clamp(28px, 3vw, 38px); }
        .hv-bento-card p { color: #8899AA; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
        .hv-bento-link { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #00D4FF; text-transform: uppercase; letter-spacing: 0.1em; }

        /* ───────── Reduced motion ───────── */
        @media (prefers-reduced-motion: reduce) {
          .hv-canvas-wrap { display: none; }
          .hv-hero { background: radial-gradient(ellipse at top, rgba(0,212,255,0.06), transparent 50%), #0A1628; }
          .hv-aurora, .hv-arora-ring, .hv-pulse, .hv-arora-dot, .hv-arora-stat { animation: none; }
        }
      `}</style>
    </main>
  );
}

export default HomePage;
