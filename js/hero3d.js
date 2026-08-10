/* ================================================================
   Interactive real-time 3D hero — Three.js
   Loads assets/models/avatar.glb when present (see MODEL_GUIDE.md);
   until then renders a procedural stylized placeholder bust with the
   same node names (Head, Eye_L, Eye_R, Body) so every interaction —
   head/eye cursor tracking, cursor light, idle breathing, scroll —
   is already live and the final GLB is a drop-in replacement.
================================================================ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const MODEL_URL = "assets/models/avatar.glb";
const container = document.getElementById("characterCanvas");
const fallbackImg = document.getElementById("characterImg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = window.matchMedia("(min-width: 769px)").matches;

function showFallback() {
  if (fallbackImg) fallbackImg.classList.add("active");
  if (container) container.style.display = "none";
}

if (!container || !isDesktop || reduceMotion) {
  // mobile & reduced-motion keep the lightweight composition
  if (container && (!isDesktop || reduceMotion)) showFallback();
} else {
  init();
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    showFallback();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 1.3, 3.7);
  camera.lookAt(0, 1.27, 0);

  /* ---------------- lights ---------------- */
  scene.add(new THREE.HemisphereLight(0xcbc3e3, 0x14101c, 0.55));
  const key = new THREE.DirectionalLight(0xfff2e6, 1.35);
  key.position.set(2.5, 3.2, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9db4ff, 0.3);
  fill.position.set(-2.5, 1.4, 2.5);
  scene.add(fill);
  const rim = new THREE.PointLight(0x8b5cf6, 26, 12, 2);
  rim.position.set(0, 2.1, -2.6);
  scene.add(rim);
  const cursorLight = new THREE.PointLight(0xa855f7, 10, 9, 2);
  cursorLight.position.set(0, 1.7, 2.2);
  scene.add(cursorLight);

  /* ---------------- avatar root ---------------- */
  const root = new THREE.Group();
  scene.add(root);

  const nodes = { head: null, eyeL: null, eyeR: null, body: null, chest: null };
  let mixer = null;
  let placeholderParts = null;

  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  loader.load(
    MODEL_URL,
    function (gltf) {
      const model = gltf.scene;
      // normalize: fit to ~1.9 units tall, feet at y=0
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 1.9 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      box.setFromObject(model);
      model.position.y -= box.min.y;
      model.traverse(function (o) {
        const n = (o.name || "").toLowerCase();
        if (!nodes.head && /head/.test(n)) nodes.head = o;
        if (!nodes.eyeL && /eye[_.-]?l|lefteye|eye\.l/.test(n)) nodes.eyeL = o;
        if (!nodes.eyeR && /eye[_.-]?r|righteye|eye\.r/.test(n)) nodes.eyeR = o;
        if (!nodes.chest && /chest|spine2|spine_02/.test(n)) nodes.chest = o;
        if (o.isMesh) { o.frustumCulled = false; }
      });
      nodes.body = model;
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
      }
      root.add(model);
      revealCanvas();
    },
    undefined,
    function () {
      // no avatar.glb yet — build the procedural stylized placeholder bust
      placeholderParts = buildPlaceholder(root, nodes);
      revealCanvas();
    }
  );

  /* ---------------- procedural placeholder ---------------- */
  function buildPlaceholder(parent, nodes) {
    const skin = new THREE.MeshStandardMaterial({ color: 0xc98d64, roughness: 0.62, metalness: 0 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x272a52, roughness: 0.85, metalness: 0 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x17131c, roughness: 0.55, metalness: 0.1 });
    const white = new THREE.MeshStandardMaterial({ color: 0xe8e2e6, roughness: 0.4 });
    const iris = new THREE.MeshStandardMaterial({ color: 0x241a14, roughness: 0.15 });

    const body = new THREE.Group();
    body.name = "Body";

    // torso — clean rounded-shoulder bust silhouette, cropped by the canvas edge
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.75, 12, 28), shirt);
    torso.scale.set(1.28, 1, 0.62);
    torso.position.y = 0.42;
    body.add(torso);
    // buttons
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), dark);
      b.position.set(0, 0.95 - i * 0.17, 0.285);
      body.add(b);
    }
    // neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.115, 0.2, 16), skin);
    neck.position.y = 1.18;
    body.add(neck);

    // head group
    const head = new THREE.Group();
    head.name = "Head";
    head.position.y = 1.47;

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), skin);
    skull.scale.set(0.9, 1.08, 0.95);
    head.add(skull);
    // ears
    [-1, 1].forEach(function (s) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skin);
      ear.position.set(s * 0.28, -0.01, 0);
      ear.scale.set(0.45, 0.9, 0.65);
      head.add(ear);
    });
    // nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), skin);
    nose.position.set(0, -0.05, 0.285);
    nose.scale.set(0.75, 1.2, 1.1);
    head.add(nose);
    // mouth — subtle smile
    const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.07, 4, 8), new THREE.MeshStandardMaterial({ color: 0x5d3a34, roughness: 0.6 }));
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, -0.155, 0.265);
    head.add(mouth);
    // brows
    [-1, 1].forEach(function (s) {
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.075, 4, 8), dark);
      brow.rotation.z = Math.PI / 2 + s * 0.05;
      brow.position.set(s * 0.11, 0.105, 0.252);
      head.add(brow);
    });
    // beard hint — thin dark band around the jaw
    const beard = new THREE.Mesh(
      new THREE.SphereGeometry(0.288, 24, 24, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.26),
      new THREE.MeshStandardMaterial({ color: 0x1d1620, roughness: 0.8, transparent: true, opacity: 0.9 })
    );
    beard.scale.set(0.96, 1.05, 0.98);
    beard.position.y = -0.02;
    head.add(beard);

    // curly hair — small puffs hugging the scalp, clear of the face
    const hairGeo = new THREE.SphereGeometry(0.058, 8, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x191420, roughness: 0.6, metalness: 0.15 });
    const COUNT = 340;
    const hair = new THREE.InstancedMesh(hairGeo, hairMat, COUNT);
    const dummy = new THREE.Object3D();
    let placed = 0, tries = 0;
    while (placed < COUNT && tries < COUNT * 30) {
      tries++;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - Math.random());
      const z = Math.sin(phi) * Math.sin(theta); // forward component
      // top of the skull only, plus some back coverage; keep the face clear
      const onTop = phi < Math.PI * 0.42;
      const onBack = phi < Math.PI * 0.62 && z < -0.15;
      if (!onTop && !onBack) continue;
      if (phi > Math.PI * 0.3 && z > 0.35) continue; // hairline stays above brows
      const r = 0.29;
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta) * 0.96,
        r * Math.cos(phi) * 1.12 + 0.045,
        r * z * 0.97
      );
      dummy.scale.setScalar(0.75 + Math.random() * 0.7);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      dummy.updateMatrix();
      hair.setMatrixAt(placed++, dummy.matrix);
    }
    hair.count = placed;
    head.add(hair);

    // eyes (separate, trackable) — mostly recessed into the skull
    const eyes = [];
    [-1, 1].forEach(function (s) {
      const eye = new THREE.Group();
      eye.name = s < 0 ? "Eye_L" : "Eye_R";
      eye.position.set(s * 0.112, 0.03, 0.215);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), white);
      ball.scale.z = 0.72;
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), iris);
      pupil.position.z = 0.028;
      eye.add(ball);
      eye.add(pupil);
      head.add(eye);
      eyes.push(eye);
    });

    body.add(head);
    parent.add(body);

    nodes.body = body;
    nodes.head = head;
    nodes.eyeL = eyes[0];
    nodes.eyeR = eyes[1];
    nodes.chest = torso;
    return { torso: torso };
  }

  /* ---------------- entrance ---------------- */
  let revealT = -1;
  renderer.domElement.style.opacity = "0";
  renderer.domElement.style.transition = "opacity 1.1s ease";
  function revealCanvas() {
    requestAnimationFrame(function () {
      renderer.domElement.style.opacity = "1";
      revealT = 0;
    });
  }

  /* ---------------- cursor state ---------------- */
  let mx = 0, my = 0; // normalized -0.5..0.5
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  /* ---------------- scroll state (GSAP ScrollTrigger) ---------------- */
  const scrollState = { p: 0 };
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.to(scrollState, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: "#landingDiv", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  /* ---------------- sizing ---------------- */
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // keep the bust framed across aspect ratios
    camera.position.z = camera.aspect > 1.9 ? 3.5 : 3.7 + Math.max(0, 1.4 - camera.aspect) * 1.3;
  }
  resize();
  new ResizeObserver(resize).observe(container);

  /* ---------------- render loop ---------------- */
  const clock = new THREE.Clock();
  const charModelEl = document.getElementById("characterModel");
  let frame = 0;
  let running = true;
  document.addEventListener("visibilitychange", function () { running = !document.hidden; });

  const damp = THREE.MathUtils.damp;

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    frame++;
    // skip work while the hero is faded out (scrolled past)
    if (frame % 30 === 0 && charModelEl) {
      const cs = getComputedStyle(charModelEl);
      running2 = !(cs.visibility === "hidden" || parseFloat(cs.opacity) === 0);
    }
    if (!running2) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (mixer) mixer.update(dt);

    // entrance ease (subtle rise + settle)
    if (revealT >= 0 && revealT < 1) {
      revealT = Math.min(1, revealT + dt / 1.2);
      const e = 1 - Math.pow(1 - revealT, 3);
      root.position.y = (1 - e) * -0.12;
      root.scale.setScalar(0.985 + e * 0.015);
    }

    // idle: float + breathing + shoulder sway
    const floatY = Math.sin(t * 1.05) * 0.018;
    root.position.y = (revealT >= 1 ? 0 : root.position.y) + floatY * (revealT >= 1 ? 1 : revealT);
    if (nodes.chest && nodes.chest.isMesh) {
      const b = 1 + Math.sin(t * 1.8) * 0.008;
      nodes.chest.scale.y = b;
    }
    if (nodes.body) {
      nodes.body.rotation.z = Math.sin(t * 0.7) * 0.008;
      // cursor: body subtly follows
      nodes.body.rotation.y = damp(nodes.body.rotation.y, mx * 0.28 - scrollState.p * 0.45, 4, dt);
    }
    // cursor: head follows more
    if (nodes.head) {
      const microY = Math.sin(t * 0.55) * 0.012;
      nodes.head.rotation.y = damp(nodes.head.rotation.y, mx * 0.52 + microY, 5.5, dt);
      nodes.head.rotation.x = damp(nodes.head.rotation.x, my * 0.28, 5.5, dt);
    }
    // eyes: track fastest, clamped
    [nodes.eyeL, nodes.eyeR].forEach(function (eye) {
      if (!eye) return;
      eye.rotation.y = damp(eye.rotation.y, THREE.MathUtils.clamp(mx * 0.6, -0.3, 0.3), 8, dt);
      eye.rotation.x = damp(eye.rotation.x, THREE.MathUtils.clamp(my * 0.35, -0.18, 0.18), 8, dt);
    });
    // cursor-following purple light
    cursorLight.position.x = damp(cursorLight.position.x, mx * 2.8, 5, dt);
    cursorLight.position.y = damp(cursorLight.position.y, 1.75 - my * 1.3, 5, dt);
    // scroll: slight recede + glow shift
    root.rotation.y = damp(root.rotation.y, scrollState.p * -0.25, 5, dt);
    root.scale.setScalar(damp(root.scale.x, 1 - scrollState.p * 0.05, 5, dt));
    rim.intensity = 26 + Math.sin(t * 1.3) * 3 + scrollState.p * 14;

    renderer.render(scene, camera);
  }
  let running2 = true;
  tick();
}
