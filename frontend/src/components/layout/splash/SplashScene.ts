import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createAirPods,
  createController,
  createLaptop,
  createStudioMaterials,
  type StudioMaterials,
} from './models';

/**
 * Product-stage scene for the entrance splash.
 *
 * Realism comes from three things: models built on real silhouettes, an image
 * based studio environment (RoomEnvironment -> PMREM) for soft reflections, and
 * slow, weighted motion — products settle into frame, then drift almost
 * imperceptibly. No spinning, no sparkles.
 */

export interface SplashSceneHandle {
  dispose: () => void;
}

type Vec3 = [number, number, number];

interface Layout {
  position: Vec3;
  rotation: Vec3;
  scale: number;
}

interface ModelSpec {
  build: (materials: StudioMaterials) => THREE.Group;
  desktop: Layout;
  compact: Layout;
  bob: number;
  bobSpeed: number;
  sway: number;
  delay: number;
}

interface SceneItem {
  holder: THREE.Group;
  model: THREE.Group;
  spec: ModelSpec;
  phase: number;
  current: { position: THREE.Vector3; rotation: THREE.Vector3; scale: number };
}

const SPECS: ModelSpec[] = [
  {
    build: createLaptop,
    desktop: { position: [-2.9, 0.55, -1.2], rotation: [0.12, 0.55, -0.05], scale: 0.85 },
    compact: { position: [-0.9, 1.9, -1.1], rotation: [0.1, 0.45, -0.04], scale: 0.6 },
    bob: 0.04,
    bobSpeed: 0.6,
    sway: 0.04,
    delay: 0.12,
  },
  {
    build: createAirPods,
    desktop: { position: [2.5, 0.6, -0.3], rotation: [0.2, -0.5, 0.1], scale: 1.15 },
    compact: { position: [0.9, 1.8, -0.5], rotation: [0.15, -0.4, 0.08], scale: 0.85 },
    bob: 0.05,
    bobSpeed: 0.75,
    sway: 0.06,
    delay: 0.24,
  },
  {
    build: createController,
    desktop: { position: [0, -1.18, 0.75], rotation: [0.26, -0.26, 0.02], scale: 0.78 },
    compact: { position: [0, -1.72, 0.6], rotation: [0.32, -0.2, 0.01], scale: 0.6 },
    bob: 0.03,
    bobSpeed: 0.6,
    sway: 0.03,
    delay: 0.36,
  },
];

const DESKTOP_CAMERA_Z = 7.7;
const DESKTOP_CAMERA_Y = 1.25;
const COMPACT_CAMERA_Z = 11.2;
const COMPACT_CAMERA_Y = 0.9;
const FOG_COLOR = 0x070b14;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export function createSplashScene(container: HTMLElement): SplashSceneHandle {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.opacity = '0';
  renderer.domElement.style.transition = 'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(FOG_COLOR, 9.5, 23);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.06);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.0;

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  const isCompact = () => camera.aspect < 1;
  // Slightly above the products so the console vent and controller face read.
  camera.position.set(
    0,
    isCompact() ? COMPACT_CAMERA_Y : DESKTOP_CAMERA_Y,
    (isCompact() ? COMPACT_CAMERA_Z : DESKTOP_CAMERA_Z) + 2.2,
  );
  camera.lookAt(0, 0.05, 0);

  // Studio lighting: broad key, cool fill, hard rim, coloured bounce from below.
  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x080d16, 0.45));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
  keyLight.position.set(4.5, 6, 6.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xa7b6ff, 1.1);
  fillLight.position.set(-6, 1.5, 3.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
  rimLight.position.set(-2.5, 3.5, -6);
  scene.add(rimLight);

  const glowLeft = new THREE.PointLight(0x5865f2, 16, 26, 2);
  glowLeft.position.set(-4.2, -2.2, 0.5);
  scene.add(glowLeft);

  const glowRight = new THREE.PointLight(0x9b72f2, 12, 24, 2);
  glowRight.position.set(4.4, 2.4, -1.5);
  scene.add(glowRight);

  const root = new THREE.Group();
  scene.add(root);

  const materials = createStudioMaterials();
  const items: SceneItem[] = SPECS.map((spec, index) => {
    const holder = new THREE.Group();
    const model = spec.build(materials);
    holder.add(model);
    root.add(holder);

    const start = spec.desktop;
    return {
      holder,
      model,
      spec,
      phase: index * 1.7 + 0.6,
      current: {
        position: new THREE.Vector3(...start.position),
        rotation: new THREE.Vector3(...start.rotation),
        scale: start.scale,
      },
    };
  });

  // Pointer parallax, heavily damped so it reads as air rather than a gimmick.
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const onPointerMove = (event: PointerEvent) => {
    pointerTarget.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1),
    );
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
    const elapsedNow = elapsed;
    const compact = isCompact();

    pointer.lerp(pointerTarget, 1 - Math.pow(0.0015, dt));
    root.rotation.y = pointer.x * 0.1;
    root.rotation.x = pointer.y * 0.055;

    const cameraDamping = 1 - Math.pow(0.02, dt);
    camera.position.z = lerp(
      camera.position.z,
      compact ? COMPACT_CAMERA_Z : DESKTOP_CAMERA_Z,
      cameraDamping,
    );
    camera.position.y = lerp(
      camera.position.y,
      compact ? COMPACT_CAMERA_Y : DESKTOP_CAMERA_Y,
      cameraDamping,
    );
    camera.lookAt(0, 0.05, 0);

    for (const item of items) {
      const target = compact ? item.spec.compact : item.spec.desktop;
      const damping = 1 - Math.pow(0.002, dt);

      item.current.position.lerp(new THREE.Vector3(...target.position), damping);
      item.current.rotation.x = lerp(item.current.rotation.x, target.rotation[0], damping);
      item.current.rotation.y = lerp(item.current.rotation.y, target.rotation[1], damping);
      item.current.rotation.z = lerp(item.current.rotation.z, target.rotation[2], damping);
      item.current.scale = lerp(item.current.scale, target.scale, damping);

      // Weighted entrance: rise into frame, settle, then keep drifting.
      const enter = clamp01((elapsedNow - item.spec.delay) / 1.2);
      const eased = 1 - Math.pow(1 - enter, 3);
      const { spec } = item;

      item.holder.position.copy(item.current.position);
      item.holder.position.y += (1 - eased) * -0.8;
      item.holder.scale.setScalar(item.current.scale * (0.88 + 0.12 * eased));
      item.holder.rotation.set(
        item.current.rotation.x + Math.sin(elapsedNow * 0.22 + item.phase) * spec.sway * 0.35,
        item.current.rotation.y +
          Math.sin(elapsedNow * 0.28 + item.phase) * spec.sway -
          (1 - eased) * 0.5,
        item.current.rotation.z,
      );

      item.model.position.y = Math.sin(elapsedNow * spec.bobSpeed + item.phase) * spec.bob;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };

  // Fade the canvas in once the first frame is on screen.
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
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const onVisibilityChange = () => {
    if (disposed) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(fadeIn);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    resizeObserver.disconnect();

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (!material) return;
      const list = Array.isArray(material) ? material : [material];
      for (const entry of list) {
        const map = (entry as THREE.MeshStandardMaterial).map;
        if (map) map.dispose();
        entry.dispose();
      }
    });

    room.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (!material) return;
      const list = Array.isArray(material) ? material : [material];
      for (const entry of list) entry.dispose();
    });

    scene.environment = null;
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };

  return { dispose };
}
