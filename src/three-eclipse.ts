import * as THREE from 'three';

export interface EclipseController {
  start(): void;
  pause(): void;
  dispose(): void;
}

/**
 * Scaffold for the 5-second gold corona particle animation.
 * Scene, camera, renderer, resize handling and an IntersectionObserver
 * pause/resume loop are wired up. Particle system + timeline: TODO.
 */
export function initEclipse(canvas: HTMLCanvasElement): EclipseController {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // cheaper on legacy GPUs
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const resize = (): void => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // TODO: build corona particles (THREE.Points + BufferGeometry), black disc occluder,
  // and drive a 0..5s timeline from `elapsed` in the render loop.
  const DURATION = 5; // seconds
  const clock = new THREE.Clock(false);
  let rafId = 0;
  let running = false;

  const render = (): void => {
    if (!running) return;
    rafId = requestAnimationFrame(render);
    const elapsed = clock.getElapsedTime() % DURATION;
    void elapsed; // used by the particle timeline once implemented
    renderer.render(scene, camera);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    clock.start();
    render();
  };

  const pause = (): void => {
    running = false;
    clock.stop();
    cancelAnimationFrame(rafId);
  };

  // Pause when off-screen, resume when visible
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) start();
        else pause();
      }
    },
    { threshold: 0.05 },
  );
  io.observe(canvas);

  const onVisibility = (): void => {
    if (document.hidden) pause();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const dispose = (): void => {
    pause();
    io.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    renderer.dispose();
  };

  return { start, pause, dispose };
}
