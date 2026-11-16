import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface AbstractSceneHandle {
  dispose: () => void;
}

function makeCurve(points: THREE.Vector3[], closed = true) {
  return new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.5);
}

export function createAbstractScene(container: HTMLElement): AbstractSceneHandle {
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
  scene.fog = new THREE.Fog(0x070b14, 8, 24);

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Post-processing bloom
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.18);
  composer.addPass(bloom);

  // Lighting
  scene.add(new THREE.AmbientLight(0x1a1f3a, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9b72f2, 1.4);
  rim.position.set(-4, 2, -5);
  scene.add(rim);
  const glowA = new THREE.PointLight(0x5865f2, 12, 20, 2);
  glowA.position.set(-3, -1, 1);
  scene.add(glowA);
  const glowB = new THREE.PointLight(0x9b72f2, 10, 18, 2);
  glowB.position.set(3, 1.5, -1);
  scene.add(glowB);

  const root = new THREE.Group();
  scene.add(root);

  // --- Ribbons (flowing curves) ---
  const ribbonColors = [0x5865f2, 0x7e8afb, 0x9b72f2, 0xa5aeff, 0xc4aaf8];
  const ribbons: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; phase: number }[] = [];

  const ribbonDefs = [
    { tilt: [0.3, 0, 0.4], radius: 2.6, points: 6, twist: 0.4 },
    { tilt: [0.6, 0.3, 0], radius: 3.2, points: 7, twist: -0.3 },
    { tilt: [-0.4, 0.5, 0.2], radius: 2.2, points: 5, twist: 0.6 },
    { tilt: [0.1, -0.4, 0.7], radius: 3.6, points: 8, twist: -0.5 },
    { tilt: [-0.2, 0.2, -0.3], radius: 2.9, points: 6, twist: 0.25 },
  ];

  for (let i = 0; i < ribbonDefs.length; i++) {
    const def = ribbonDefs[i];
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j < def.points; j++) {
      const a = (j / def.points) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(a) * def.radius + Math.sin(a * 2) * 0.3,
        Math.sin(a) * def.radius * 0.5 + Math.cos(a * 3) * 0.4,
        Math.sin(a) * def.radius * 0.3 + Math.cos(a * 2) * 0.5,
      ));
    }
    const curve = makeCurve(pts, true);
    const tubeGeo = new THREE.TubeGeometry(curve, 160, 0.022 + i * 0.004, 12, true);
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ribbonColors[i % ribbonColors.length]),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(tubeGeo, ribbonMat);
    mesh.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
    root.add(mesh);
    ribbons.push({ mesh, curve, speed: 0.08 + i * 0.03, phase: i * 1.2 });
  }

  // --- Orbital rings ---
  const rings: { mesh: THREE.Mesh; speed: number; axis: THREE.Vector3 }[] = [];
  const ringDefs = [
    { radius: 4.0, tube: 0.012, rot: [0.5, 0.2, 0.1], color: 0x7e8afb, speed: 0.12 },
    { radius: 3.3, tube: 0.01, rot: [-0.3, 0.6, 0.4], color: 0x9b72f2, speed: -0.16 },
    { radius: 4.6, tube: 0.008, rot: [0.8, -0.2, 0.3], color: 0xa5aeff, speed: 0.09 },
    { radius: 2.6, tube: 0.014, rot: [0.2, 0.9, -0.3], color: 0xc4aaf8, speed: -0.2 },
  ];
  for (const rd of ringDefs) {
    const geo = new THREE.TorusGeometry(rd.radius, rd.tube, 16, 128);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(rd.color),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(rd.rot[0], rd.rot[1], rd.rot[2]);
    root.add(mesh);
    rings.push({ mesh, speed: rd.speed, axis: new THREE.Vector3(0, 1, 0) });
  }

  // --- Glass geometric elements ---
  const glassGroup = new THREE.Group();
  root.add(glassGroup);
  const glassMats = [
    new THREE.MeshPhysicalMaterial({ color: 0x5865f2, roughness: 0.08, metalness: 0.1, transmission: 0.7, thickness: 0.6, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2, transparent: true, opacity: 0.75 }),
    new THREE.MeshPhysicalMaterial({ color: 0x9b72f2, roughness: 0.1, metalness: 0.15, transmission: 0.65, thickness: 0.5, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1, transparent: true, opacity: 0.7 }),
    new THREE.MeshPhysicalMaterial({ color: 0xa5aeff, roughness: 0.12, metalness: 0.2, transmission: 0.6, thickness: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: 1.0, transparent: true, opacity: 0.65 }),
  ];
  const glassShapes = [
    new THREE.IcosahedronGeometry(0.55, 1),
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.DodecahedronGeometry(0.5, 0),
  ];
  const glassPositions = [
    [-1.6, 1.2, 0.5],
    [1.8, -0.6, -0.3],
    [0.4, -1.4, 0.8],
  ];
  glassShapes.forEach((geo, i) => {
    const m = new THREE.Mesh(geo, glassMats[i % glassMats.length]);
    m.position.set(glassPositions[i][0], glassPositions[i][1], glassPositions[i][2]);
    m.scale.setScalar(0.9 + i * 0.1);
    glassGroup.add(m);
  });

  // --- Light trails (glowing spheres traveling along curves) ---
  const trails: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; t: number; speed: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const curve = ribbons[i % ribbons.length].curve;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(ribbonColors[i % ribbonColors.length]), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }));
    root.add(sphere);
    trails.push({ mesh: sphere, curve, t: i * 0.25, speed: 0.12 + i * 0.04 });
  }

  // --- Particles (subtle) ---
  const pCount = 140;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xa5aeff, size: 0.035, transparent: true, opacity: 0.5, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

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

    pointer.lerp(pointerTarget, 1 - Math.pow(0.0015, dt));
    root.rotation.y = pointer.x * 0.12;
    root.rotation.x = pointer.y * 0.06;

    // ribbons rotate
    for (const r of ribbons) {
      r.mesh.rotation.y += r.speed * dt;
      r.mesh.rotation.z += (r.speed * 0.3) * dt;
    }
    // rings rotate
    for (const ring of rings) {
      ring.mesh.rotation.x += ring.speed * dt * 0.5;
      ring.mesh.rotation.y += ring.speed * dt;
    }
    // glass elements float/rotate
    glassGroup.children.forEach((m, i) => {
      m.rotation.x += 0.004 * (i + 1) * dt * 60;
      m.rotation.y += 0.006 * (i + 1) * dt * 60;
      m.position.y += Math.sin(elapsed * 0.7 + i) * 0.0008;
    });
    // trails travel
    for (const tr of trails) {
      tr.t = (tr.t + tr.speed * dt) % 1;
      const pt = tr.curve.getPointAt(tr.t);
      tr.mesh.position.copy(pt);
    }
    particles.rotation.y = elapsed * 0.05;

    composer.render();
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
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
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
    pGeo.dispose();
    pMat.dispose();
    composer.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  };

  return { dispose };
}
