import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DURATION = 2600;

export function EntranceSplash({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      setFadeOut(true);
      window.setTimeout(onDone, 520);
    };

    if (reduceMotion) {
      const t = window.setTimeout(finish, 600);
      return () => window.clearTimeout(t);
    }

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
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(5, 6, 4);
      scene.add(key);
      const rim = new THREE.PointLight(new THREE.Color('#9B72F2'), 1.2, 20);
      rim.position.set(-4, -3, -2);
      scene.add(rim);
      const rim2 = new THREE.PointLight(new THREE.Color('#5865F2'), 1.0, 20);
      rim2.position.set(4, -2, 3);
      scene.add(rim2);

      const group = new THREE.Group();
      scene.add(group);

      const palette = ['#5865F2', '#9B72F2', '#A5AEFF', '#C4AAF8', '#7E8AFB'];
      const geometries = [
        new THREE.IcosahedronGeometry(0.7, 1),
        new THREE.TorusGeometry(0.55, 0.18, 16, 48),
        new THREE.BoxGeometry(0.9, 0.9, 0.9),
        new THREE.OctahedronGeometry(0.75, 0),
        new THREE.TorusKnotGeometry(0.5, 0.16, 80, 12),
      ];

      const meshes: any[] = [];
      geometries.forEach((geo, i) => {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(palette[i % palette.length]),
          metalness: 0.45,
          roughness: 0.35,
          emissive: new THREE.Color(palette[i % palette.length]),
          emissiveIntensity: 0.18,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const angle = (i / geometries.length) * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 1.2, (i - 2) * 0.6);
        group.add(mesh);
        meshes.push(mesh);
      });

      // Particle field
      const particleCount = 220;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xa5aeff,
        size: 0.045,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        group.rotation.y = t * 0.55;
        group.rotation.x = Math.sin(t * 0.4) * 0.25;
        meshes.forEach((m, i) => {
          m.rotation.x = t * (0.6 + i * 0.15);
          m.rotation.z = t * (0.4 - i * 0.1);
          m.position.y += Math.sin(t * 1.2 + i) * 0.0008;
        });
        particles.rotation.y = t * 0.08;
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
        geometries.forEach((g) => g.dispose());
        particleGeo.dispose();
        particleMat.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    const timer = window.setTimeout(finish, DURATION);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (cleanupFn) cleanupFn();
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-ink-900 transition-opacity duration-500',
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden="true"
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-5 text-center">
        <div className="font-display text-5xl font-semibold tracking-[-0.05em] text-white">
          klarwerk<span className="text-electric-400">.</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/45">
          <span className="h-px w-8 bg-white/20" />
          Technik, die weiterdenkt
          <span className="h-px w-8 bg-white/20" />
        </div>
        <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[shimmer_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-electric-400 to-transparent" />
        </div>
      </div>
    </div>
  );
}
