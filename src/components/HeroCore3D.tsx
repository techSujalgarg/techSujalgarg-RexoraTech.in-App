import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';

export type ArchitectureFocus = 'overview' | 'web' | 'automation' | 'analytics' | 'digital';

interface HeroCore3DProps {
  onSelectFocus?: (focus: ArchitectureFocus) => void;
}

const CAMERA_PRESETS: Record<
  ArchitectureFocus,
  { pos: [number, number, number]; target: [number, number, number]; label: string }
> = {
  overview: { pos: [4.35, 3.05, 5.05], target: [0, 1.05, 0], label: 'Overview' },
  web: { pos: [3.6, 2.2, 2.4], target: [0.95, 1.55, 0], label: 'Web' },
  automation: { pos: [-3.5, 2.3, 2.5], target: [-0.95, 1.55, 0], label: 'Automation' },
  analytics: { pos: [0.2, 3.6, 3.9], target: [0, 1.6, 0.85], label: 'Analytics' },
  digital: { pos: [0.4, 2.1, -3.9], target: [0, 1.5, -0.85], label: 'Digital' },
};

// Pre-allocated scratch math helpers outside the render loop (zero GC)
const _vec3 = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat4 = new THREE.Matrix4();
const _euler = new THREE.Euler();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createBrushedMetalTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 2) {
      const shade = 112 + Math.floor(Math.sin(y * 0.45) * 18 + ((y * 37) % 19));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, 256, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createCalibrationDialTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0D1C38';
    ctx.fillRect(0, 0, 512, 512);
    const cx = 256;
    const cy = 256;

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 218, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 178, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const major = i % 6 === 0;
      const r1 = major ? 186 : 198;
      const r2 = 212;
      ctx.strokeStyle = major ? '#E2E8F0' : '#3B82F6';
      ctx.lineWidth = major ? 2.5 : 1.25;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 122);
    grad.addColorStop(0, 'rgba(3, 8, 20, 0.72)');
    grad.addColorStop(0.55, 'rgba(5, 12, 28, 0.34)');
    grad.addColorStop(1, 'rgba(5, 12, 28, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const HeroCore3D: React.FC<HeroCore3DProps> = ({ onSelectFocus }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [focus, setFocus] = useState<ArchitectureFocus>('overview');
  const [explodeRatio, setExplodeRatio] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  const targetFocusRef = useRef<ArchitectureFocus>('overview');
  const transitionActiveRef = useRef<boolean>(false);
  const explodeTargetRef = useRef<number>(0);
  const playingRef = useRef<boolean>(true);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    targetFocusRef.current = focus;
    transitionActiveRef.current = true;
    requestRenderRef.current?.();
  }, [focus]);

  useEffect(() => {
    explodeTargetRef.current = explodeRatio;
    requestRenderRef.current?.();
  }, [explodeRatio]);

  useEffect(() => {
    playingRef.current = isPlaying;
    requestRenderRef.current?.();
  }, [isPlaying]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color('#081226');
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x081226, 0.048);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(...CAMERA_PRESETS.overview.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // Studio PBR environment reflection on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    // Warm/cool studio lighting rig (1 shadow caster)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0b162c, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.35);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Architectural studio floor & contact shadow grounding
    const brushedTex = createBrushedMetalTexture(maxAnisotropy);
    const dialTex = createCalibrationDialTexture(maxAnisotropy);
    const shadowTex = createContactShadowTexture();

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x09152b,
      roughness: 0.78,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const shadowDiscGeo = new THREE.CircleGeometry(2.3, 40);
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowDisc = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.015;
    scene.add(shadowDisc);

    // Composite 9-part RexoraTech Systems Core Group (bottom-center grounded at y = 0)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Shared PBR Materials with >= 0.25 roughness/metalness contrast across adjacent parts
    const plinthMetalMat = new THREE.MeshStandardMaterial({
      color: 0x16294a,
      metalness: 0.85,
      roughness: 0.34,
      bumpMap: brushedTex,
      bumpScale: 0.012,
    });
    const ceramicWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.08,
      roughness: 0.68,
    });
    const electricBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      metalness: 0.35,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });
    const titaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1,
      metalness: 0.92,
      roughness: 0.18,
      anisotropy: 0.8,
      bumpMap: brushedTex,
      bumpScale: 0.008,
    });
    const crystalCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      metalness: 0.05,
      roughness: 0.08,
      clearcoat: 1.0,
      ior: 1.65,
      thickness: 1.4,
      attenuationColor: new THREE.Color(0x1d4ed8),
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 1.0,
    });
    const dialMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: dialTex,
      roughness: 0.45,
      metalness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const emissiveAccentMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 1.4,
      roughness: 0.3,
      metalness: 0.2,
    });

    // Part 1: Machined Hexagonal Plinth Base (ExtrudeGeometry with bevel)
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = 1.65;
      if (i === 0) hexShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else hexShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    hexShape.closePath();
    const plinthGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    plinthGeo.rotateX(-Math.PI / 2);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMetalMat);
    plinthMesh.position.y = 0.05;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    coreGroup.add(plinthMesh);

    // Part 2: Precision Calibration Ring Surface (coplanar offset >= 0.02 + polygonOffset)
    const dialGeo = new THREE.CircleGeometry(1.38, 48);
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.y = 0.34;
    dialMesh.receiveShadow = true;
    coreGroup.add(dialMesh);

    // Part 3: Lower Stepped Stator Housing (LatheGeometry)
    const statorPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.92, 0.0),
      new THREE.Vector2(0.86, 0.24),
      new THREE.Vector2(0.68, 0.32),
      new THREE.Vector2(0.64, 0.56),
      new THREE.Vector2(0.36, 0.62),
      new THREE.Vector2(0.0, 0.62),
    ];
    const statorGeo = new THREE.LatheGeometry(statorPoints, 32);
    const statorMesh = new THREE.Mesh(statorGeo, ceramicWhiteMat);
    statorMesh.position.y = 0.34;
    statorMesh.castShadow = true;
    statorMesh.receiveShadow = true;
    coreGroup.add(statorMesh);

    // Part 4: Central Crystalline Data Prism Core
    const prismGeo = new THREE.OctahedronGeometry(0.54, 0);
    const prismMesh = new THREE.Mesh(prismGeo, crystalCoreMat);
    prismMesh.position.y = 1.62;
    prismMesh.castShadow = true;
    coreGroup.add(prismMesh);

    // Inner core emitter kernel
    const kernelGeo = new THREE.IcosahedronGeometry(0.24, 0);
    const kernelMesh = new THREE.Mesh(kernelGeo, emissiveAccentMat);
    kernelMesh.position.y = 1.62;
    coreGroup.add(kernelMesh);

    // Part 5: 4 Modular Pillar Fins (ExtrudeGeometry) around the core
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.42, 0.14);
    finShape.lineTo(0.48, 0.96);
    finShape.lineTo(0.14, 1.18);
    finShape.lineTo(0, 1.05);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    finGeo.translate(-0.22, -0.58, -0.07);

    const finGroup = new THREE.Group();
    finGroup.position.y = 1.56;
    coreGroup.add(finGroup);

    const fins: { mesh: THREE.Mesh; dir: THREE.Vector3; baseRadius: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const mat = i % 2 === 0 ? electricBlueMat : ceramicWhiteMat;
      const finMesh = new THREE.Mesh(finGeo, mat);
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      finMesh.position.copy(dir).multiplyScalar(0.84);
      finMesh.rotation.y = -angle;
      finMesh.castShadow = true;
      finGroup.add(finMesh);
      fins.push({ mesh: finMesh, dir, baseRadius: 0.84 });
    }

    // Part 6: 4 Precision Data Conduit Arcs (TubeGeometry)
    const conduitGroup = new THREE.Group();
    coreGroup.add(conduitGroup);
    const conduitGeos: THREE.TubeGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(c * 1.16, 0.36, s * 1.16),
        new THREE.Vector3(c * 1.28, 1.05, s * 1.28),
        new THREE.Vector3(c * 0.92, 2.08, s * 0.92),
        new THREE.Vector3(c * 0.42, 2.48, s * 0.42),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.032, 10, false);
      conduitGeos.push(tubeGeo);
      const tubeMesh = new THREE.Mesh(tubeGeo, titaniumMat);
      tubeMesh.castShadow = true;
      conduitGroup.add(tubeMesh);
    }

    // Part 7: Upper Gimbal Gyro Ring
    const gyroGeo = new THREE.TorusGeometry(1.06, 0.048, 18, 64);
    const gyroMesh = new THREE.Mesh(gyroGeo, titaniumMat);
    gyroMesh.position.y = 1.62;
    gyroMesh.rotation.x = Math.PI / 2.6;
    gyroMesh.castShadow = true;
    coreGroup.add(gyroMesh);

    // Part 8: Upper Telemetry Crown & Spire (LatheGeometry)
    const crownPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.46, 0.0),
      new THREE.Vector2(0.38, 0.16),
      new THREE.Vector2(0.18, 0.24),
      new THREE.Vector2(0.06, 0.54),
      new THREE.Vector2(0.0, 0.58),
    ];
    const crownGeo = new THREE.LatheGeometry(crownPoints, 28);
    const crownMesh = new THREE.Mesh(crownGeo, plinthMetalMat);
    crownMesh.position.y = 2.42;
    crownMesh.castShadow = true;
    coreGroup.add(crownMesh);

    const collarGeo = new THREE.TorusGeometry(0.28, 0.025, 12, 36);
    const collarMesh = new THREE.Mesh(collarGeo, emissiveAccentMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 2.52;
    coreGroup.add(collarMesh);

    // Part 9: InstancedMesh Orbital Data Lattice (36 micro-nodes)
    const NODE_COUNT = 36;
    const nodeGeo = new THREE.OctahedronGeometry(0.045, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.7,
      roughness: 0.25,
      metalness: 0.6,
    });
    const nodeInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT);
    nodeInstanced.frustumCulled = false;
    coreGroup.add(nodeInstanced);

    const orbitParams = Array.from({ length: NODE_COUNT }, (_, i) => ({
      radius: 1.48 + (i % 3) * 0.24,
      speed: 0.35 + (i % 4) * 0.12,
      yOffset: 0.9 + ((i % 7) / 6) * 1.55,
      phase: (i / NODE_COUNT) * Math.PI * 2,
    }));

    const updateInstances = (elapsed: number, explode: number) => {
      for (let i = 0; i < NODE_COUNT; i++) {
        const p = orbitParams[i];
        const angle = p.phase + elapsed * p.speed;
        const r = p.radius + explode * 0.45;
        _vec3.set(Math.cos(angle) * r, p.yOffset + Math.sin(elapsed * 1.4 + p.phase) * 0.08, Math.sin(angle) * r);
        _euler.set(elapsed + i, elapsed * 0.7, 0);
        _quat.setFromEuler(_euler);
        _mat4.compose(_vec3, _quat, _scale);
        nodeInstanced.setMatrixAt(i, _mat4);
      }
      nodeInstanced.instanceMatrix.needsUpdate = true;
      nodeInstanced.computeBoundingSphere();
    };
    updateInstances(0, 0);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minPolarAngle = 0.25;
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let currentExplode = 0;
    let elapsedTotal = 0;
    let lastTimestamp = performance.now();

    const applySceneState = (dt: number) => {
      if (playingRef.current) {
        elapsedTotal += dt;
        prismMesh.rotation.y = elapsedTotal * 0.55;
        kernelMesh.rotation.y = -elapsedTotal * 0.9;
        finGroup.rotation.y = elapsedTotal * 0.22;
        gyroMesh.rotation.z = elapsedTotal * 0.35;
      }

      // Exponentially damped exploded view separation
      const targetExplode = explodeTargetRef.current;
      const dampFactor = 1 - Math.exp(-7.5 * dt);
      currentExplode += (targetExplode - currentExplode) * dampFactor;

      for (let i = 0; i < fins.length; i++) {
        const f = fins[i];
        f.mesh.position.copy(f.dir).multiplyScalar(f.baseRadius + currentExplode * 0.72);
      }
      crownMesh.position.y = 2.42 + currentExplode * 0.65;
      collarMesh.position.y = 2.52 + currentExplode * 0.65;
      prismMesh.position.y = 1.62 + currentExplode * 0.22;
      kernelMesh.position.y = 1.62 + currentExplode * 0.22;

      updateInstances(elapsedTotal, currentExplode);

      // Exponentially damped camera preset glide
      if (transitionActiveRef.current) {
        const preset = CAMERA_PRESETS[targetFocusRef.current];
        const camDamp = isSoftwareGl ? 1 : 1 - Math.exp(-6.0 * dt);
        _vec3.set(...preset.pos);
        camera.position.lerp(_vec3, camDamp);
        _vec3.set(...preset.target);
        controls.target.lerp(_vec3, camDamp);

        if (camera.position.distanceTo(new THREE.Vector3(...preset.pos)) < 0.03) {
          transitionActiveRef.current = false;
        }
      }

      controls.update();
    };

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let renderBusy = false;
    let renderDirty = false;
    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
        lastTimestamp = now;
        applySceneState(dt);
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || transitionActiveRef.current || Math.abs(explodeTargetRef.current - currentExplode) > 0.005)) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };
    requestRenderRef.current = requestRender;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      if (playingRef.current || transitionActiveRef.current || Math.abs(explodeTargetRef.current - currentExplode) > 0.005) {
        applySceneState(dt);
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        if (playingRef.current) {
          afterDraw(tick);
        }
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    const handleControlStart = () => {
      transitionActiveRef.current = false;
    };
    const handleControlChange = () => {
      if (!playingRef.current || isSoftwareGl) {
        requestRender();
      }
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);

    // Initial render
    applySceneState(0.016);
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      // On software WebGL, pace with afterDraw only while playing, avoiding main-thread starvation
      if (playingRef.current) {
        afterDraw(tick);
      }
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      shadowDiscGeo.dispose();
      shadowDiscMat.dispose();
      plinthGeo.dispose();
      dialGeo.dispose();
      statorGeo.dispose();
      prismGeo.dispose();
      kernelGeo.dispose();
      finGeo.dispose();
      conduitGeos.forEach((g) => g.dispose());
      gyroGeo.dispose();
      crownGeo.dispose();
      collarGeo.dispose();
      nodeGeo.dispose();
      plinthMetalMat.dispose();
      ceramicWhiteMat.dispose();
      electricBlueMat.dispose();
      titaniumMat.dispose();
      crystalCoreMat.dispose();
      dialMat.dispose();
      emissiveAccentMat.dispose();
      nodeMat.dispose();
      brushedTex.dispose();
      dialTex.dispose();
      shadowTex.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleFocusSelect = (nextFocus: ArchitectureFocus) => {
    setFocus(nextFocus);
    onSelectFocus?.(nextFocus);
  };

  return (
    <div
      className="relative w-full h-full min-h-[420px] lg:min-h-[540px] rounded-xl overflow-hidden border border-white/15 bg-[#081226]"
      data-testid="rexora-3d-viewport"
      data-focus={focus}
    >
      {/* Isolated WebGL canvas mount outside sibling React UI */}
      <div ref={mountRef} className="w-full h-full min-h-[420px] lg:min-h-[540px]" />

      {/* Minimal top-left static caption */}
      <div className="pointer-events-none absolute top-4 left-4 px-3 py-1.5 rounded-md bg-[#0B162C]/90 border border-white/15">
        <p className="text-xs font-medium text-slate-200 tracking-wide">
          RexoraTech Systems Architecture · Interactive 3D
        </p>
      </div>

      {/* Collapsible compact bottom dock (no backdrop-filter over WebGL) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[540px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D architecture controls' : 'Hide 3D architecture controls'}
          className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-slate-200 bg-[#0B162C]/95 border border-white/20 hover:bg-[#132445] transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full rounded-xl bg-[#0B162C]/95 border border-white/15 p-3 space-y-2.5 text-xs text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Architecture focus presets">
                {(Object.keys(CAMERA_PRESETS) as ArchitectureFocus[]).map((key) => {
                  const active = focus === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleFocusSelect(key)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {CAMERA_PRESETS[key].label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  aria-label={isPlaying ? 'Pause 3D rotation' : 'Play 3D rotation'}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFocus('overview');
                    setExplodeRatio(0);
                    transitionActiveRef.current = true;
                  }}
                  aria-label="Reset 3D view"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 border-t border-white/10">
              <label htmlFor="rexora-explode-slider" className="text-slate-300 whitespace-nowrap shrink-0">
                Assembly Split
              </label>
              <input
                id="rexora-explode-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeRatio * 100)}
                onChange={(e) => setExplodeRatio(Number(e.target.value) / 100)}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <span className="font-mono tabular-nums text-slate-300 w-9 text-right shrink-0">
                {Math.round(explodeRatio * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
