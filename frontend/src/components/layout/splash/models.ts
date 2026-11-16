import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Product models for the entrance splash.
 *
 * Each object is built from its real-world silhouette (extruded + bevelled) so it
 * reads as a product rather than an abstract shape, and every model shares one
 * physically based material set so the studio lighting stays consistent.
 */

export type StudioMaterials = ReturnType<typeof createStudioMaterials>;

export function createStudioMaterials() {
  const physical = (params: THREE.MeshPhysicalMaterialParameters) =>
    new THREE.MeshPhysicalMaterial({ envMapIntensity: 1.05, ...params });

  return {
    /** Satin white plastic — controller shell, console body. */
    shell: physical({
      color: 0xf1f2f7,
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.34,
    }),
    /** High-gloss white plastic — AirPods case. */
    shellGloss: physical({
      color: 0xf6f7fb,
      roughness: 0.18,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.2,
    }),
    /** Matte charcoal — inner face plate. */
    dark: physical({
      color: 0x191d26,
      roughness: 0.62,
      metalness: 0.1,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.9,
    }),
    /** Glossy black — touchpad, power button. */
    darkGloss: physical({
      color: 0x0d1017,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.3,
    }),
    /** Soft-touch rubber — vents, ports. */
    rubber: physical({
      color: 0x0f1218,
      roughness: 0.94,
      metalness: 0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.9,
      envMapIntensity: 0.5,
    }),
    /** Mid-grey plastic — sticks, d-pad, fins. */
    plastic: physical({
      color: 0x2a2f3b,
      roughness: 0.48,
      metalness: 0.15,
      clearcoat: 0.3,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.9,
    }),
    /** Brushed metal — case hinge. */
    metal: physical({
      color: 0xb8bfcc,
      roughness: 0.3,
      metalness: 1,
      clearcoat: 0,
      envMapIntensity: 1.1,
    }),
    /** Brand light bar. */
    accent: new THREE.MeshStandardMaterial({
      color: 0x8c96ff,
      emissive: new THREE.Color(0x5865f2),
      emissiveIntensity: 2.8,
      roughness: 0.35,
      metalness: 0.1,
      envMapIntensity: 0.7,
    }),
    /** Cool accent for button rings. */
    accentSoft: new THREE.MeshStandardMaterial({
      color: 0xdfe6ff,
      emissive: new THREE.Color(0x8ea2ff),
      emissiveIntensity: 1.3,
      roughness: 0.4,
      metalness: 0.1,
      envMapIntensity: 0.7,
    }),
    /** Status LED on the case. */
    led: new THREE.MeshStandardMaterial({
      color: 0x9af2c0,
      emissive: new THREE.Color(0x51d68b),
      emissiveIntensity: 2.2,
      roughness: 0.4,
      metalness: 0,
    }),
  };
}

/* ------------------------------------------------------------------ helpers */

function extrude(shape: THREE.Shape, depth: number, bevel: number, curveSegments = 40) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 8,
    curveSegments,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function roundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

type Glyph = 'triangle' | 'circle' | 'cross' | 'square';

function glyphTexture(kind: Glyph) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const ctx = canvas.getContext('2d');
  if (!ctx) return texture;

  ctx.fillStyle = '#11151d';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#e6ebf6';
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const c = size / 2;
  const r = size * 0.19;

  if (kind === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(c, c - r);
    ctx.lineTo(c + r, c + r * 0.8);
    ctx.lineTo(c - r, c + r * 0.8);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === 'circle') {
    ctx.beginPath();
    ctx.arc(c, c, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'cross') {
    const d = r * 0.75;
    ctx.beginPath();
    ctx.moveTo(c - d, c - d);
    ctx.lineTo(c + d, c + d);
    ctx.moveTo(c + d, c - d);
    ctx.lineTo(c - d, c + d);
    ctx.stroke();
  } else {
    const d = r * 0.75;
    ctx.strokeRect(c - d, c - d, d * 2, d * 2);
  }

  texture.needsUpdate = true;
  return texture;
}

/* --------------------------------------------------------------- controller */

