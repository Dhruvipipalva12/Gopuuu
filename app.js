/* ============================================================
   FRIENDSHIP WEBSITE — app.js
   SPA Router · Clean Lightbox · Confetti · Hearts
   Music · Particles · Animations
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   CUSTOMIZE HERE
───────────────────────────────────────── */

// REPLACE: Confetti colours
const CONFETTI = [
  '#9b59f5','#c084fc','#f472b6',
  '#22d3ee','#a3e635','#fb923c',
  '#ffffff','#ffd54f'
];

// REPLACE: Floating particles
const PARTICLES = ['💜','🌸','✨','⭐','💕','🦋','🌙','💫','🎀','✦'];

// REPLACE: Heart emojis for surprise burst
const HEARTS = ['💜','💕','💖','💗','🌸','✨','🥰','💝','🐼','🎀','⭐'];

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  fadeInBody();
  showNav();
  spawnParticles();
  initMusic();
  initLightbox();       // ← lightbox setup
  initQuoteReveal();
  initSurprise();
});

/* ============================================================
   1. BODY FADE IN
   ============================================================ */
function fadeInBody() {
  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.9s ease';
  const go = () => requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  document.readyState === 'complete' ? go() : window.addEventListener('load', go);
}

/* ============================================================
   2. SPA ROUTER
   ============================================================ */
let current = 'home';

// Exposed globally so onclick="" in HTML can call it
window.goTo = function(pageId) {
  if (pageId === current) return;

  // Hide old page
  const oldEl = document.getElementById('page-' + current);
  if (oldEl) oldEl.classList.remove('active');

  // Show new page
  const newEl = document.getElementById('page-' + pageId);
  if (!newEl) return;
  newEl.classList.add('active');
  newEl.scrollTop = 0;
  current = pageId;

  // Update nav highlight
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  // Page-specific triggers
  if (pageId === 'quotes')   showQuoteCards();
  if (pageId === 'surprise') resetSurprise();
};

/* ============================================================
   3. BOTTOM NAV — slide up on load
   ============================================================ */
function showNav() {
  setTimeout(() => {
    document.getElementById('bottomNav')?.classList.add('visible');
    // Mark home as active initially
    document.querySelector('.nav-btn[data-page="home"]')?.classList.add('active');
  }, 380);
}

/* ============================================================
   4. FLOATING PARTICLES
   ============================================================ */
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  function spawn() {
    const el   = document.createElement('div');
    el.classList.add('particle');
    el.textContent = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
    const dur  = Math.random() * 20 + 15;
    const dlay = Math.random() * 5;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 13 + 10}px;
      animation-duration: ${dur}s;
      animation-delay: ${dlay}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + dlay) * 1000 + 500);
  }

  for (let i = 0; i < 18; i++) spawn();
  setInterval(spawn, 2200);
}

/* ============================================================
   5. MUSIC
   ============================================================ */
function initMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgAudio');
  const icon  = document.getElementById('musicIcon');
  if (!btn || !audio) return;

  let playing = false;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      icon.textContent = '🎵';
      btn.classList.remove('playing');
    } else {
      audio.play().catch(() => console.info('Add song to /assets/music/song.mp3'));
      icon.textContent = '🎶';
      btn.classList.add('playing');
    }
    playing = !playing;
  });

  // Gentle volume fade-in
  audio.volume = 0;
  audio.addEventListener('play', () => {
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(v + 0.025, 0.44);
      audio.volume = v;
      if (v >= 0.44) clearInterval(t);
    }, 130);
  });
}

/* ============================================================
   6. LIGHTBOX
   ─────────────────────────────────────────────────────────────
   The lightbox element is a direct child of <body>.
   It uses:
     position: fixed  → covers viewport completely
     display: flex    → centers the image
     justify-content: center + align-items: center

   The <img id="lbImg"> has:
     max-width: 90vw
     max-height: 90vh
     object-fit: contain   → never stretches or crops
     NO filter, NO blur

   The dark background is ONLY on #lbOverlay (position:absolute
   behind the image), NOT on #lightbox itself — so no parent
   can accidentally blur the image.
   ============================================================ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbCap    = document.getElementById('lbCap');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');
  const lbOverlay= document.getElementById('lbOverlay');
  if (!lightbox) return;

  // Grab ALL gallery images
  const imgs  = Array.from(document.querySelectorAll('.g-img'));
  let current = 0;

  // ── Open at index ──────────────────────────────────────────
  function openAt(i) {
    current = ((i % imgs.length) + imgs.length) % imgs.length;
    const el  = imgs[current];

    // Set image source and caption
    lbImg.src         = el.src;
    lbCap.textContent = el.dataset.cap || '';

    // Show lightbox
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  // ── Close ──────────────────────────────────────────────────
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after fade so old image doesn't flash on next open
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  // ── Attach click to each gallery image ────────────────────
  imgs.forEach((img, i) => {
    img.addEventListener('click', () => openAt(i));
  });

  // ── Controls ───────────────────────────────────────────────
  lbClose.addEventListener('click',  close);
  lbOverlay.addEventListener('click', close);

  lbPrev.addEventListener('click', e => {
    e.stopPropagation();
    openAt(current - 1);
  });

  lbNext.addEventListener('click', e => {
    e.stopPropagation();
    openAt(current + 1);
  });

  // ── Keyboard ───────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  openAt(current - 1);
    if (e.key === 'ArrowRight') openAt(current + 1);
  });

  // ── Touch swipe ────────────────────────────────────────────
  let touchX = 0;
  lightbox.addEventListener('touchstart',
    e => { touchX = e.changedTouches[0].clientX; },
    { passive: true }
  );
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 44) dx < 0 ? openAt(current + 1) : openAt(current - 1);
  }, { passive: true });

  // ── Handle missing images (show placeholder look) ─────────
  imgs.forEach(img => {
    img.addEventListener('error', function() {
      this.style.background = 'linear-gradient(135deg,rgba(155,89,245,0.14),rgba(244,114,182,0.09))';
      this.style.minHeight  = '120px';
    });
  });
}

/* ============================================================
   7. QUOTE CARDS — reveal on enter
   ============================================================ */
