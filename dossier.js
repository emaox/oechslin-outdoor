/* ==========================================================
   DOSSIER — logica condivisa da tutte le pagine di dettaglio
   spedizione (nav, reveal, countdown, mappa+percorso, accordion,
   form, profilo altimetrico, glitch-swap IT⇄AR).

   Ogni pagina spedizione carica PRIMA un proprio data.js che
   definisce le globali: TAPPE, DEPARTURE_DATE, EARLY_BIRD_DATE,
   SCRIPT_URL. Questo file legge solo quelle, nessun dato
   specifico di spedizione qui dentro.

   La sezione "Informazioni pratiche" (voli, documenti, livello,
   pagamento, cancellazione) è statica nell'HTML di ogni pagina,
   non generata da qui — i valori ipotizzati sono marcati con
   commenti "DA CONFERMARE" da sostituire con dati reali.

   NON toccare initMap() senza motivo: il bug di inizializzazione
   (mappa "bianca" finché non si forzava un resize) era causato
   dalla sezione .reveal che animava il contenitore mentre Leaflet
   la misurava — vedi .reveal.in-view in style.css (transform:none,
   non translateY(0)) e la nota su window.addEventListener('load', ...)
   qui sotto prima di modificare la mappa.
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCountdown('countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds', DEPARTURE_DATE);
  initCountdown('ebDays', 'ebHours', 'ebMinutes', 'ebSeconds', EARLY_BIRD_DATE);
  initAccordion();
  initForm();
  renderElevationProfile();
  initGlitchSwap();
});

/* ---------------------------------------------------------- GLITCH SWAP
   Alterna il testo IT ⇄ AR ogni 5s su ogni elemento .glitch-swap
   (data-text-it / data-text-ar), con un piccolo effetto glitch a ogni
   cambio. Rispetta prefers-reduced-motion (il CSS disattiva le
   animazioni, qui evitiamo anche di far scorrere il testo troppo). */
function initGlitchSwap(){
  const els = document.querySelectorAll('.glitch-swap');
  if(!els.length) return;

  let showingArabic = false;
  setInterval(() => {
    showingArabic = !showingArabic;
    els.forEach(el => {
      const nextText = showingArabic ? el.getAttribute('data-text-ar') : el.getAttribute('data-text-it');
      el.classList.add('glitch-fade');
      setTimeout(() => {
        el.textContent = nextText;
        el.setAttribute('data-text', nextText);
        el.classList.toggle('is-arabic', showingArabic);
        el.classList.remove('glitch-fade');
        el.classList.add('glitching');
        setTimeout(() => el.classList.remove('glitching'), 400);
      }, 150);
    });
  }, 5000);
}

/* la mappa parte a 'load' (non DOMContentLoaded): a quel punto CSS, font
   e layout sono garantiti stabili, quindi Leaflet la misura bene alla
   prima renderizzazione senza bisogno di ricalcoli/trucchi successivi. */
window.addEventListener('load', initMap);

/* ---------------------------------------------------------- NAV + REVEAL */
function initNav(){
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

function initReveal(){
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  targets.forEach(t => observer.observe(t));
}

/* ---------------------------------------------------------- COUNTDOWN */
function initCountdown(daysId, hoursId, minutesId, secondsId, targetIso){
  const daysEl = document.getElementById(daysId);
  const hoursEl = document.getElementById(hoursId);
  const minutesEl = document.getElementById(minutesId);
  const secondsEl = document.getElementById(secondsId);
  if(!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const target = new Date(targetIso);

  function update(){
    const diff = target - new Date();
    if(diff <= 0){
      [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
      clearInterval(id);
      return;
    }
    daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
    minutesEl.textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
    secondsEl.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  }

  update();
  const id = setInterval(update, 1000);
}

/* ---------------------------------------------------------- ACCORDION */
function initAccordion(){
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion-trigger').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if(p) p.hidden = true;
      });
      if(!expanded){
        trigger.setAttribute('aria-expanded', 'true');
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if(panel) panel.hidden = false;
      }
    });
  });
}

