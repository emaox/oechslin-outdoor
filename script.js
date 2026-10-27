/* ==========================================================
   OECHSLIN OUTDOOR — vanilla JS, no dependencies.
   Homepage: card Experiences (carosello a scroll-snap orizzontale,
   drag-to-scroll per mouse), globo interattivo (drag/zoom/tap con
   tooltip dati rapidi — fallback onesto se una spedizione non ha
   ancora `stats`), field notes.

   EXPEDITIONS arriva da expeditions-data.js (caricato prima di
   questo file), condiviso con expeditions/index.html.
========================================================== */

const FIELD_NOTES = [
  { tag: 'Origine', title: "Lago d'Orta", desc: "Il territorio dove tutto è iniziato, osservato prima ancora di partire.", href: 'field-notes/lago-dorta/index.html' },
  { tag: 'Rivelazione', title: 'Cammino di Santiago', desc: "800 km a piedi che hanno cambiato il modo di pensare un viaggio." },
  { tag: 'Dietro le quinte', title: 'Come nasce un itinerario', desc: "Ricerca, sopralluoghi, scelte: il lavoro che nessuno vede." }
];

/* ----------------------------------------------------------
   MOBILE NAV
---------------------------------------------------------- */
function initMobileNav(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ----------------------------------------------------------
   HERO — a "field pass" boarding card. A terminal readout
   scans through three waypoints (glitch-decoded ASCII), then
   locks onto the OX emblem, which draws in and stays as part
   of the card. The card itself remains visible after.
---------------------------------------------------------- */
/* ----------------------------------------------------------
   EXPERIENCES — commercial cards. La home mostra solo le
   spedizioni `featured` (max 3, curate a mano), non l'intero
   catalogo: l'archivio completo e numerato vive in
   expeditions/index.html, linkato dalla card finale del
   carosello (vedi CTA appesa in coda sotto).
---------------------------------------------------------- */
function renderExperiences(){
  const grid = document.getElementById('expGrid');
  EXPEDITIONS.filter(e => !e.isOrigin && e.featured).slice(0, 3).forEach(exp => {
    const card = document.createElement('div');
    card.id = 'card-' + exp.code;

    if(exp.photo){
      card.className = 'exp-card exp-card--dossier';
      const s = exp.stats;
      const difficultyDots = '●'.repeat(s.difficulty) + '○'.repeat(5 - s.difficulty);
      card.style.backgroundImage = `url('${exp.photo}')`;
      card.innerHTML = `
        <div class="exp-dossier-top">
          <span class="exp-code">${exp.code}</span>
          <span class="exp-dossier-tag">Dossier verificato</span>
        </div>
        <div class="exp-dossier-bottom">
          <h3>${exp.title}</h3>
          <span class="exp-sub">${exp.subtitle}</span>
          <p class="exp-desc">${exp.description}</p>
          <div class="exp-dossier-stats">${s.km} KM · ${s.elevation.toLocaleString('it-IT')} M D+ · ${s.stages} TAPPE · ${difficultyDots}</div>
          <a href="${exp.href}" class="exp-link">Apri dossier →</a>
        </div>
      `;
    } else {
      // niente foto ancora, ma il dossier può comunque esistere (es. OX-002):
      // se c'è un href reale ci si va dritti, altrimenti si finisce sulla
      // riga corrispondente nell'archivio completo.
      const target = exp.href || `expeditions/index.html#${exp.code}`;
      card.className = 'exp-card';
      card.innerHTML = `
        <span class="exp-code">${exp.code}</span>
        <h3>${exp.title}</h3>
        <span class="exp-sub">${exp.subtitle}</span>
        <p class="exp-desc">${exp.description}</p>
        <a href="${target}" class="exp-link">Discover →</a>
      `;
    }
    grid.appendChild(card);
  });

  const cta = document.createElement('a');
  cta.className = 'exp-card exp-card--cta';
  cta.href = 'expeditions/index.html';
  cta.innerHTML = `
    <span class="exp-cta-mark">OX</span>
    <h3>Scopri tutte le spedizioni OX</h3>
    <p class="exp-desc">L'archivio completo, numerato: OX-001, OX-002 e le prossime in arrivo.</p>
    <span class="exp-link">Apri l'archivio →</span>
  `;
  grid.appendChild(cta);
}

/* ----------------------------------------------------------
   EXPERIENCES CAROUSEL — horizontal scroll-snap. Works unchanged
   whether the catalog has 2 cards (nothing to scroll, edge fade
   stays hidden) or 12+ (scrolls, fade shows). Touch/trackpad
   scroll natively; mouse gets drag-to-scroll using the same
   pointer-event pattern as initGlobeInteraction below (capture
   pointer, track movement, small threshold to tell a drag from
   a click so links inside cards still work).
---------------------------------------------------------- */
function initExpCarousel(){
  const carousel = document.getElementById('expCarousel');
  const grid = document.getElementById('expGrid');
  if(!carousel || !grid) return;

  let isDragging = false, dragMoved = false, pointerId = null;
  let startX = 0, scrollStart = 0;

  grid.addEventListener('pointerdown', (e) => {
    if(e.pointerType === 'touch') return; // native touch scroll handles this on its own
    isDragging = true;
    dragMoved = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    scrollStart = grid.scrollLeft;
    // NB: niente setPointerCapture qui — se lo si fa su ogni pointerdown,
    // anche un semplice click su un link dentro la card smette di funzionare
    // (il pointerup viene ridiretto al grid invece che al link). Si cattura
    // solo più sotto, quando si conferma un trascinamento vero.
  });

  grid.addEventListener('pointermove', (e) => {
    if(!isDragging) return;
    const dx = e.clientX - startX;
    if(!dragMoved && Math.abs(dx) > 4){
      dragMoved = true;
      grid.setPointerCapture(pointerId);
      grid.classList.add('is-dragging');
    }
    if(dragMoved) grid.scrollLeft = scrollStart - dx;
  });

  function endDrag(){
    if(!isDragging) return;
    isDragging = false;
    grid.classList.remove('is-dragging');
    if(grid.hasPointerCapture?.(pointerId)) grid.releasePointerCapture(pointerId);
    if(dragMoved){
      // swallow the click that follows a drag, so it doesn't activate a link mid-swipe
      const suppressClick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        grid.removeEventListener('click', suppressClick, true);
      };
      grid.addEventListener('click', suppressClick, true);
    }
  }
  grid.addEventListener('pointerup', endDrag);
  grid.addEventListener('pointercancel', endDrag);

  function updateEdgeFade(){
    const hasMore = grid.scrollWidth - grid.clientWidth - grid.scrollLeft > 8;
    carousel.classList.toggle('has-more', hasMore);
  }
  grid.addEventListener('scroll', updateEdgeFade);
  window.addEventListener('resize', updateEdgeFade);
  updateEdgeFade();
}

