const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero parallax
const photo = document.querySelector('[data-parallax]');
if (photo && !reduce) {
  addEventListener('scroll', () => {
    const y = Math.min(scrollY, innerHeight);
    photo.style.transform = `translate3d(0,${y * 0.25}px,0)`;
  }, { passive: true });
}

// Card tilt toward cursor
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(12px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
}

// Eclipse (Three.js, loaded lazily when scrolled near so first paint stays fast)
const canvas = document.getElementById('eclipse');
const io = new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting) return;
  io.disconnect();
  try { await startEclipse(); } catch (err) { console.warn('Eclipse skipped', err); }
}, { rootMargin: '300px' });
io.observe(canvas);

async function startEclipse() {
  const THREE = await import('./assets/three.module.js');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  cam.position.z = 5;

  const uni = { uT: { value: 0 }, uAspect: { value: 1 } };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: uni, transparent: true,
    vertexShader: 'varying vec2 v;void main(){v=position.xy;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `varying vec2 v;uniform float uT,uAspect;
      void main(){
        vec2 p=v;p.x*=uAspect;float r=length(p),a=atan(p.y,p.x);
        float form=smoothstep(0.,1.,uT);
        float R=.42;
        float u=(a+3.14159)/6.28318;
        float sweep=smoothstep(u-.2,u,form*1.25);
        float ring=exp(-pow((r-R)*28.,2.));
        float glow=exp(-(r-R)*6.)*step(R,r)*.35*(.7+.3*sin(a*7.+uT*2.));
        float c=(ring*1.4+glow)*sweep;
        vec3 col=mix(vec3(.91,.72,.29),vec3(1.,.92,.7),ring);
        float inside=1.-smoothstep(R-.012,R-.002,r);
        vec3 rgb=mix(col,vec3(.039,.043,.055),inside);
        gl_FragColor=vec4(rgb,max(clamp(c,0.,1.),inside*form));
      }`
  })));

  const N = 1200, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { seed[i] = Math.random(); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x3b82f6, size: 2.2, sizeAttenuation: false, transparent: true, opacity: .85, depthWrite: false }));
  scene.add(pts);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uni.uAspect.value = w / h;
    cam.left = -w / h; cam.right = w / h; cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduce ? 5 : (now - t0) / 1000;
    uni.uT.value = Math.min(t / 4, 1) + (t > 5 ? (t - 5) * 0.02 : 0);
    const k = Math.min(t / 5, 1), ease = 1 - Math.pow(1 - k, 3);
    for (let i = 0; i < N; i++) {
      const s = seed[i], ang = s * 6.2832 * 7 + t * (.1 + s * .15);
      // particles spiral in from far out and settle in a halo around the ring
      const target = .46 + (s * 7 % 1) * .35;
      const rad = target + (1 - ease) * (1.6 + s) ;
      pos[i * 3] = Math.cos(ang) * rad; pos[i * 3 + 1] = Math.sin(ang) * rad; pos[i * 3 + 2] = 0;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, cam);
  })(t0);
}
