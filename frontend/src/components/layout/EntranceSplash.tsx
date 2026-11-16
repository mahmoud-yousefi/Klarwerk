import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DURATION = 3200;
const LETTERS = 'klarwerk.'.split('');

export function EntranceSplash({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      setFadeOut(true);
      window.setTimeout(onDone, 600);
    };

    if (reduceMotion) {
      setShowLetters(true);
      const t = window.setTimeout(finish, 900);
      return () => window.clearTimeout(t);
    }

    // Reveal letters after the 3D scene has had a moment to breathe.
    const letterTimer = window.setTimeout(() => setShowLetters(true), 1100);
    const finishTimer = window.setTimeout(finish, DURATION);

    let disposed = false;
    let raf = 0;
    let cleanupFn: (() => void) | null = null;

    (async () => {
      const container = containerRef.current;
      if (!container) return;
      const THREE = await import('three');
      if (disposed || !container) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
      camera.position.set(0, 0, 8.5);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const key = new THREE.DirectionalLight(0xffffff, 0.95);
      key.position.set(6, 8, 5);
      scene.add(key);
      const rimA = new THREE.PointLight(new THREE.Color('#5865F2'), 1.4, 25);
      rimA.position.set(-5, -3, -2);
      scene.add(rimA);
      const rimB = new THREE.PointLight(new THREE.Color('#9B72F2'), 1.2, 25);
      rimB.position.set(5, -2, 4);
      scene.add(rimB);

      const group = new THREE.Group();
      scene.add(group);

      // Gamepad
      const gamepad = new THREE.Group();
      const gpBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.55, 1.35, 4, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x1a1f2e, metalness: 0.5, roughness: 0.4, emissive: new THREE.Color('#5865F2'), emissiveIntensity: 0.12 }),
      );
      gamepad.add(gpBody);
      const stickGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 16);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x0d1524, metalness: 0.6, roughness: 0.35 });
      const ls = new THREE.Mesh(stickGeo, stickMat);
      ls.position.set(-0.6, 0.38, 0.15);
      gamepad.add(ls);
      const rs = new THREE.Mesh(stickGeo, stickMat);
      rs.position.set(0.55, 0.38, 0.15);
      gamepad.add(rs);
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color('#9B72F2'), emissive: new THREE.Color('#9B72F2'), emissiveIntensity: 0.4, metalness: 0.3, roughness: 0.4 }));
        const a = (i / 4) * Math.PI * 2;
        b.position.set(0.95 + Math.cos(a) * 0.24, 0.18 + Math.sin(a) * 0.24, 0.7);
        gamepad.add(b);
      }
      const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.14), stickMat);
      dpad.position.set(-0.95, 0.12, 0.7);
      gamepad.add(dpad);
      gamepad.position.set(-2.6, 1.1, -0.5);
      gamepad.rotation.set(0.35, 0.4, -0.15);
      group.add(gamepad);

      // AirPods (stem + bud)
      const airpod = new THREE.Group();
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), new THREE.MeshStandardMaterial({ color: 0xf7f8fc, metalness: 0.25, roughness: 0.35 }));
      airpod.add(bud);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 1.1, 12), new THREE.MeshStandardMaterial({ color: 0xe4e7f0, metalness: 0.3, roughness: 0.4 }));
      stem.position.set(0.18, -0.62, 0);
      stem.rotation.z = -0.25;
      airpod.add(stem);
      airpod.position.set(2.4, 1.6, 0.2);
      airpod.rotation.set(0.2, -0.6, 0.1);
      group.add(airpod);

      // Headphones
      const headphones = new THREE.Group();
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 16, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1a1f2e, metalness: 0.5, roughness: 0.4, emissive: new THREE.Color('#9B72F2'), emissiveIntensity: 0.15 }));
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.35;
      headphones.add(band);
      for (const x of [-0.85, 0.85]) {
        const cup = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), new THREE.MeshStandardMaterial({ color: 0x0d1524, metalness: 0.4, roughness: 0.45 }));
        cup.position.set(x, -0.35, 0);
        headphones.add(cup);
        const pad = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 12, 32), new THREE.MeshStandardMaterial({ color: new THREE.Color('#9B72F2'), emissive: new THREE.Color('#9B72F2'), emissiveIntensity: 0.35 }));
        pad.position.set(x, -0.35, 0);
        pad.rotation.x = Math.PI / 2;
        headphones.add(pad);
      }
      headphones.position.set(-2.2, -1.3, 0.4);
      headphones.rotation.set(0.4, 0.3, -0.2);
      group.add(headphones);

      // Camera
      const cameraObj = new THREE.Group();
      const camBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.7, 2, 2, 2), new THREE.MeshStandardMaterial({ color: 0x1a1f2e, metalness: 0.55, roughness: 0.4, emissive: new THREE.Color('#E85D75'), emissiveIntensity: 0.1 }));
      cameraObj.add(camBody);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0x0d1524, metalness: 0.7, roughness: 0.25 }));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, 0.55);
      cameraObj.add(lens);
      const front = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshStandardMaterial({ color: new THREE.Color('#E85D75'), emissive: new THREE.Color('#E85D75'), emissiveIntensity: 0.5 }));
      front.position.set(0, 0, 0.76);
      cameraObj.add(front);
      const viewfinder = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.15), new THREE.MeshStandardMaterial({ color: 0x0d1524 }));
      viewfinder.position.set(0, 0.62, -0.1);
      cameraObj.add(viewfinder);
      cameraObj.position.set(2.3, -1.4, -0.2);
      cameraObj.rotation.set(-0.2, -0.5, 0.15);
      group.add(cameraObj);

      // Laptop slab
      const laptop = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.4), new THREE.MeshStandardMaterial({ color: 0x1a1f2e, metalness: 0.5, roughness: 0.4 }));
      laptop.add(base);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.35, 0.1), new THREE.MeshStandardMaterial({ color: 0x0d1524, metalness: 0.4, roughness: 0.4, emissive: new THREE.Color('#5865F2'), emissiveIntensity: 0.18 }));
      lid.position.set(0, 0.73, -0.68);
      lid.rotation.x = -0.35;
      laptop.add(lid);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.15), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5865F2'), transparent: true, opacity: 0.35 }));
      screen.position.set(0, 0.73, -0.62);
      screen.rotation.x = -0.35;
      laptop.add(screen);
      laptop.position.set(0.2, -0.2, 0.6);
      laptop.rotation.set(0.15, 0.6, -0.05);
      group.add(laptop);

      // Particle field
      const pCount = 260;
      const positions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xa5aeff, size: 0.05, transparent: true, opacity: 0.65, sizeAttenuation: true });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      const objects = [gamepad, airpod, headphones, cameraObj, laptop];
      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        group.rotation.y = Math.sin(t * 0.25) * 0.35;
        objects.forEach((obj, i) => {
          obj.rotation.y += 0.012 + i * 0.002;
          obj.position.y += Math.sin(t * 0.9 + i * 1.3) * 0.0015;
        });
        gamepad.rotation.x = 0.35 + Math.sin(t * 0.6) * 0.08;
        airpod.rotation.z = 0.1 + Math.sin(t * 0.8) * 0.15;
        headphones.rotation.y = 0.3 + Math.sin(t * 0.5) * 0.2;
        cameraObj.rotation.y = -0.5 + Math.sin(t * 0.7) * 0.2;
        laptop.rotation.y = 0.6 + Math.sin(t * 0.45) * 0.15;
        particles.rotation.y = t * 0.06;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (disposed) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      cleanupFn = () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        renderer.dispose();
        group.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
            else child.material.dispose();
          }
        });
        pGeo.dispose();
        pMat.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      window.clearTimeout(letterTimer);
      window.clearTimeout(finishTimer);
      cancelAnimationFrame(raf);
      if (cleanupFn) cleanupFn();
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-ink-900 transition-opacity duration-700',
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden="true"
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-wrap items-center justify-center">
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={cn(
                'font-display text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl md:text-8xl',
                showLetters ? 'animate-[letter-in_0.9s_cubic-bezier(0.16,1,0.3,1)_both]' : 'opacity-0',
              )}
              style={showLetters ? { animationDelay: `${i * 70}ms` } : undefined}
            >
              {letter === '.' ? <span className="text-electric-400">.</span> : letter}
            </span>
          ))}
        </div>
        <div
          className={cn(
            'flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-white/45 transition-opacity duration-700',
            showLetters ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDelay: '900ms' }}
        >
          <span className="h-px w-10 bg-white/20" />
          Technik, die weiterdenkt
          <span className="h-px w-10 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