/** Real DualSense-style silhouette: raised shoulders, waist, two descending grips. */
function controllerOutline() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.92);
  shape.bezierCurveTo(0.3, 0.94, 0.64, 0.92, 0.88, 0.84);
  shape.bezierCurveTo(1.3, 0.72, 1.63, 0.36, 1.67, -0.04);
  shape.bezierCurveTo(1.71, -0.5, 1.53, -0.9, 1.15, -0.96);
  shape.bezierCurveTo(0.9, -1.0, 0.76, -0.84, 0.66, -0.6);
  shape.bezierCurveTo(0.56, -0.38, 0.4, -0.28, 0.18, -0.24);
  shape.lineTo(0, -0.23);
  shape.lineTo(-0.18, -0.24);
  shape.bezierCurveTo(-0.4, -0.28, -0.56, -0.38, -0.66, -0.6);
  shape.bezierCurveTo(-0.76, -0.84, -0.9, -1.0, -1.15, -0.96);
  shape.bezierCurveTo(-1.53, -0.9, -1.71, -0.5, -1.67, -0.04);
  shape.bezierCurveTo(-1.63, 0.36, -1.3, 0.72, -0.88, 0.84);
  shape.bezierCurveTo(-0.64, 0.92, -0.3, 0.94, 0, 0.92);
  return shape;
}

/** Dished thumbstick: base, shaft and a concave cap in a single lathe profile. */
function thumbstickGeometry() {
  const profile: Array<[number, number]> = [
    [0.0, 0.0],
    [0.2, 0.0],
    [0.212, 0.02],
    [0.212, 0.045],
    [0.17, 0.062],
    [0.11, 0.088],
    [0.108, 0.14],
    [0.15, 0.163],
    [0.176, 0.203],
    [0.172, 0.242],
    [0.142, 0.258],
    [0.12, 0.238],
    [0.062, 0.224],
    [0.0, 0.221],
  ];
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    40,
  );
}

function dpadShape() {
  const arm = 0.15;
  const span = 0.36;
  const shape = new THREE.Shape();
  shape.moveTo(-arm, span);
  shape.lineTo(arm, span);
  shape.lineTo(arm, arm);
  shape.lineTo(span, arm);
  shape.lineTo(span, -arm);
  shape.lineTo(arm, -arm);
  shape.lineTo(arm, -span);
  shape.lineTo(-arm, -span);
  shape.lineTo(-arm, -arm);
  shape.lineTo(-span, -arm);
  shape.lineTo(-span, arm);
  shape.lineTo(-arm, arm);
  shape.closePath();
  return shape;
}

