import { useEffect, useRef } from 'react';

interface CategoryLoader3DProps {
  scene: 'gaming' | 'headphones' | 'audio';
  size: string;
  accent: string;
}

export default function CategoryLoader3D({ scene, size, accent }: CategoryLoader3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    const container = containerRef.current;
    if (!container) return;

    let renderer: any;
    let sceneObj: any;
    let camera: any;
    let objects: any[] = [];

    (async () => {
      const THREE = await import('three');
      if (disposed || !container) return;

      const width = container.clientWidth || 80;
      const height = container.clientHeight || 80;

      sceneObj = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      sceneObj.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(3, 4, 5);
      sceneObj.add(key);
      const rim = new THREE.DirectionalLight(new THREE.Color(accent), 0.7);
      rim.position.set(-3, -2, -4);
      sceneObj.add(rim);

      const mat = (color: string, emissive?: string) =>
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: emissive ? new THREE.Color(emissive) : new THREE.Color(0x000000),
          emissiveIntensity: emissive ? 0.35 : 0,
          metalness: 0.35,
          roughness: 0.45,
        });

      if (scene === 'gaming') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.1, 4, 2, 2), mat('#1a1f2e', accent));
        body.position.y = -0.1;
        sceneObj.add(body);
        objects.push(body);

        const stickGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16);
        const leftStick = new THREE.Mesh(stickGeo, mat('#0d1524'));
        leftStick.position.set(-0.55, 0.28, 0.1);
        sceneObj.add(leftStick);
        objects.push(leftStick);
        const rightStick = new THREE.Mesh(stickGeo, mat('#0d1524'));
        rightStick.position.set(0.4, 0.28, 0.1);
        sceneObj.add(rightStick);
        objects.push(rightStick);

        for (let i = 0; i < 4; i++) {
          const btn = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), mat(accent, accent));
          const angle = (i / 4) * Math.PI * 2;
          btn.position.set(0.85 + Math.cos(angle) * 0.22, 0.15 + Math.sin(angle) * 0.22, 0.56);
          sceneObj.add(btn);
          objects.push(btn);
        }

        const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.12), mat('#0d1524'));
        dpad.position.set(-0.85, 0.12, 0.56);
        sceneObj.add(dpad);
        objects.push(dpad);
      } else if (scene === 'headphones') {
        const band = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 16, 48, Math.PI), mat('#1a1f2e', accent));
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.35;
        sceneObj.add(band);
        objects.push(band);

        for (const x of [-1.1, 1.1]) {
          const cup = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), mat('#0d1524', accent));
          cup.position.set(x, -0.35, 0);
          sceneObj.add(cup);
          objects.push(cup);
          const pad = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 32), mat(accent));
          pad.position.set(x, -0.35, 0);
          pad.rotation.x = Math.PI / 2;
          sceneObj.add(pad);
          objects.push(pad);
        }
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 1.2, 2, 2, 2), mat('#1a1f2e', accent));
        sceneObj.add(box);
        objects.push(box);
        for (let i = 0; i < 3; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28 + i * 0.18, 0.03, 8, 32), mat(accent));
          ring.position.z = 0.62;
          sceneObj.add(ring);
          objects.push(ring);
        }
      }

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        for (const obj of objects) {
          obj.rotation.y = t * 0.9;
        }
        if (scene === 'headphones') {
          const s = 1 + Math.sin(t * 2) * 0.04;
          for (const obj of objects) obj.scale.setScalar(s);
        }
        if (scene === 'audio') {
          for (let i = 0; i < 3; i++) {
            const ring = objects[objects.length - 3 + i];
            if (ring) ring.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.15);
          }
        }
        renderer.render(sceneObj, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!container || disposed) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w && h) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      // store cleanup
      (container as any).__cleanup = () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        renderer.dispose();
        sceneObj.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
            else child.material.dispose();
          }
        });
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      const cleanup = (container as any)?.__cleanup;
      if (cleanup) cleanup();
    };
  }, [scene, accent]);

  return <div ref={containerRef} className={size} style={{ minHeight: 64 }} />;
}