/* ----------------------------------------------------------
   FIELD NOTES
---------------------------------------------------------- */
function renderFieldNotes(){
  const grid = document.getElementById('notesGrid');
  FIELD_NOTES.forEach(note => {
    // se esiste una pagina vera, la card diventa un link cliccabile
    // (stesso pattern di renderExperiences); altrimenti resta una
    // card semplice, in attesa del suo articolo.
    const card = document.createElement(note.href ? 'a' : 'div');
    card.className = 'note-card';
    if(note.href) card.href = note.href;
    card.innerHTML = `<span class="note-tag">${note.tag}</span><h3>${note.title}</h3><p>${note.desc}</p>${note.href ? '<span class="note-link">Leggi →</span>' : ''}`;
    grid.appendChild(card);
  });
}

/* ============================================================
   FULLY INTERACTIVE GLOBE
   - drag to rotate, free on both axes, with inertia
   - mouse wheel + two-finger pinch to zoom
   - tap/click a point to jump to its Experience card
   - real (simplified, public-domain) coastlines, line art only
   - one-time scenic entrance, then rests — no idle auto-spin
============================================================ */

const GLOBE = {
  canvas: null, ctx: null,
  size: 0, radius: 0,
  rotationY: 0, tilt: 0,
  targetRotationY: 0, targetTilt: 0.35,
  zoom: 1, minZoom: 0.6, maxZoom: 2.6,
  introStart: null, introDone: false, introDuration: 1800,
  sectionVisible: false,
  reduceMotion: false,
  isDragging: false, dragMoved: false,
  velocityY: 0, velocityX: 0,
  activePointers: new Map(),
  pinchStartDist: null, pinchStartZoom: 1,
  projected: {}, hoverCode: null
};

