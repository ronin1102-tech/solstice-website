const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover)').matches;

// Hero parallax + scroll-linked handoff (copy lifts and fades as the eclipse rises)
const photo = document.querySelector('[data-parallax]');
const hero = document.querySelector('.hero');
if (photo && !reduce) {
  let queued = false;
  const update = () => {
    queued = false;
    const y = Math.min(scrollY, innerHeight);
    photo.style.transform = `translate3d(0,${y * 0.25}px,0)`;
    hero.style.setProperty('--hp', (y / innerHeight).toFixed(3));
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

// Card spotlight follows the cursor; philosophy cards also tilt toward it
if (!reduce && finePointer) {
  document.querySelectorAll('.card, .spot').forEach(el => {
    const tilt = el.classList.contains('tilt');
    el.addEventListener('pointerenter', () => tilt && el.classList.add('tilting'));
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
      if (tilt) el.style.transform = `perspective(800px) translateY(-6px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg) translateZ(12px)`;
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('tilting'); el.style.transform = ''; });
  });
}

// Eclipse (Three.js, loaded lazily when scrolled near so first paint stays fast).
// The animation itself starts only once the section is properly in view, so the
// corona always forms in front of the visitor rather than off-screen.
const canvas = document.getElementById('eclipse');
const io = new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting) return;
  io.disconnect();
  try { await startEclipse(); } catch (err) { console.warn('Eclipse skipped', err); }
}, { rootMargin: '300px' });
io.observe(canvas);

async function startEclipse() {
  const THREE = await import('./assets/three.module.js');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  cam.position.z = 5;

  const uni = { uT: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 }, uS: { value: 1 } };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, premultipliedAlpha: true, depthWrite: false,
    vertexShader: 'varying vec2 v;void main(){v=position.xy;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `varying vec2 v;uniform float uT,uTime,uAspect,uS;
      void main(){
        vec2 p=v;p.x*=uAspect;p/=uS;
        float r=length(p),a=atan(p.y,p.x);
        float form=smoothstep(0.,1.,uT);
        float R=.42,d=r-R,outer=step(0.,d);
        float u=(a+3.14159)/6.28318;
        float sweep=smoothstep(u-.2,u,form*1.25);
        // Bright limb + ring
        float ring=exp(-pow(d*30.,2.));
        float limb=exp(-pow(d*95.,2.));
        // Coronal streamers: integer angular frequencies keep them seamless around the circle
        float s1=.5+.5*sin(5.*a+1.6*sin(3.*a+uTime*.21));
        float s2=.5+.5*sin(9.*a-uTime*.13+2.*sin(2.*a-uTime*.07));
        float s3=.5+.5*sin(14.*a+uTime*.17);
        float rays=pow(s1*.55+s2*.3+s3*.15,2.2);
        float bloom=exp(-d*10.)*.95+exp(-d*4.2)*.24;
        float streak=rays*exp(-d*3.4)*.7*smoothstep(0.,.04,d);
        float breathe=1.+.08*sin(uTime*1.1);
        // Fade the outer light to nothing before the canvas edge so no box ever shows
        float edge=smoothstep(1.,.55,abs(v.y))*smoothstep(1.,.7,abs(v.x));
        float I=(ring*1.7+limb*1.3+(bloom+streak)*outer*breathe*edge)*sweep;
        // Diamond-ring bead riding the head of the sweep while the corona forms
        float ha=form*1.25*6.28318-3.14159;
        float bead=exp(-length(p-R*vec2(cos(ha),sin(ha)))*26.)*smoothstep(0.,.08,form)*(1.-smoothstep(.62,.8,form))*2.4;
        I+=bead;
        // Faint blue halo that ties the corona to the particle field
        float haze=exp(-pow((d-.2)*4.5,2.))*.14*outer*form*edge;
        vec3 hot=vec3(1.,.97,.88),gold=vec3(.91,.72,.29),amber=vec3(.8,.43,.12);
        vec3 col=mix(amber,gold,clamp(exp(-d*7.),0.,1.));
        col=mix(col,hot,clamp(ring+limb+bead*.5,0.,1.));
        vec3 light=col*(1.-exp(-I*1.25))+vec3(.23,.51,.96)*haze;
        float A=clamp(max(I*.55,haze),0.,1.);
        float inside=1.-smoothstep(R-.008,R+.001,r);
        vec3 rgb=mix(light,vec3(.039,.043,.055)*form,inside);
        gl_FragColor=vec4(rgb,mix(A,form,inside));
      }`
  })));

  // Particles: a blue halo plus a few gold sparks nearer the limb, additively blended
  const makeField = (n, inner, spread, color, size, opacity) => {
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) seed[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })));
    return { n, pos, seed, geo, inner, spread };
  };
  const fields = [makeField(1200, .46, .35, 0x3b82f6, 2.2, .9), makeField(260, .44, .1, 0xffd98a, 1.6, .8)];

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uni.uAspect.value = w / h;
    // Shrink the whole scene on narrow screens so the particle halo stays in frame
    uni.uS.value = Math.min(1, (w / h) / .92);
    cam.left = -w / h; cam.right = w / h; cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  let t0 = null, visible = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && t0 === null) t0 = performance.now();
  }, { threshold: .35 }).observe(canvas);

  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || t0 === null) return;
    const t = reduce ? 6 : (now - t0) / 1000;
    uni.uTime.value = t;
    uni.uT.value = Math.min(t / 4, 1);
    const k = Math.min(t / 5, 1), ease = 1 - Math.pow(1 - k, 3), s = uni.uS.value;
    for (const f of fields) {
      for (let i = 0; i < f.n; i++) {
        const sd = f.seed[i], ang = sd * 6.2832 * 7 + t * (.1 + sd * .15);
        // particles spiral in from far out and settle in a halo around the ring
        const target = f.inner + (sd * 7 % 1) * f.spread;
        const rad = (target + (1 - ease) * (1.6 + sd)) * s;
        f.pos[i * 3] = Math.cos(ang) * rad; f.pos[i * 3 + 1] = Math.sin(ang) * rad;
      }
      f.geo.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, cam);
  })(performance.now());
}