export function createController(materials: StudioMaterials) {
  const group = new THREE.Group();

  const shellDepth = 0.5;
  const shellBevel = 0.13;
  const faceZ = shellDepth / 2 + shellBevel; // 0.38

  const shell = new THREE.Mesh(extrude(controllerOutline(), shellDepth, shellBevel, 48), materials.shell);
  group.add(shell);

  // Charcoal face plate the sticks, d-pad and buttons sit on.
  const plate = new THREE.Mesh(extrude(roundedRectShape(2.38, 1.28, 0.5), 0.06, 0.045), materials.dark);
  plate.position.set(0, -0.06, faceZ - 0.04);
  group.add(plate);
  const plateZ = faceZ + 0.035; // 0.415

  // Touchpad with flanking light bar strips.
  const touchpad = new THREE.Mesh(extrude(roundedRectShape(1.08, 0.48, 0.16), 0.05, 0.03), materials.darkGloss);
  touchpad.position.set(0, 0.33, faceZ + 0.015);
  group.add(touchpad);

  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.4, 0.03), materials.accent);
    strip.position.set(side * 0.61, 0.33, plateZ + 0.002);
    group.add(strip);
  }

  // Sticks (dished caps), lower centre like the real pad.
  const stickGeometry = thumbstickGeometry();
  for (const side of [-1, 1]) {
    const stick = new THREE.Mesh(stickGeometry, materials.plastic);
    stick.position.set(side * 0.42, -0.26, plateZ);
    stick.rotation.x = Math.PI / 2;
    group.add(stick);

    const well = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.018, 10, 36), materials.rubber);
    well.position.set(side * 0.42, -0.26, plateZ + 0.002);
    group.add(well);
  }

  // D-pad.
  const dpad = new THREE.Mesh(extrude(dpadShape(), 0.035, 0.02, 8), materials.plastic);
  dpad.position.set(-0.88, 0.22, plateZ + 0.01);
  group.add(dpad);
  const dpadHub = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.03, 24), materials.rubber);
  dpadHub.rotation.x = Math.PI / 2;
  dpadHub.position.set(-0.88, 0.22, plateZ + 0.055);
  group.add(dpadHub);

  // Face buttons with engraved glyphs.
  const glyphs: Glyph[] = ['triangle', 'circle', 'cross', 'square'];
  const placements: Array<[number, number]> = [
    [0, 0.19],
    [0.19, 0],
    [0, -0.19],
    [-0.19, 0],
  ];
  glyphs.forEach((glyph, index) => {
    const [dx, dy] = placements[index];
    const x = 0.88 + dx;
    const y = 0.22 + dy;

    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.12, 0.06, 32), materials.dark);
    button.rotation.x = Math.PI / 2;
    button.position.set(x, y, plateZ + 0.03);
    group.add(button);

    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.108, 32),
      new THREE.MeshPhysicalMaterial({
        map: glyphTexture(glyph),
        roughness: 0.34,
        clearcoat: 0.7,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1,
      }),
    );
    face.position.set(x, y, plateZ + 0.061);
    group.add(face);
  });

  // PS button.
  const psButton = new THREE.Mesh(extrude(roundedRectShape(0.26, 0.09, 0.045), 0.02, 0.012, 12), materials.darkGloss);
  psButton.position.set(0, -0.02, plateZ + 0.005);
  group.add(psButton);
  const psDot = new THREE.Mesh(new THREE.CircleGeometry(0.022, 20), materials.accentSoft);
  psDot.position.set(0, -0.02, plateZ + 0.035);
  group.add(psDot);

  // Shoulder buttons + triggers.
  for (const side of [-1, 1]) {
    const bumper = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.16, 0.32, 4, 0.07), materials.shell);
    bumper.position.set(side * 1.0, 0.68, -0.02);
    bumper.rotation.set(-0.12, 0, side * -0.2);
    group.add(bumper);

    const trigger = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.13, 0.3, 4, 0.055), materials.shell);
    trigger.position.set(side * 1.02, 0.72, -0.33);
    trigger.rotation.set(-0.45, 0, side * -0.2);
    group.add(trigger);
  }

  return group;
}

/* ------------------------------------------------------------------ console */

export function createConsole(materials: StudioMaterials) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(new RoundedBoxGeometry(1.45, 2.15, 1.45, 8, 0.15), materials.shell);
  group.add(body);

  // Raised base band.
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.47, 0.18, 1.47, 4, 0.07), materials.plastic);
  base.position.y = -1.0;
  group.add(base);

  // Recessed top vent with radial fins and hub.
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 64), materials.rubber);
  vent.position.y = 1.055;
  group.add(vent);

  const finGeometry = new THREE.BoxGeometry(0.4, 0.014, 0.03);
  for (let i = 0; i < 22; i += 1) {
    const angle = (i / 22) * Math.PI * 2;
    const fin = new THREE.Mesh(finGeometry, materials.plastic);
    fin.position.set(Math.cos(angle) * 0.28, 1.077, Math.sin(angle) * 0.28);
    fin.rotation.y = -angle;
    group.add(fin);
  }

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 32), materials.plastic);
  hub.position.y = 1.083;
  group.add(hub);

  // Front face: power ring, USB port, seam lines.
  const front = new THREE.Group();
  front.position.z = 0.726;
  group.add(front);

  const power = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 32), materials.darkGloss);
  power.rotation.x = Math.PI / 2;
  power.position.set(0.42, -0.72, 0);
  front.add(power);

  const powerRing = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.008, 8, 40), materials.accentSoft);
  powerRing.position.set(0.42, -0.72, 0.016);
  front.add(powerRing);

  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.085, 0.03), materials.rubber);
  usb.position.set(-0.3, -0.72, 0);
  front.add(usb);

  const usbInner = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.048, 0.014), materials.metal);
  usbInner.position.set(-0.3, -0.72, 0.014);
  front.add(usbInner);

  for (const y of [0.52, -0.46]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.006, 0.004), materials.plastic);
    seam.position.set(0, y, 0.001);
    front.add(seam);
  }

  return group;
}