function toRadians(deg){ return deg * Math.PI / 180; }

function latLonToVector(lat, lon){
  const latR = toRadians(lat);
  const lonR = toRadians(-lon); // fixes east-west mirroring
  return {
    x: Math.cos(latR) * Math.cos(lonR),
    y: Math.sin(latR),
    z: Math.cos(latR) * Math.sin(lonR)
  };
}

function rotateVector(v, rotationY, tilt){
  const x1 = v.x * Math.cos(rotationY) + v.z * Math.sin(rotationY);
  const z1 = -v.x * Math.sin(rotationY) + v.z * Math.cos(rotationY);
  const y1 = v.y;
  const y2 = y1 * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = y1 * Math.sin(tilt) + z1 * Math.cos(tilt);
  return { x: x1, y: y2, z: z2 };
}

function clampTilt(t){ return Math.max(-1.35, Math.min(1.35, t)); }

function computeTargetRotation(){
  const origin = EXPEDITIONS.find(e => e.isOrigin);
  if(!origin) return;
  GLOBE.targetRotationY = toRadians(-origin.lon - 90);
}

function resizeGlobeCanvas(){
  const wrap = document.getElementById('globeWrap');
  const canvas = GLOBE.canvas;
  const dpr = window.devicePixelRatio || 1;
  const cssSize = wrap.clientWidth;
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  canvas.style.width = cssSize + 'px';
  canvas.style.height = cssSize + 'px';
  GLOBE.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  GLOBE.size = cssSize;
}

function projectPoint(rotated){
  const cx = GLOBE.size / 2, cy = GLOBE.size / 2;
  const r = GLOBE.size * 0.42 * GLOBE.zoom;
  return { sx: cx + rotated.x * r, sy: cy - rotated.y * r, z: rotated.z };
}

const MERIDIAN_STEP = 20, PARALLEL_STEP = 20, CURVE_SAMPLES = 48;

