/* ==========================================================
   BOOT INTRO — Expedition Ticket
   Carica PRIMA di script.js: <script src="boot-intro.js"></script>
   Mostrata una sola volta a sessione (sessionStorage).

   Sequenza: il ticket orizzontale cicla tra alcune rotte reali
   (con un piccolo glitch a ogni cambio), poi si assesta su
   OECHSLIN OUTDOOR / OX e sparisce, rivelando il sito.
========================================================== */
(function(){
  const RULER_COUNT = 13;

  // small, self-contained dataset — non dipende da script.js,
  // che carica DOPO questo file.
  const ROUTES = [
    { code: 'OX-000', title: "LAGO D'ORTA", from: "LAGO D'ORTA", to: 'ORIGIN', coord: "45.8206°N  8.4028°E" },
    { code: 'OX-001', title: 'ATLAS CROSSING', from: "LAGO D'ORTA", to: 'MARRAKECH', coord: '31.6300°N  7.9900°W' },
    { code: 'OX-002', title: 'ADRIATIC ROUTE', from: "LAGO D'ORTA", to: 'ITALIA', coord: '43.6000°N  13.500°E' },
    { code: 'OX-003', title: 'MONTE BIANCO TRAVERSE', from: "LAGO D'ORTA", to: 'ALPI', coord: '45.8300°N  6.8600°E' }
  ];
  const CYCLE_ORDER = [0, 1, 2, 3, 1]; // just over one full pass, ends mid-cycle for a natural cut
  const STEP_HOLD_MS = 620;
  const GLITCH_MS = 220;

  const el = {
    overlay: document.getElementById('bootOverlay'),
    rulerTop: document.getElementById('bootRulerTop'),
    rulerBottom: document.getElementById('bootRulerBottom'),
    hudTL: document.querySelector('.boot-hud--tl'),
    hudTR: document.querySelector('.boot-hud--tr'),
    hudBL: document.querySelector('.boot-hud--bl'),
    hudBR: document.querySelector('.boot-hud--br'),
    coord: document.getElementById('bootCoord'),
    time: document.getElementById('bootTime'),
    status: document.getElementById('bootStatus'),
    ticket: document.getElementById('bootTicket'),
    ticketCode: document.getElementById('ticketCode'),
    ticketTitle: document.getElementById('ticketTitle'),
    ticketFrom: document.getElementById('ticketFrom'),
    ticketTo: document.getElementById('ticketTo'),
    ticketCoord: document.getElementById('ticketCoord'),
    ticketStubOx: document.getElementById('ticketStubOx'),
    ticketStubFinal: document.getElementById('ticketStubFinal'),
    heroOxTag: document.getElementById('heroOxTag'),
    heroEyebrow: document.getElementById('heroEyebrow'),
    heroName: document.getElementById('heroName'),
    heroTagline: document.getElementById('heroTagline'),
    skip: document.getElementById('bootSkip')
  };

  if(!el.overlay) return;

  [el.rulerTop, el.rulerBottom].forEach(ruler => {
    for(let i = 0; i < RULER_COUNT; i++){
      const tick = document.createElement('span');
      tick.style.height = (i % 4 === 0 ? 10 : 5) + 'px';
      ruler.appendChild(tick);
    }
  });

  let alive = true;
  let skipped = false;
  let coordTickId = null;
  let clockTimerId = null;
  let startTime = 0;
  let timers = [];

  function wait(ms){
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      timers.push(id);
    });
  }

  function clearAllTimers(){
    timers.forEach(clearTimeout);
    timers = [];
    if(coordTickId) clearInterval(coordTickId);
    if(clockTimerId) clearInterval(clockTimerId);
  }

  function lightUpHero(){
    // effetto neon: la scritta si accende dopo il boot (vedi .neon-text
    // / @keyframes neonFlickerIn in style.css)
    if(el.heroEyebrow) el.heroEyebrow.classList.add('neon-on');
    if(el.heroName) el.heroName.classList.add('neon-on');
    if(el.heroTagline) el.heroTagline.classList.add('neon-on');
  }

  function setHudVisible(visible){
    [el.hudTL, el.hudTR, el.hudBL, el.hudBR].forEach(h => h.classList.toggle('is-visible', visible));
    el.rulerTop.classList.toggle('is-visible', visible);
    el.rulerBottom.classList.toggle('is-visible', visible);
  }

  function applyRoute(route){
    el.ticketCode.textContent = route.code;
    el.ticketTitle.textContent = route.title;
    el.ticketFrom.textContent = route.from;
    el.ticketTo.textContent = route.to;
    el.ticketCoord.textContent = route.coord;
  }

  async function glitchTo(route){
    if(!alive || skipped) return;
    const fields = [el.ticketCode, el.ticketTitle, el.ticketFrom, el.ticketTo, el.ticketCoord];
    fields.forEach(f => f.classList.add('is-glitching'));
    await wait(GLITCH_MS * 0.55);
    if(!alive || skipped) return;
    applyRoute(route);
    await wait(GLITCH_MS * 0.45);
    fields.forEach(f => f.classList.remove('is-glitching'));
  }

  async function runSequence(){
    await wait(150);
    if(!alive || skipped) return;
    setHudVisible(true);
    el.status.textContent = 'BOARDING';

    applyRoute(ROUTES[0]);
    el.ticket.classList.add('is-visible');
    await wait(300);

    coordTickId = setInterval(() => {
      if(!alive) return;
      const jitter = (Math.random() * 0.002).toFixed(4);
      el.coord.innerHTML = `45.82${jitter.slice(2)}°N&nbsp;&nbsp;8.4028°E`;
    }, 260);

    for(let i = 1; i < CYCLE_ORDER.length; i++){
      if(!alive || skipped) return;
      await wait(STEP_HOLD_MS);
      if(!alive || skipped) return;
      el.status.textContent = i % 2 === 0 ? 'ROUTING' : 'SYNCING';
      await glitchTo(ROUTES[CYCLE_ORDER[i]]);
    }

    if(!alive || skipped) return;
    await wait(STEP_HOLD_MS);
    if(!alive || skipped) return;

    el.status.textContent = 'CONFIRMED';
    await settleOnBrand();
  }

  async function settleOnBrand(){
    if(!alive || skipped) return;
    const fields = [el.ticketCode, el.ticketTitle, el.ticketFrom, el.ticketTo, el.ticketCoord];
    fields.forEach(f => f.classList.add('is-glitching'));
    await wait(GLITCH_MS * 0.6);
    if(!alive || skipped) return;

    el.ticket.classList.add('is-settled');
    el.ticketStubFinal.classList.add('is-visible');
    fields.forEach(f => f.classList.remove('is-glitching'));
    await wait(700);
    if(!alive) return;
    clearInterval(coordTickId);
    await finish();
  }

  async function finish(){
    if(!alive) return;
    clearInterval(coordTickId);
    setHudVisible(false);
    el.skip.classList.add('is-hidden');
    el.ticket.classList.remove('is-visible');
    await wait(400);
    if(!alive) return;
    el.overlay.classList.add('is-hidden');
    if(el.heroOxTag) el.heroOxTag.classList.add('is-visible');
    lightUpHero();
    sessionStorage.setItem('oechslinIntroShown', '1');
    await wait(500);
    if(!alive) return;
    el.overlay.classList.add('is-removed');
  }

  function skip(){
    skipped = true;
    clearAllTimers();
    finish();
  }

  el.skip.addEventListener('click', skip);

  document.querySelectorAll('.replay-intro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sessionStorage.removeItem('oechslinIntroShown');
      location.reload();
    });
  });

  if(sessionStorage.getItem('oechslinIntroShown') === '1'){
    el.overlay.classList.add('is-hidden', 'is-removed');
    if(el.heroOxTag) el.heroOxTag.classList.add('is-visible');
    lightUpHero();
    return;
  }

  startTime = performance.now();
  clockTimerId = setInterval(() => {
    if(!alive) return;
    const elapsed = (performance.now() - startTime) / 1000;
    el.time.textContent = elapsed.toFixed(1).padStart(5, '0');
  }, 100);

  runSequence();

  window.addEventListener('beforeunload', () => { alive = false; clearAllTimers(); });
})();