function initQuoteReveal() {
  // Observer for if user scrolls to quotes while already on page
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.q-card').forEach(c => obs.observe(c));
}

function showQuoteCards() {
  // Trigger immediately when navigating to quotes page
  setTimeout(() => {
    document.querySelectorAll('.q-card').forEach(c => c.classList.add('visible'));
  }, 150);
}

/* ============================================================
   8. SURPRISE
   ============================================================ */
function initSurprise() {
  const giftBox = document.getElementById('giftBox');
  const reveal  = document.getElementById('surpriseReveal');
  const replay  = document.getElementById('replayBtn');
  if (!giftBox) return;

  giftBox.addEventListener('click', () => {
    // Quick press feedback
    const emoji = document.getElementById('giftEmoji');
    if (emoji) { emoji.style.transform = 'scale(0.85)'; setTimeout(() => { emoji.style.transform = ''; }, 160); }

    setTimeout(() => {
      giftBox.style.display = 'none';
      reveal?.classList.add('show');
      launchConfetti();
      launchHearts();
    }, 200);
  });

  replay?.addEventListener('click', () => {
    launchConfetti();
    launchHearts();
  });
}

function resetSurprise() {
  const giftBox = document.getElementById('giftBox');
  const reveal  = document.getElementById('surpriseReveal');
  if (!giftBox || !reveal) return;
  giftBox.style.display = '';
  reveal.classList.remove('show');
}

/* ── Confetti ───────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width         = window.innerWidth;
  canvas.height        = window.innerHeight;
  canvas.style.display = 'block';

  const pieces = Array.from({ length: 200 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height - canvas.height,
    w:     Math.random() * 11 + 5,
    h:     Math.random() * 5  + 3,
    color: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.18,
    vx:    (Math.random() - 0.5) * 3.5,
    vy:    Math.random() * 3.8 + 1.5,
    alpha: 1,
    circle: Math.random() > 0.5
  }));

  const DUR = 5500;
  let startTs = null, raf;

  (function draw(ts) {
    if (!startTs) startTs = ts;
    const p = Math.min((ts - startTs) / DUR, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(c => {
      c.x += c.vx; c.y += c.vy; c.vy += 0.07; c.angle += c.spin;
      if (p > 0.6) c.alpha = Math.max(0, 1 - (p - 0.6) / 0.4);
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.translate(c.x, c.y); ctx.rotate(c.angle);
      ctx.fillStyle = c.color;
      if (c.circle) { ctx.beginPath(); ctx.arc(0,0,c.w/2,0,Math.PI*2); ctx.fill(); }
      else          { ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h); }
      ctx.restore();
    });
    if (p < 1) { raf = requestAnimationFrame(draw); }
    else { ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; cancelAnimationFrame(raf); }
  })(0);
}

/* ── Floating Hearts ────────────────────── */
function launchHearts() {
  const layer = document.getElementById('heartsLayer');
  if (!layer) return;
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.classList.add('fly-heart');
      h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      const size = (Math.random() * 1.4 + 0.8).toFixed(2);
      h.style.cssText = `
        left: ${Math.random() * 100}%;
        font-size: ${size}rem;
        animation-duration: ${(Math.random() * 2.4 + 2).toFixed(2)}s;
      `;
      layer.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
    }, i * 72);
  }
}

/* ============================================================
   9. RESIZE — keep confetti canvas full width
   ============================================================ */
window.addEventListener('resize', () => {
  const c = document.getElementById('confettiCanvas');
  if (c && c.style.display !== 'none') {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  }
});