function drawMeshLine(points){
  const ctx = GLOBE.ctx;
  let prev = null;
  ctx.lineWidth = 0.8;
  for(let i = 0; i < points.length; i++){
    const r = rotateVector(points[i], GLOBE.rotationY, GLOBE.tilt);
    const p = projectPoint(r);
    const depth = (r.z + 1) / 2;
    if(prev && r.z > -0.98){
      ctx.beginPath();
      ctx.moveTo(prev.sx, prev.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.strokeStyle = `rgba(10,42,74,${0.05 + depth * 0.14})`;
      ctx.stroke();
    }
    prev = p;
  }
}

function drawGrid(){
  for(let lon = 0; lon < 360; lon += MERIDIAN_STEP){
    const pts = [];
    for(let i = 0; i <= CURVE_SAMPLES; i++){
      pts.push(latLonToVector(-90 + (180 / CURVE_SAMPLES) * i, lon));
    }
    drawMeshLine(pts);
  }
  for(let lat = -60; lat <= 60; lat += PARALLEL_STEP){
    const pts = [];
    for(let i = 0; i <= CURVE_SAMPLES; i++){
      pts.push(latLonToVector(lat, (360 / CURVE_SAMPLES) * i));
    }
    drawMeshLine(pts);
  }
}

function drawCoastlines(){
  const ctx = GLOBE.ctx;
  LAND_POLYGONS.forEach(poly => {
    const projected = [];
    let sumZ = 0;
    for(let i = 0; i < poly.length; i++){
      const v = latLonToVector(poly[i][1], poly[i][0]);
      const r = rotateVector(v, GLOBE.rotationY, GLOBE.tilt);
      sumZ += r.z;
      projected.push(projectPoint(r));
    }
    const avgZ = sumZ / poly.length;
    if(avgZ < -0.15) return;
    const depth = (avgZ + 1) / 2;
    ctx.beginPath();
    ctx.moveTo(projected[0].sx, projected[0].sy);
    for(let i = 1; i < projected.length; i++) ctx.lineTo(projected[i].sx, projected[i].sy);
    ctx.closePath();
    ctx.strokeStyle = `rgba(10,42,74,${0.28 + depth * 0.45})`;
    ctx.lineWidth = 1.05;
    ctx.stroke();
  });
}

function drawArc(vecA, vecB){
  const ctx = GLOBE.ctx;
  const steps = 40;
  let prevPoint = null;
  ctx.lineWidth = 1.4;
  for(let i = 0; i <= steps; i++){
    const t = i / steps;
    const lerped = {
      x: vecA.x + (vecB.x - vecA.x) * t,
      y: vecA.y + (vecB.y - vecA.y) * t,
      z: vecA.z + (vecB.z - vecA.z) * t
    };
    const len = Math.sqrt(lerped.x**2 + lerped.y**2 + lerped.z**2) || 1;
    const elevation = 1 + Math.sin(t * Math.PI) * 0.16;
    const normalized = { x:(lerped.x/len)*elevation, y:(lerped.y/len)*elevation, z:(lerped.z/len)*elevation };
    const r = rotateVector(normalized, GLOBE.rotationY, GLOBE.tilt);
    const p = projectPoint(r);
    const depth = (r.z + 1) / 2;
    if(prevPoint){
      ctx.beginPath();
      ctx.moveTo(prevPoint.sx, prevPoint.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.strokeStyle = `rgba(62,130,196,${0.15 + depth * 0.6})`;
      ctx.stroke();
    }
    prevPoint = p;
  }
}

function drawGlobeFrame(){
  const ctx = GLOBE.ctx;
  const cx = GLOBE.size / 2, cy = GLOBE.size / 2;
  const radius = GLOBE.size * 0.42 * GLOBE.zoom;
  const deepBlue = '#0A2A4A', yellow = '#E8B94D';

  ctx.clearRect(0, 0, GLOBE.size, GLOBE.size);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(10,42,74,0.2)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  drawGrid();
  drawCoastlines();

  const origin = EXPEDITIONS.find(e => e.isOrigin);
  if(origin){
    const originVec = latLonToVector(origin.lat, origin.lon);
    EXPEDITIONS.forEach(exp => {
      if(exp.isOrigin) return;
      drawArc(originVec, latLonToVector(exp.lat, exp.lon));
    });
  }

  EXPEDITIONS.forEach(exp => {
    const v = latLonToVector(exp.lat, exp.lon);
    const r = rotateVector(v, GLOBE.rotationY, GLOBE.tilt);
    const p = projectPoint(r);
    const front = r.z > -0.05;
    const color = exp.isOrigin ? yellow : deepBlue;

    GLOBE.projected[exp.code] = { sx: p.sx, sy: p.sy, front };

    ctx.beginPath();
    ctx.arc(p.sx, p.sy, exp.isOrigin ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = front ? color : 'rgba(10,42,74,0.15)';
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = '#F7F6F2';
    if(front) ctx.stroke();

    if(front && GLOBE.hoverCode === exp.code){
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 9, 0, Math.PI * 2);
      ctx.strokeStyle = exp.isOrigin ? 'rgba(232,185,77,0.7)' : 'rgba(62,130,196,0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  updateHoverLabel();
}

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function animateGlobe(now){
  if(!GLOBE.reduceMotion){
    if(GLOBE.isDragging){
      // rotation set directly in pointermove
    } else if(!GLOBE.introDone && GLOBE.sectionVisible){
      if(GLOBE.introStart === null) GLOBE.introStart = now;
      const t = Math.min(1, (now - GLOBE.introStart) / GLOBE.introDuration);
      const eased = easeOutCubic(t);
      const startRotY = GLOBE.targetRotationY - toRadians(55);
      const startTilt = GLOBE.targetTilt - 0.45;
      GLOBE.rotationY = startRotY + (GLOBE.targetRotationY - startRotY) * eased;
      GLOBE.tilt = startTilt + (GLOBE.targetTilt - startTilt) * eased;
      if(t >= 1) GLOBE.introDone = true;
    } else if(Math.abs(GLOBE.velocityY) > 0.0002 || Math.abs(GLOBE.velocityX) > 0.0002){
      GLOBE.rotationY += GLOBE.velocityY;
      GLOBE.tilt = clampTilt(GLOBE.tilt + GLOBE.velocityX);
      GLOBE.velocityY *= 0.94;
      GLOBE.velocityX *= 0.94;
    }
  }
  drawGlobeFrame();
  requestAnimationFrame(animateGlobe);
}

function initGlobeEntrance(){
  const section = document.getElementById('map');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        GLOBE.sectionVisible = true;
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(section);
}

/* ---- drag (rotate) + pinch (zoom), unified with Pointer Events ---- */
function initGlobeInteraction(){
  const wrap = document.getElementById('globeWrap');
  let startX = 0, startY = 0, lastX = 0, lastY = 0;
  let startRotY = 0, startTilt = 0, lastTime = 0;

  function dist(a, b){ return Math.hypot(a.x - b.x, a.y - b.y); }

  wrap.addEventListener('pointerdown', (e) => {
    wrap.setPointerCapture(e.pointerId);
    GLOBE.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if(GLOBE.activePointers.size === 1){
      GLOBE.isDragging = true;
      GLOBE.dragMoved = false;
      GLOBE.velocityY = 0; GLOBE.velocityX = 0;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      startRotY = GLOBE.rotationY;
      startTilt = GLOBE.tilt;
      lastTime = performance.now();
      wrap.classList.add('is-dragging');
    } else if(GLOBE.activePointers.size === 2){
      // a second finger landed: switch from rotate to pinch-zoom
      GLOBE.isDragging = false;
      GLOBE.dragMoved = true; // prevents a stray tap after pinching
      const pts = Array.from(GLOBE.activePointers.values());
      GLOBE.pinchStartDist = dist(pts[0], pts[1]);
      GLOBE.pinchStartZoom = GLOBE.zoom;
    }
  });

  wrap.addEventListener('pointermove', (e) => {
    if(GLOBE.activePointers.has(e.pointerId)){
      GLOBE.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if(GLOBE.activePointers.size === 2 && GLOBE.pinchStartDist){
      const pts = Array.from(GLOBE.activePointers.values());
      const d = dist(pts[0], pts[1]);
      const scale = d / GLOBE.pinchStartDist;
      GLOBE.zoom = Math.max(GLOBE.minZoom, Math.min(GLOBE.maxZoom, GLOBE.pinchStartZoom * scale));
      return;
    }

    if(!GLOBE.isDragging){
      handleHoverProbe(e);
      return;
    }
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(Math.abs(dx) + Math.abs(dy) > 4) GLOBE.dragMoved = true;

    const sensitivity = 0.008;
    GLOBE.rotationY = startRotY + dx * sensitivity;
    GLOBE.tilt = clampTilt(startTilt - dy * sensitivity);

    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    GLOBE.velocityY = ((e.clientX - lastX) * sensitivity) / (dt / 16.6);
    GLOBE.velocityX = (-(e.clientY - lastY) * sensitivity) / (dt / 16.6);
    lastX = e.clientX; lastY = e.clientY;
    lastTime = now;

    if(GLOBE.dragMoved) setHoverCode(null);
  });

  function endDrag(e){
    if(GLOBE.activePointers.has(e.pointerId)) GLOBE.activePointers.delete(e.pointerId);

    if(GLOBE.activePointers.size < 2) GLOBE.pinchStartDist = null;

    if(GLOBE.activePointers.size === 0){
      if(GLOBE.isDragging){
        GLOBE.isDragging = false;
        wrap.classList.remove('is-dragging');
        if(!GLOBE.dragMoved){
          handleHoverProbe(e, true);
        } else {
          GLOBE.velocityY = Math.max(-0.06, Math.min(0.06, GLOBE.velocityY));
          GLOBE.velocityX = Math.max(-0.06, Math.min(0.06, GLOBE.velocityX));
        }
      }
    }
  }
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);

  // mouse wheel zoom (desktop)
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    GLOBE.zoom = Math.max(GLOBE.minZoom, Math.min(GLOBE.maxZoom, GLOBE.zoom - e.deltaY * 0.0012));
  }, { passive: false });
}

function handleHoverProbe(e, isTap){
  const rect = GLOBE.canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let nearest = null, nearestDist = 16;
  Object.keys(GLOBE.projected).forEach(code => {
    const p = GLOBE.projected[code];
    if(!p.front) return;
    const d = Math.hypot(p.sx - mx, p.sy - my);
    if(d < nearestDist){ nearestDist = d; nearest = code; }
  });

  if(isTap){
    const exp = nearest ? EXPEDITIONS.find(x => x.code === nearest) : null;
    // il tooltip su questo punto è già visibile (da un tap precedente sullo
    // stesso punto, oppure — per il mouse — perché l'hover lo aveva già
    // mostrato prima del click): un secondo "conferma" e apre il dossier.
    // Sul primo tap si mostra solo il tooltip, non si naviga via subito.
    const alreadyShown = GLOBE.hoverCode === nearest;
    if(alreadyShown && exp && !exp.isOrigin && exp.href){
      window.location.href = exp.href;
      return;
    }
    setHoverCode(alreadyShown ? null : nearest);
  } else {
    setHoverCode(nearest);
  }
}

function setHoverCode(code){ GLOBE.hoverCode = code; }

function updateHoverLabel(){
  const label = document.getElementById('globeLabel');
  if(!GLOBE.hoverCode){ label.classList.remove('visible'); return; }
  const exp = EXPEDITIONS.find(e => e.code === GLOBE.hoverCode);
  const p = GLOBE.projected[GLOBE.hoverCode];
  if(!exp || !p || !p.front){ label.classList.remove('visible'); return; }

  label.querySelector('.gl-title').textContent = exp.title;

  const meta = label.querySelector('.gl-meta');
  if(exp.isOrigin){
    meta.textContent = '';
    meta.classList.add('gl-meta--pending');
    meta.hidden = true;
  } else if(exp.stats){
    const s = exp.stats;
    meta.textContent = `${s.km} KM · ${s.elevation.toLocaleString('it-IT')} M D+ · ★${s.difficulty}/5`;
    meta.classList.remove('gl-meta--pending');
    meta.hidden = false;
  } else {
    // dati non ancora pronti per questa spedizione: onesto invece di inventare numeri
    meta.textContent = 'In fase di progettazione';
    meta.classList.add('gl-meta--pending');
    meta.hidden = false;
  }

  label.style.left = p.sx + 'px';
  label.style.top = (p.sy - 16) + 'px';
  label.classList.add('visible');
}

function initGlobe(){
  GLOBE.canvas = document.getElementById('globeCanvas');
  GLOBE.ctx = GLOBE.canvas.getContext('2d');
  GLOBE.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  computeTargetRotation();
  GLOBE.rotationY = GLOBE.targetRotationY - toRadians(55);
  GLOBE.tilt = GLOBE.targetTilt - 0.45;

  resizeGlobeCanvas();
  initGlobeInteraction();
  initGlobeEntrance();
  window.addEventListener('resize', resizeGlobeCanvas);

  if(GLOBE.reduceMotion){
    GLOBE.rotationY = GLOBE.targetRotationY;
    GLOBE.tilt = GLOBE.targetTilt;
    GLOBE.introDone = true;
    drawGlobeFrame();
  } else {
    requestAnimationFrame(animateGlobe);
  }
}

/* ----------------------------------------------------------
   FOUNDER VIDEO — riparte da capo a ogni hover/tap, si ferma
   sull'ultimo frame a fine video invece di andare in loop o
   tornare nera (stesso pattern usato per il team nel sito Atlas).
---------------------------------------------------------- */
function initFounderVideo(){
  const video = document.getElementById('founderVideo');
  if(!video) return;

  function play(){
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  video.addEventListener('mouseenter', play);
  video.addEventListener('click', play); // così funziona anche su touch, dove "hover" non esiste
  video.addEventListener('ended', () => {
    video.currentTime = Math.max(0, video.duration - 0.04);
    video.pause();
  });
}

/* ----------------------------------------------------------
   SCROLL REVEAL
---------------------------------------------------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  targets.forEach(t => observer.observe(t));
}

/* ----------------------------------------------------------
   INIT
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  renderExperiences();
  initExpCarousel();
  renderFieldNotes();
  initGlobe();
  initFounderVideo();
  initScrollReveal();
});
/* Boot intro handled by boot-intro.js (loaded before this file). */