/* ------------------------------------------------------------ earbuds case */

export function createEarbudsCase(materials: StudioMaterials) {
  const group = new THREE.Group();

  // Two shells with a real gap between them: the seam follows the body instead
  // of a slab poking through the rounded silhouette.
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.56, 0.42, 6, 0.16), materials.shellGloss);
  base.position.y = -0.19;
  group.add(base);

  const lid = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.38, 0.42, 6, 0.16), materials.shellGloss);
  lid.position.y = 0.28;
  group.add(lid);

  // Dark inner rim visible through the seam.
  const inner = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.1, 0.33, 4, 0.05), materials.rubber);
  inner.position.y = 0.085;
  group.add(inner);

  // Hinge.
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 20), materials.metal);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.09, -0.175);
  group.add(hinge);

  // Status LED.
  const led = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 24), materials.led);
  led.rotation.x = Math.PI / 2;
  led.position.set(0, -0.24, 0.204);
  group.add(led);

  // Charging port on the bottom edge.
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.06), materials.rubber);
  port.position.set(0, -0.465, 0.06);
  group.add(port);

  return group;
}

/* ------------------------------------------------------------------ laptop */

export function createLaptop(materials: StudioMaterials) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.16, 1.7, 6, 0.06), materials.shell);
  base.position.y = -0.08;
  group.add(base);

  const well = new THREE.Mesh(new RoundedBoxGeometry(2.25, 0.02, 1.35, 4, 0.04), materials.dark);
  well.position.set(0, 0.0, 0.05);
  group.add(well);

  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.012, 0.45, 4, 0.04), materials.darkGloss);
  pad.position.set(0, 0.005, 0.55);
  group.add(pad);

  const lid = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.65, 0.12, 6, 0.06), materials.shell);
  lid.position.set(0, 0.88, -0.82);
  lid.rotation.x = -0.22;
  group.add(lid);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.4), new THREE.MeshStandardMaterial({
    color: 0x0d1220,
    emissive: new THREE.Color('#5865f2'),
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.1,
  }));
  screen.position.set(0, 0.88, -0.75);
  screen.rotation.x = -0.22;
  group.add(screen);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16), materials.metal);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.0, -0.05);
  group.add(hinge);

  return group;
}

/* ------------------------------------------------------------------ airpods */

export function createAirPods(materials: StudioMaterials) {
  const group = new THREE.Group();

  const makePod = (side: number) => {
    const pod = new THREE.Group();
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.2, 16), materials.shellGloss);
    tip.rotation.x = Math.PI;
    tip.position.set(0, -0.04, 0);
    pod.add(tip);

    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), materials.shellGloss);
    bud.scale.set(1, 1.08, 0.92);
    pod.add(bud);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 1.0, 12), materials.shell);
    stem.position.set(side * 0.06, -0.66, 0);
    stem.rotation.z = side * 0.1;
    pod.add(stem);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), materials.shellGloss);
    cap.position.set(side * 0.12, -1.18, 0);
    pod.add(cap);

    const grille = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), materials.darkGloss);
    grille.position.set(0, 0, 0.22);
    pod.add(grille);

    return pod;
  };

  const left = makePod(-1);
  left.position.set(-0.7, 0.1, 0);
  left.rotation.set(0.15, -0.5, -0.1);
  group.add(left);

  const right = makePod(1);
  right.position.set(0.7, 0.1, 0);
  right.rotation.set(0.15, 0.5, 0.1);
  group.add(right);

  return group;
}
