import * as THREE from 'three';

export interface CinematicSceneHandle {
  dispose: () => void;
}

interface Layout {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

interface DeviceSpec {
  build: () => THREE.Group;
  desktop: Layout;
  compact: Layout;
  bob: number;
  bobSpeed: number;
  sway: number;
  delay: number;
}

function roundedBox(w: number, h: number, d: number, r: number, seg = 6) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RBG = (THREE as any).RoundedBoxGeometry;
  if (RBG) return new RBG(w, h, d, seg, r);
  return new THREE.BoxGeometry(w, h, d);
}

function mat(color: number, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.15,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.0,
    ...opts,
  });
}

function screenMat(emissive: number, intensity = 0.55) {
  return new THREE.MeshStandardMaterial({
    color: 0x0a0e1a,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: intensity,
    roughness: 0.15,
    metalness: 0.05,
  });
}

/* ---------------- devices ---------------- */

function createLaptop() {
  const g = new THREE.Group();
  // base
  const base = new THREE.Mesh(roundedBox(2.6, 0.14, 1.7, 0.06), mat(0xe8eaf2, { roughness: 0.4, metalness: 0.2, clearcoat: 0.5 }));
  base.position.y = -0.07;
  g.add(base);
  // keyboard well
  const well = new THREE.Mesh(roundedBox(2.25, 0.018, 1.35, 0.04), mat(0x1a1f2e, { roughness: 0.7, metalness: 0.05, clearcoat: 0.1 }));
  well.position.set(0, 0.01, 0.05);
  g.add(well);
  // trackpad
  const pad = new THREE.Mesh(roundedBox(0.7, 0.012, 0.45, 0.04), mat(0x2a2f3b, { roughness: 0.5, metalness: 0.1 }));
  pad.position.set(0, 0.012, 0.55);
  g.add(pad);
  // lid
  const lid = new THREE.Mesh(roundedBox(2.6, 1.6, 0.1, 0.06), mat(0xe8eaf2, { roughness: 0.4, metalness: 0.2, clearcoat: 0.5 }));
  lid.position.set(0, 0.86, -0.8);
  lid.rotation.x = -0.2;
  g.add(lid);
  // screen
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.38), screenMat(0x5865f2, 0.5));
  screen.position.set(0, 0.86, -0.74);
  screen.rotation.x = -0.2;
  g.add(screen);
  // hinge
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16), mat(0xb8bfcc, { metalness: 1, roughness: 0.25 }));
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.0, -0.06);
  g.add(hinge);
  // logo glow
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: 0x5865f2, transparent: true, opacity: 0.6 }));
  logo.position.set(0, 0.86, -0.73);
  logo.rotation.x = -0.2;
  g.add(logo);
  return g;
}

function createHeadphones() {
  const g = new THREE.Group();
  // headband (torus arc)
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.09, 16, 48, Math.PI), mat(0x1a1f2e, { roughness: 0.4, metalness: 0.3, clearcoat: 0.4 }));
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.3;
  g.add(band);
  // cups
  for (const x of [-0.85, 0.85]) {
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), mat(0x0d1017, { roughness: 0.45, metalness: 0.2 }));
    cup.position.set(x, -0.35, 0);
    cup.scale.set(1, 1.05, 0.9);
    g.add(cup);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 32), mat(0x9b72f2, { emissive: 0x9b72f2, emissiveIntensity: 0.6, roughness: 0.4 }));
    pad.position.set(x, -0.35, 0);
    pad.rotation.x = Math.PI / 2;
    g.add(pad);
  }
  return g;
}

function createSmartphone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(0.95, 1.95, 0.12, 0.1), mat(0x1a1f2e, { roughness: 0.3, metalness: 0.4, clearcoat: 0.7 }));
  g.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.75), screenMat(0x7e8afb, 0.6));
  screen.position.z = 0.061;
  g.add(screen);
  // camera bump
  const bump = new THREE.Mesh(roundedBox(0.32, 0.32, 0.04, 0.06), mat(0x2a2f3b, { roughness: 0.3, metalness: 0.5 }));
  bump.position.set(-0.28, 0.78, 0.08);
  g.add(bump);
  for (let i = 0; i < 3; i++) {
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), mat(0x0a0e1a, { roughness: 0.2, metalness: 0.6 }));
    lens.position.set(-0.35 + (i % 2) * 0.14, 0.85 - Math.floor(i / 2) * 0.14, 0.101);
    g.add(lens);
  }
  return g;
}

function createTablet() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(1.9, 2.5, 0.1, 0.1), mat(0xe8eaf2, { roughness: 0.4, metalness: 0.2, clearcoat: 0.5 }));
  g.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.3), screenMat(0x9b72f2, 0.45));
  screen.position.z = 0.051;
  g.add(screen);
  // camera dot
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), mat(0x2a2f3b, { roughness: 0.3, metalness: 0.5 }));
  cam.position.set(0, 1.18, 0.052);
  g.add(cam);
  return g;
}

/* ---------------- scene ---------------- */