/* ---------------------------------------------------------- MAP + ROUTE
   Tile satellitari (ArcGIS, no key) + routing stradale reale (OSRM,
   pubblico). Blindato: se Leaflet/CDN non risponde, il resto della
   pagina (day-card, testo) resta comunque fruibile.
   Legge TAPPE dal data.js della spedizione corrente.
---------------------------------------------------------- */
function initMap(){
  let map, tracciaAttiva, boundsTotale;
  let mapReady = false;
  const listaMarker = {};
  const ultimoStep = TAPPE.length + 1; // card "riepilogo" dopo l'ultima tappa

  try{
    map = L.map('boundedMap', { zoomControl: false, scrollWheelZoom: false, dragging: false });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

    boundsTotale = L.latLngBounds(TAPPE.map(t => t.coords));
    tracciaAttiva = L.polyline([], { color: '#E8B94D', weight: 4, opacity: 1, lineJoin: 'round' }).addTo(map);

    TAPPE.forEach(t => {
      const marker = L.circleMarker(t.coords, {
        radius: 4, fillColor: '#3E82C4', color: '#F7F6F2', weight: 1.5, fillOpacity: 0.95
      }).addTo(map).bindTooltip(`${String(t.step).padStart(2, '0')} · ${t.nome}`, {
        permanent: true, direction: 'top', offset: [0, -9], className: 'map-tooltip map-tooltip--upcoming'
      });
      marker.closeTooltip(); // niente nomi finché non è la tappa attiva
      listaMarker[t.step] = marker;
    });

    mapReady = true;
    map.invalidateSize();
    map.fitBounds(boundsTotale, { padding: [30, 30] });

    // ricalcola se il contenitore cambia dimensione più avanti (resize finestra, ecc.)
    if('ResizeObserver' in window){
      new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('boundedMap'));
    }
  } catch(err){
    console.warn('Mappa non inizializzata, proseguo senza:', err);
  }

  if(!mapReady) return;

  /* percorso stradale reale via OSRM (profilo "driving"), con fallback
     a linea retta. Ha senso SOLO per spedizioni su strada/pista (bici):
     OSRM instrada sulla rete stradale più vicina, e per un sentiero di
     montagna senza strade tra una tappa e l'altra questo produce un
     tracciato senza senso — o una scorciatoia stradale a caso molto più
     corta del vero sentiero, o un giro enorme su strade lontane (visto
     coi propri occhi: 20 km reali diventati 1 km, oppure 9 km diventati
     84). Ogni data.js di spedizione a piedi deve impostare
     `const USE_ROAD_ROUTING = false;` per saltare del tutto la chiamata
     e usare la linea retta reale tra le tappe (onesta, non un percorso
     stradale inventato). Se la costante non è definita, il default è
     true (comportamento invariato per le spedizioni in bici). */
  let gpsRoute = [];
  let routeStepIndex = {};
  let routeLoaded = false;

  async function caricaPercorsoStradale(){
    if(typeof USE_ROAD_ROUTING !== 'undefined' && !USE_ROAD_ROUTING) return;
    const waypoints = TAPPE.map(t => `${t.coords[1]},${t.coords[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
    try{
      const res = await fetch(url);
      const data = await res.json();
      if(data.code !== 'Ok' || !data.routes?.length) return;
      gpsRoute = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      TAPPE.forEach(t => { routeStepIndex[t.step] = indicePiuVicino(t.coords, gpsRoute); });
      routeLoaded = true;
    } catch(err){
      console.warn('OSRM non raggiungibile, uso linea retta tra le tappe:', err);
    }
  }

  function indicePiuVicino(coords, route){
    let bestIndex = 0, bestDist = Infinity;
    route.forEach((p, i) => {
      const dx = p[0] - coords[0], dy = p[1] - coords[1];
      const dist = dx * dx + dy * dy;
      if(dist < bestDist){ bestDist = dist; bestIndex = i; }
    });
    return bestIndex;
  }

  const hudTerreno = document.getElementById('hudTerreno');
  const hudCoords = document.getElementById('hudCoords');
  const hudStep = document.getElementById('hudStep');
  const totalKm = TAPPE.reduce((sum, t) => sum + t.km, 0);

  function aggiornaHud(step){
    if(step === 0){
      hudTerreno.textContent = 'PANORAMICA TRACCIATO';
      hudCoords.textContent = `${TAPPE[0].nome.toUpperCase()} → ${TAPPE[TAPPE.length - 1].nome.toUpperCase()}`;
      hudStep.textContent = 'OVERVIEW';
    } else if(step === ultimoStep){
      hudTerreno.textContent = 'TRACCIATO COMPLETO';
      hudCoords.textContent = `${totalKm} KM • ${TAPPE.length} TAPPE`;
      hudStep.textContent = 'FINAL';
    } else {
      const t = TAPPE[step - 1];
      hudTerreno.textContent = t.terreno;
      const lonHemisphere = t.coords[1] < 0 ? 'W' : 'E';
      hudCoords.textContent = `${t.coords[0].toFixed(4)}° N  ${Math.abs(t.coords[1]).toFixed(4)}° ${lonHemisphere}`;
      hudStep.textContent = `TAPPA ${String(step).padStart(2, '0')}/${String(TAPPE.length).padStart(2, '0')}`;
    }
  }

  let ultimoStepAttivo = null;
  let flyTimeout;

  function gestisciMappa(step){
    if(ultimoStepAttivo === step) return;
    ultimoStepAttivo = step;
    clearTimeout(flyTimeout);
    map.stop(); // ferma pulito l'animazione in corso invece di farla "inseguire" il nuovo target
    aggiornaHud(step);
    updateElevationIndicator(step); // sincronizza l'indicatore sul profilo altimetrico, stesso momento del marker attivo

    Object.entries(listaMarker).forEach(([key, marker]) => {
      const n = parseInt(key, 10);
      let fillColor = '#3E82C4', radius = 4; // upcoming
      if(n === step){ fillColor = '#E8B94D'; radius = 6; } // active
      else if(n < step){ fillColor = '#0A2A4A'; radius = 4; } // done
      marker.setStyle({ fillColor, radius });

      // il nome compare SOLO sulla tappa attiva; niente nomi in panoramica (step 0/finale)
      const isFocusStep = step > 0 && step < ultimoStep;
      if(isFocusStep && n === step){
        marker.openTooltip();
        const tooltipEl = marker.getTooltip().getElement();
        if(tooltipEl) tooltipEl.className = 'map-tooltip map-tooltip--active';
      } else {
        marker.closeTooltip();
      }
    });

    if(step === 0){
      tracciaAttiva.setLatLngs([]);
      map.flyToBounds(boundsTotale.pad(0.3), { padding: [30, 30], duration: 1.6 });
    } else if(step === ultimoStep){
      tracciaAttiva.setLatLngs(routeLoaded ? gpsRoute : TAPPE.map(t => t.coords));
      map.flyToBounds(boundsTotale.pad(0.3), { padding: [30, 30], duration: 1.6 });
    } else {
      const endIdx = routeStepIndex[step] !== undefined ? routeStepIndex[step] : (routeLoaded ? gpsRoute.length - 1 : step - 1);
      const path = routeLoaded ? gpsRoute.slice(0, endIdx + 1) : TAPPE.slice(0, step).map(t => t.coords);
      tracciaAttiva.setLatLngs(path);
      flyTimeout = setTimeout(() => {
        map.flyTo(TAPPE[step - 1].coords, 7.3, { animate: true, duration: 1.7 });
      }, 50);
    }
  }

  /* rootMargin riduce la "zona di rilevamento" a una striscia sottile
     al centro dello schermo: così è sempre attiva una sola card, quella
     più vicina al centro — indipendentemente dalla direzione di scroll.
     Con una soglia larga (50% visibile) più card corte (mobile) possono
     risultare "attive" insieme e vince quella capitata per ultima nel
     batch, non quella giusta: da qui i salti fuori ordine tornando su.
     Debounce: durante uno scroll veloce si attraversano più card in
     pochi millisecondi — aggiorna la mappa solo dove ci si ferma. */
  const cards = document.querySelectorAll('.day-card');
  let mapUpdateTimer;
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        cards.forEach(c => c.classList.remove('active'));
        entry.target.classList.add('active');
        const step = parseInt(entry.target.dataset.step, 10);
        clearTimeout(mapUpdateTimer);
        mapUpdateTimer = setTimeout(() => gestisciMappa(step), 140);
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  cards.forEach(c => cardObserver.observe(c));

  caricaPercorsoStradale();
}

/* ---------------------------------------------------------- FORM
   Invio reale via Google Apps Script (SCRIPT_URL dal data.js della
   spedizione): richiesta Image() GET, nessun blocco CORS.

   Due controlli anti-abuso PRIMA dell'invio (nessuna modifica alla
   logica di invio né ai campi esistenti):
   - honeypot: campo fuori schermo (vedi .hp-field in dossier.css) —
     se arriva compilato, l'invio si blocca in silenzio, nessun bot
     riceve conferma che il tentativo è stato notato.
   - rate-limit lato client: un invio per browser ogni ora, via
     localStorage. Non sostituisce una protezione server-side vera
     (aggirabile cancellando localStorage), ma scoraggia gli invii
     ripetuti accidentali o i bot più semplici.
---------------------------------------------------------- */
const RATE_LIMIT_KEY = 'oxLastSubmit';
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 ora

function initForm(){
  const form = document.getElementById('formCandidatura');
  const btn = document.getElementById('btnCandidatura');
  const feedback = document.getElementById('formFeedback');
  const honeypot = document.getElementById('fieldWebsite');
  const consenso = document.getElementById('fieldConsenso');
  if(!form || !btn || !feedback) return;

  function msRemaining(){
    const last = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
    return RATE_LIMIT_MS - (Date.now() - last);
  }

  function applyRateLimitUI(){
    if(msRemaining() > 0){
      btn.disabled = true;
      feedback.textContent = 'Hai già inviato una candidatura di recente, ti risponderemo presto.';
      feedback.className = 'form-feedback';
      return true;
    }
    return false;
  }

  // il bottone resta disabilitato finché non è spuntato il consenso privacy;
  // non tocca lo stato imposto dal rate-limit (se già bloccato, la checkbox
  // da sola non lo riabilita)
  function applyConsentUI(){
    if(msRemaining() > 0) return;
    btn.disabled = !consenso.checked;
  }

  if(applyRateLimitUI()) {
    // già bloccato dal rate-limit: la checkbox parte comunque non spuntata,
    // resta coerente quando (in un'altra sessione) il limite scade
  } else {
    applyConsentUI(); // stato iniziale: disabilitato finché non spunti
  }
  if(consenso) consenso.addEventListener('change', applyConsentUI);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // honeypot compilato → quasi certamente un bot: nessun errore visibile,
    // nessuna richiesta inviata, si finge tutto normale
    if(honeypot && honeypot.value.trim() !== '') return;

    if(applyRateLimitUI()) return;

    if(!consenso || !consenso.checked){
      feedback.textContent = 'Devi accettare l\'informativa sulla privacy prima di inviare.';
      feedback.className = 'form-feedback error';
      return;
    }

    const nome = document.getElementById('fieldNome').value.trim();
    const cognome = document.getElementById('fieldCognome').value.trim();
    const eta = document.getElementById('fieldEta').value.trim();
    const telefono = document.getElementById('fieldTelefono').value.trim();
    const email = document.getElementById('fieldEmail').value.trim();
    const esperienza = document.getElementById('fieldEsperienza').value;
    const motivazione = document.getElementById('fieldMotivazione').value.trim();

    if(!nome || !cognome || !eta || !telefono || !email || !esperienza || !motivazione){
      feedback.textContent = 'Compila tutti i campi prima di inviare.';
      feedback.className = 'form-feedback error';
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      feedback.textContent = 'Inserisci un indirizzo email valido.';
      feedback.className = 'form-feedback error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Invio in corso…';
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    // spedizione: presente in ogni data.js (vedi SPEDIZIONE_LABEL) — permette
    // di distinguere le candidature nel foglio Google anche se più spedizioni
    // condividono lo stesso SCRIPT_URL. Lo script Apps Script deve leggerlo
    // per smistarle davvero (non modificabile da qui, vive fuori dal repo).
    const params = new URLSearchParams({
      spedizione: typeof SPEDIZIONE_LABEL !== 'undefined' ? SPEDIZIONE_LABEL : '',
      nome, cognome, eta, telefono, email, esperienza, motivazione
    });
    const url = SCRIPT_URL + '?' + params.toString();

    const img = new Image();
    const timer = setTimeout(mostraSuccesso, 6000);
    img.onload = img.onerror = () => { clearTimeout(timer); mostraSuccesso(); };
    img.src = url;

    function mostraSuccesso(){
      localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      btn.textContent = 'Candidatura inviata ✓';
      feedback.textContent = `Grazie ${nome}! Ti scriverò via email con il programma completo.`;
      feedback.className = 'form-feedback success';
      form.reset();
    }
  });
}

/* ---------------------------------------------------------- ELEVATION PROFILE
   Profilo illustrativo (cumulativo per tappa, non un rilievo del
   terreno metro per metro): comunica dove si concentra la fatica.
   Legge TAPPE dal data.js della spedizione corrente.
---------------------------------------------------------- */
/* stato condiviso con updateElevationIndicator() (chiamata da gestisciMappa
   in initMap): punti/scala calcolati qui una volta sola, riletti lì a ogni
   cambio tappa invece di ricalcolarli o ridisegnare il resto del profilo. */
let ELEVATION_STATE = null;

function renderElevationProfile(){
  const el = document.getElementById('elevationProfile');
  if(!el) return;

  let km = 0, elevation = 0;
  const points = [{ km: 0, elevation: 0, step: TAPPE[0].step, nome: TAPPE[0].nome }];
  TAPPE.forEach((t, i) => {
    if(i === 0) return;
    km += t.km;
    elevation += t.elevation;
    points.push({ km, elevation, step: t.step, nome: t.nome });
  });

  const totalKm = km;
  const maxElevation = Math.max(...points.map(p => p.elevation));
  const W = 640, H = 172, padL = 8, padR = 8, padT = 26, padB = 38;
  const x = (km) => padL + (km / totalKm) * (W - padL - padR);
  const y = (elev) => padT + (1 - elev / maxElevation) * (H - padT - padB);

  const linePoints = points.map(p => `${x(p.km)},${y(p.elevation)}`).join(' ');
  const areaPoints = `${x(0)},${y(0)} ${linePoints} ${x(totalKm)},${y(0)}`;

  const dots = points.map(p => `
    <circle cx="${x(p.km)}" cy="${y(p.elevation)}" r="3.2" fill="#3E82C4" stroke="#F7F6F2" stroke-width="1.2"/>
    <text x="${x(p.km)}" y="${y(p.elevation) - 8}" text-anchor="middle" class="elevation-label elevation-label--value">${p.elevation.toLocaleString('it-IT')} m</text>
    <text x="${x(p.km)}" y="${H - 22}" text-anchor="middle" class="elevation-label elevation-label--step">${String(p.step).padStart(2, '0')}</text>
    <text x="${x(p.km)}" y="${H - 9}" text-anchor="middle" class="elevation-label elevation-label--km">${p.km} km</text>
  `).join('');

  // indicatore tappa attiva: parte sul primo punto (km 0), spostato poi da
  // updateElevationIndicator() man mano che si scorre — halo dietro, punto
  // pieno sopra, stesso ordine per la giusta sovrapposizione in SVG.
  const startX = x(points[0].km), startY = y(points[0].elevation);
  const indicator = `
    <circle class="elevation-indicator-halo" cx="${startX}" cy="${startY}" r="7"/>
    <circle class="elevation-indicator" cx="${startX}" cy="${startY}" r="3.6"/>
  `;

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="elevation-svg" role="img" aria-label="Profilo altimetrico cumulativo delle ${TAPPE.length} tappe">
      <line x1="${padL}" y1="${y(0)}" x2="${W - padR}" y2="${y(0)}" class="elevation-baseline"/>
      <polygon points="${areaPoints}" class="elevation-area"/>
      <polyline points="${linePoints}" class="elevation-line"/>
      ${dots}
      ${indicator}
    </svg>
  `;

  ELEVATION_STATE = { points, x, y };
}

/* Sposta l'indicatore sul profilo altimetrico in sincronia con la tappa
   attiva — chiamata da gestisciMappa() in initMap(), stesso momento in cui
   si aggiorna il marker attivo sulla mappa, nessun listener/observer nuovo.
   step 0 (overview) → primo punto; step = ultimoStep (riepilogo finale) →
   ultimo punto (nessuna tappa in points ha quello step, il fallback lo
   gestisce); altrimenti il punto (km, elevation) della tappa corrispondente. */
function updateElevationIndicator(step){
  if(!ELEVATION_STATE) return;
  const dot = document.querySelector('.elevation-indicator');
  const halo = document.querySelector('.elevation-indicator-halo');
  if(!dot || !halo) return;

  const { points, x, y } = ELEVATION_STATE;
  const target = step === 0 ? points[0] : (points.find(p => p.step === step) || points[points.length - 1]);

  dot.setAttribute('cx', x(target.km));
  dot.setAttribute('cy', y(target.elevation));
  halo.setAttribute('cx', x(target.km));
  halo.setAttribute('cy', y(target.elevation));
}