const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover)').matches;

// Scroll reveal
if (!reduce && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// Cursor spotlight on tiles (same surface as the homepage cards)
if (!reduce && finePointer) {
  document.querySelectorAll('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(e.clientX - r.left) / r.width * 100}%`);
    el.style.setProperty('--my', `${(e.clientY - r.top) / r.height * 100}%`);
  }));
}

// Runs fn only while el is on screen, so demos start when the visitor arrives
function whenVisible(el, fn) {
  let started = false;
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { started = true; fn(); } }, { threshold: .4 }).observe(el);
}
const wait = ms => new Promise(r => setTimeout(r, ms));

// Voice: press → listen → type, on a loop
const demo = document.querySelector('[data-voice-demo]');
if (demo) {
  const out = demo.querySelector('.typed'), status = demo.querySelector('.status');
  const lines = JSON.parse(demo.dataset.lines);
  if (reduce) { out.textContent = lines[0]; status.textContent = 'Typed'; }
  else whenVisible(demo, async () => {
    for (let n = 0; ; n++) {
      const line = lines[n % lines.length];
      out.textContent = ''; status.textContent = 'Hold the hotkey';
      await wait(900);
      demo.classList.add('listening'); status.textContent = 'Listening…';
      await wait(2200);
      demo.classList.remove('listening'); status.textContent = 'Typing';
      for (const ch of line) { out.textContent += ch; await wait(28 + Math.random() * 40); }
      status.textContent = 'Done — on your machine';
      await wait(2600);
    }
  });
}

// Grammar: click the underlined phrase to apply the fix
document.querySelectorAll('.fix').forEach(btn => btn.addEventListener('click', () => {
  if (btn.classList.contains('fixed')) return;
  btn.textContent = btn.dataset.fix;
  btn.classList.add('fixed');
  btn.setAttribute('aria-label', `Fixed: ${btn.dataset.fix}`);
  const hint = btn.closest('.try')?.querySelector('small');
  if (hint) hint.textContent = 'Fixed — and the sentence never left this page.';
}));

// Docs: highlight a line, watch the row land in SQLite
const persist = document.querySelector('[data-persist]');
if (persist) {
  const marks = [...persist.querySelectorAll('.mk')], body = persist.querySelector('tbody');
  const addRow = (i, m) => {
    const tr = document.createElement('tr');
    tr.className = 'new';
    tr.innerHTML = `<td>${i + 1}</td><td>${m.classList.contains('ul') ? 'underline' : 'highlight'}</td><td>${m.dataset.page}</td><td>${m.classList.contains('ul') ? '#3B82F6' : '#E8B84A'}</td>`;
    body.append(tr);
  };
  if (reduce) marks.forEach((m, i) => { m.style.setProperty('--k', 1); addRow(i, m); });
  else whenVisible(persist, async () => {
    for (;;) {
      body.textContent = '';
      marks.forEach(m => m.style.setProperty('--k', 0));
      await wait(800);
      for (const [i, m] of marks.entries()) {
        m.style.setProperty('--k', 1);
        await wait(900);
        addRow(i, m);
        await wait(700);
      }
      await wait(3200);
    }
  });
}

// Copy buttons on code blocks
document.querySelectorAll('.code').forEach(block => {
  const btn = document.createElement('button');
  btn.className = 'copy'; btn.type = 'button'; btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(block.dataset.copy || block.querySelector('code').textContent.trim());
      btn.textContent = 'Copied'; btn.classList.add('done');
    } catch { btn.textContent = 'Select & copy'; }
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
  });
  block.append(btn);
});