const SPECS: (DeviceSpec & { build: () => THREE.Group })[] = [
  {
    build: createLaptop,
    desktop: { position: [-3.0, 0.3, -1.0], rotation: [0.15, 0.55, -0.05], scale: 0.85 },
    compact: { position: [-1.0, 1.6, -1.0], rotation: [0.12, 0.45, -0.04], scale: 0.6 },
    bob: 0.04,
    bobSpeed: 0.6,
    sway: 0.04,
    delay: 0.1,
  },
  {
    build: createHeadphones,
    desktop: { position: [2.8, 0.7, -0.3], rotation: [0.2, -0.5, 0.1], scale: 1.05 },
    compact: { position: [1.0, 1.8, -0.5], rotation: [0.15, -0.4, 0.08], scale: 0.75 },
    bob: 0.05,
    bobSpeed: 0.75,
    sway: 0.06,
    delay: 0.22,
  },
  {
    build: createSmartphone,
    desktop: { position: [2.5, -1.0, 0.4], rotation: [-0.1, -0.4, 0.15], scale: 0.9 },
    compact: { position: [0.9, -1.6, 0.3], rotation: [-0.08, -0.35, 0.12], scale: 0.65 },
    bob: 0.035,
    bobSpeed: 0.85,
    sway: 0.05,
    delay: 0.3,
  },
  {
    build: createTablet,
    desktop: { position: [-2.6, -0.9, 0.2], rotation: [0.1, 0.35, -0.08], scale: 0.8 },
    compact: { position: [-0.9, -1.5, 0.2], rotation: [0.08, 0.3, -0.06], scale: 0.58 },
    bob: 0.03,
    bobSpeed: 0.65,
    sway: 0.035,
    delay: 0.38,
  },
];

const DESKTOP_CAMERA_Z = 7.6;
const DESKTOP_CAMERA_Y = 1.1;
const COMPACT_CAMERA_Z = 10.8;
const COMPACT_CAMERA_Y = 0.85;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function createCinematicScene(container: HTMLElement): CinematicSceneHandle {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.opacity = '0';
  renderer.domElement.style.transition = 'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070b14, 9, 22);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  const isCompact = () => camera.aspect < 1;
  camera.position.set(0, isCompact() ? COMPACT_CAMERA_Y : DESKTOP_CAMERA_Y, (isCompact() ? COMPACT_CAMERA_Z : DESKTOP_CAMERA_Z) + 2.4);
  camera.lookAt(0, 0.05, 0);

  // Lighting
  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x080d16, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(4, 6, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa7b6ff, 1.0);
  fill.position.set(-6, 1.5, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(-2, 3, -6);
  scene.add(rim);
  const glowA = new THREE.PointLight(0x5865f2, 14, 24, 2);
  glowA.position.set(-4, -2, 0.5);
  scene.add(glowA);
  const glowB = new THREE.PointLight(0x9b72f2, 11, 22, 2);
  glowB.position.set(4, 2, -1.5);
  scene.add(glowB);

  const root = new THREE.Group();
  scene.add(root);

  const items = SPECS.map((spec, i) => {
    const holder = new THREE.Group();
    const model = spec.build();
    holder.add(model);
    root.add(holder);
    const target = spec.desktop;
    return {
      holder,
      model,
      spec,
      phase: i * 1.6 + 0.5,
      current: {
        position: new THREE.Vector3(...target.position),
        rotation: new THREE.Vector3(...target.rotation),
        scale: target.scale,
      },
    };
  });

  // pointer parallax
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const onPointerMove = (e: PointerEvent) => {
    pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let lastFrame = performance.now();
  let elapsed = 0;
  let raf = 0;
  let disposed = false;

  const animate = () => {
    if (disposed) return;
    const now = performance.now();
    const dt = Math.min((now - lastFrame) / 1000, 1 / 20);
    lastFrame = now;
    elapsed += dt;
    const compact = isCompact();

    pointer.lerp(pointerTarget, 1 - Math.pow(0.0015, dt));
    root.rotation.y = pointer.x * 0.08;
    root.rotation.x = pointer.y * 0.04;

    const damp = 1 - Math.pow(0.002, dt);
    camera.position.z = lerp(camera.position.z, compact ? COMPACT_CAMERA_Z : DESKTOP_CAMERA_Z, damp);
    camera.position.y = lerp(camera.position.y, compact ? COMPACT_CAMERA_Y : DESKTOP_CAMERA_Y, damp);
    camera.lookAt(0, 0.05, 0);

    for (const item of items) {
      const target = compact ? item.spec.compact : item.spec.desktop;
      const damping = 1 - Math.pow(0.002, dt);
      item.current.position.lerp(new THREE.Vector3(...target.position), damping);
      item.current.rotation.x = lerp(item.current.rotation.x, target.rotation[0], damping);
      item.current.rotation.y = lerp(item.current.rotation.y, target.rotation[1], damping);
      item.current.rotation.z = lerp(item.current.rotation.z, target.rotation[2], damping);
      item.current.scale = lerp(item.current.scale, target.scale, damping);

      const enter = clamp01((elapsed - item.spec.delay) / 1.15);
      const eased = 1 - Math.pow(1 - enter, 3);
      const { spec } = item;

      item.holder.position.copy(item.current.position);
      item.holder.position.y += (1 - eased) * -0.7;
      item.holder.scale.setScalar(item.current.scale * (0.85 + 0.15 * eased));
      item.holder.rotation.set(
        item.current.rotation.x + Math.sin(elapsed * 0.2 + item.phase) * spec.sway * 0.3,
        item.current.rotation.y + Math.sin(elapsed * 0.25 + item.phase) * spec.sway - (1 - eased) * 0.45,
        item.current.rotation.z,
      );
      item.model.position.y = Math.sin(elapsed * spec.bobSpeed + item.phase) * spec.bob;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };

  const fadeIn = requestAnimationFrame(() => {
    renderer.domElement.style.opacity = '1';
  });
  raf = requestAnimationFrame(animate);

  const resize = () => {
    if (disposed) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const onVis = () => {
    if (disposed) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVis);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(fadeIn);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVis);
    ro.disconnect();
    scene.traverse((child) => {
      const m = child as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const material = m.material as THREE.Material | THREE.Material[] | undefined;
      if (!material) return;
      const list = Array.isArray(material) ? material : [material];
      for (const e of list) {
        const map = (e as THREE.MeshStandardMaterial).map;
        if (map) map.dispose();
        e.dispose();
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  };

  return { dispose };
}
