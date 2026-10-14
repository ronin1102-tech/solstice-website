import './style.css';
import { initEclipse } from './three-eclipse';

/* ---------- Hero parallax (GPU transform, rAF-throttled) ---------- */
function initParallax(): void {
  const layer = document.getElementById('hero-parallax');
  if (!layer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  const SPEED = 0.3;

  const update = (): void => {
    const y = window.scrollY;
    // Skip work once the hero is fully off-screen
    if (y <= window.innerHeight * 1.2) {
      layer.style.transform = `translate3d(0, ${y * SPEED}px, 0)`;
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------- 3D card tilt ---------- */
function initCardTilt(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  const MAX_TILT = 10; // degrees
  const cards = document.querySelectorAll<HTMLElement>('.tilt');

  cards.forEach((card) => {
    let frame = 0;

    card.addEventListener('mousemove', (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width; // 0..1
        const py = (e.clientY - rect.top) / rect.height; // 0..1
        const rotateY = (px - 0.5) * 2 * MAX_TILT;
        const rotateX = (0.5 - py) * 2 * MAX_TILT;
        card.style.transform =
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(frame);
      card.style.transform = '';
    });
  });
}

/* ---------- Boot ---------- */
initParallax();
initCardTilt();

const canvas = document.getElementById('eclipse-canvas');
if (canvas instanceof HTMLCanvasElement) {
  initEclipse(canvas);
}
